/**
 * MultiSelectEditor - Handsontable custom editor for multi-select dropdowns
 */
import React from "react";
import { BaseEditorComponent } from "@handsontable/react";
import MultiSelectModal from "./MultiSelectModal";
import { splitOutsideQuotes } from "../utils/dataUtils";
import { getOptions } from "../store/optionsStore";

class MultiSelectEditor extends BaseEditorComponent {
  constructor(props) {
    super(props);

    this.editorRef = React.createRef(null);

    this.state = {
      renderResult: null,
      value: null,
      modalVisible: false,
      cellData: null,
      currentOptions: null
    };

    this._originalFinishEditing = super.finishEditing.bind(this);
  }

  stopMousedownPropagation(e) {
    e.stopPropagation();
  }

  setValue(value, callback) {
    this.setState({ value: value }, callback);
  }

  setCellData(value, callback) {
    this.setState({ cellData: value }, callback);
  }

  getValue() {
    return this.state.value;
  }

  open() {
    // Capture current options at open time to ensure latest data
    let latestOptions = this.props.options;

    // If store keys are provided, fetch from store for latest data
    if (this.props.storeKey && this.props.optionKey) {
      const storeState = getOptions();
      const tableState = storeState[this.props.storeKey];

      if (tableState && tableState[this.props.optionKey]) {
        const rawOptions = tableState[this.props.optionKey];
        latestOptions = this.props.transformOptions
          ? this.props.transformOptions(rawOptions)
          : rawOptions;
      }
    }

    this.setState({
      modalVisible: true,
      currentOptions: latestOptions
    });
  }

  close() {
    this.setState({
      modalVisible: false,
      currentOptions: null
    });
  }

  finishEditing() {
    if (!this.state.modalVisible) {
      this._originalFinishEditing(false, false);
    }
  }

  prepare(row, col, prop, td, originalValue, cellProperties) {
    super.prepare(row, col, prop, td, originalValue, cellProperties);
    this.setState({
      cellData: {
        originalValue,
        row,
        col
      }
    });
  }

  /**
   * Convert string value to array
   * @param {*} value - Value to convert
   * @param {boolean} smartQuotes - Whether to handle quoted values
   */
  convertToArray(value, smartQuotes = false) {
    if (typeof value === "string" && value.length !== 0) {
      if (smartQuotes) {
        const matches = splitOutsideQuotes(value);
        return matches.length > 0
          ? matches.map(s => {
              const trimmed = s.trim();
              return /^".*"$/.test(trimmed) ? trimmed : `"${trimmed}"`;
            })
          : [`"${value.trim()}"`];
      } else {
        return value
          .split(",")
          .map(s => s.trim())
          .filter(s => s !== "");
      }
    }
    return Array.isArray(value) ? value : [];
  }

  saveChanges(values) {
    const newValue = values.length > 0 ? values.join(", ") : null;

    if (this.props.onSave) {
      this.props.onSave(
        values,
        this.state.cellData.col,
        this.state.cellData.row,
        this.state.cellData.originalValue
      );
    }

    // Update the editor value so getValue() returns the new selection,
    // close the modal so finishEditing's guard passes, then complete
    // Handsontable's editor lifecycle in the setState callback (after
    // state has actually been flushed).
    this.setState(
      {
        value: newValue,
        modalVisible: false,
        currentOptions: null,
      },
      () => {
        this._originalFinishEditing(false, false);
      }
    );
  }

  render() {
    if (!this.props.isEditor) {
      // Renderer mode - just display the value
      const displayValue = Array.isArray(this.props.value)
        ? this.props.value.join(", ")
        : this.props.value;
      return displayValue;
    }

    // Editor mode - show modal
    return (
      <div
        style={this.editorContainerStyle}
        ref={this.editorRef}
        onMouseDown={this.stopMousedownPropagation}
      >
        <MultiSelectModal
          open={this.state.modalVisible}
          onClose={this.close.bind(this)}
          options={this.state.currentOptions || this.props.options}
          selectedValues={
            this.convertToArray(this.state.value, this.props.smartQuotes) || []
          }
          onSave={this.saveChanges.bind(this)}
          sortable={this.props.sortable}
          title={this.props.title || `Select ${this.props.columnName}`}
          label={this.props.label || this.props.columnName}
          showSecondaryText={this.props.showSecondaryText}
          secondaryTextMap={this.props.secondaryTextMap}
        />
      </div>
    );
  }
}

export default MultiSelectEditor;
