/**
 * EsqTable - A configurable Handsontable wrapper component
 *
 * Features:
 * - Declarative column configuration
 * - Checkboxes, dropdowns, multi-select dropdowns
 * - Conditional cell disabling
 * - Dropdown validation with visual feedback
 * - Context menu with add/remove row actions
 * - Action buttons column
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { HotTable, HotColumn } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";

// Renderers
import {
  readOnlyRenderer,
  dropdownValidationRenderer,
  actionButtonsRenderer
} from "./renderers";

// Editors
import MultiSelectEditor from "../editors/MultiSelectEditor";

// Utils
import { forceCutRowContent } from "../utils/rowUtils";
import { createColumnHeaderHook } from "../utils/columnUtils";
import { prepareShinyData, processShinyData } from "../utils/dataUtils";

// Register Handsontable modules
registerAllModules();

/**
 * Default context menu configuration
 */
function createContextMenu(forceCutFn) {
  return {
    items: {
      'cut': {
        name: 'Clear'
      },
      'row_below': {},
      'row_above': {},
      'remove_row': {
        name() {
          if (this.countRows() === 1 && this.getSelectedLast()[0] === 0) {
            return "Clear row content";
          }
          return "Remove row";
        },
        callback(key, selection) {
          const selectedRow = this.getSelectedLast()[0];

          if (this.countRows() === 1 && selectedRow === 0) {
            forceCutFn(this, selectedRow);
          } else {
            const startRow = selection[0].start.row;
            const endRow = selection[0].end.row;
            let numberOfRowsToRemove = endRow - startRow + 1;

            if (this.countRows() === numberOfRowsToRemove) {
              numberOfRowsToRemove = numberOfRowsToRemove - 1;
            }

            this.alter("remove_row", startRow, numberOfRowsToRemove);
          }
        }
      }
    }
  };
}

/**
 * Get renderer based on column type and validation settings
 */
function getRenderer(column) {
  if (column.renderer) {
    return column.renderer;
  }

  if (column.type === 'dropdown' && column.validate !== false) {
    return dropdownValidationRenderer;
  }

  return undefined;
}

/**
 * EsqTable Component
 *
 * @param {Object} props
 * @param {Array} props.data - Array of row objects
 * @param {Array} props.columns - Column configuration array
 * @param {Function} props.onDataChange - Callback when data changes
 * @param {boolean} props.showActionButtons - Whether to show action buttons column
 * @param {boolean} props.contextMenu - Whether to enable context menu
 * @param {string} props.noneValue - Value to use for empty dropdown selection
 * @param {Object} props.columnDescriptions - Object mapping column names to tooltip descriptions
 * @param {string} props.height - Table height (default: "100%")
 * @param {string} props.width - Table width (default: "100%")
 * @param {Function} props.getCellProperties - Function to get dynamic cell properties (row, col, prop) => {}
 */
function EsqTable(props) {
  const {
    data: initialData,
    columns = [],
    onDataChange,
    showActionButtons = true,
    contextMenu = true,
    noneValue = "--NONE--",
    columnDescriptions = {},
    height = "100%",
    width = "100%",
    getCellProperties,
    licenseKey = "non-commercial-and-evaluation"
  } = props;

  // Initialize data state
  const [data, setData] = useState(() => {
    if (!initialData || initialData.length === 0) {
      // Create empty row with all column keys
      const emptyRow = {};
      columns.forEach(col => {
        emptyRow[col.name] = null;
      });
      return [emptyRow];
    }
    return initialData;
  });

  const hotTableRef = useRef(null);

  // Get column names
  const columnNames = useMemo(() => columns.map(col => col.name), [columns]);

  // Get array columns for data processing
  const arrayColumns = useMemo(
    () => columns.filter(col => col.type === 'multiselect').map(col => col.name),
    [columns]
  );

  // Column header hook with descriptions
  const colHeaderHook = useMemo(
    () => createColumnHeaderHook(columnDescriptions),
    [columnDescriptions]
  );

  // Handle data changes
  const handleBeforeChange = useCallback((changes, source) => {
    if (!changes || changes.length === 0) return;

    const [row, prop, oldValue, newValue] = changes[0];

    // Skip if no actual change
    if (data[row]?.[prop] === newValue) return;

    // Handle NONE value conversion
    setTimeout(() => {
      const column = columns.find(c => c.name === prop);
      if (column?.type === 'dropdown' && newValue === noneValue) {
        data[row][prop] = null;
      }

      if (onDataChange) {
        onDataChange(prepareShinyData(data, arrayColumns, noneValue));
      }
    }, 100);
  }, [data, columns, noneValue, arrayColumns, onDataChange]);

  // Handle row operations
  const handleAfterRemoveRow = useCallback(() => {
    if (onDataChange) {
      onDataChange(prepareShinyData(data, arrayColumns, noneValue));
    }
  }, [data, arrayColumns, noneValue, onDataChange]);

  const handleAfterCreateRow = useCallback(() => {
    if (!Object.keys(data[0]).length) {
      const emptyRow = {};
      columns.forEach(col => {
        emptyRow[col.name] = null;
      });
      setData([emptyRow]);
      if (onDataChange) {
        onDataChange([emptyRow]);
      }
    } else {
      if (onDataChange) {
        onDataChange(prepareShinyData(data, arrayColumns, noneValue));
      }
    }
  }, [data, columns, arrayColumns, noneValue, onDataChange]);

  // Apply conditional cell properties
  useEffect(() => {
    if (!getCellProperties || !hotTableRef.current?.hotInstance) return;

    const hot = hotTableRef.current.hotInstance;

    hot.updateSettings({
      cells(row, col) {
        const prop = columnNames[col];
        if (!prop) return {};

        const column = columns.find(c => c.name === prop);
        if (!column) return {};

        // Get dynamic properties from user function
        const dynamicProps = getCellProperties(row, col, prop, hot.getData());

        // Build cell properties
        const cellProps = {};

        // Handle readOnly
        if (dynamicProps.readOnly !== undefined) {
          cellProps.readOnly = dynamicProps.readOnly;
          if (dynamicProps.readOnly) {
            cellProps.renderer = readOnlyRenderer;
          }
        }

        // Handle type changes
        if (dynamicProps.type) {
          cellProps.type = dynamicProps.type;
        }

        // Handle source changes for dropdowns
        if (dynamicProps.source) {
          cellProps.source = dynamicProps.source;
        }

        // Handle custom renderer
        if (dynamicProps.renderer) {
          cellProps.renderer = dynamicProps.renderer;
        } else if (!cellProps.readOnly && column.type === 'dropdown' && column.validate !== false) {
          cellProps.renderer = dropdownValidationRenderer;
        }

        return cellProps;
      }
    });
  }, [getCellProperties, columns, columnNames]);

  // Handle multi-select data submission
  const handleMultiSelectSave = useCallback((values, col, row, originalValue) => {
    const prop = columnNames[col];
    if (prop && data[row]) {
      data[row][prop] = values.length > 0 ? values.join(", ") : null;
      if (onDataChange) {
        onDataChange(prepareShinyData(data, arrayColumns, noneValue));
      }
    }
  }, [data, columnNames, arrayColumns, noneValue, onDataChange]);

  // Build column headers
  const colHeaders = useMemo(() => {
    const headers = [...columnNames];
    if (showActionButtons) {
      headers.push("Actions");
    }
    return headers;
  }, [columnNames, showActionButtons]);

  // Build context menu config
  const contextMenuConfig = useMemo(
    () => contextMenu ? createContextMenu(forceCutRowContent) : false,
    [contextMenu]
  );

  return (
    <HotTable
      ref={hotTableRef}
      data={data}
      colHeaders={colHeaders}
      afterGetColHeader={colHeaderHook}
      rowHeaders={true}
      autoWrapRow={true}
      autoWrapCol={true}
      width={width}
      height={height}
      licenseKey={licenseKey}
      contextMenu={contextMenuConfig}
      beforeChange={handleBeforeChange}
      afterRemoveRow={handleAfterRemoveRow}
      afterCreateRow={handleAfterCreateRow}
    >
      {columns.map((column, index) => {
        const settings = {
          data: column.name,
          type: column.type === 'multiselect' ? 'text' : (column.type || 'text')
        };

        // Add dropdown source with NONE option
        if (column.type === 'dropdown' && column.source) {
          settings.source = [noneValue, ...column.source];
          settings.renderer = getRenderer(column);
        }

        // Add checkbox type
        if (column.type === 'checkbox') {
          settings.type = 'checkbox';
        }

        // Add numeric type
        if (column.type === 'numeric') {
          settings.type = 'numeric';
        }

        // Add width if specified
        if (column.width) {
          settings.width = column.width;
        }

        // Add readOnly if specified
        if (column.readOnly === true) {
          settings.readOnly = true;
        }

        // Handle multiselect columns
        if (column.type === 'multiselect') {
          return (
            <HotColumn
              key={column.name}
              settings={settings}
            >
              <MultiSelectEditor
                hot-editor
                isEditor={true}
                options={column.source || []}
                sortable={column.sortable || false}
                columnName={column.name}
                title={column.title || `Select ${column.name}`}
                label={column.label || column.name}
                smartQuotes={column.smartQuotes || false}
                showSecondaryText={column.showSecondaryText || false}
                secondaryTextMap={column.secondaryTextMap || {}}
                storeKey={column.storeKey}
                optionKey={column.optionKey}
                transformOptions={column.transformOptions}
                onSave={handleMultiSelectSave}
              />
            </HotColumn>
          );
        }

        return (
          <HotColumn
            key={column.name}
            settings={settings}
          />
        );
      })}

      {/* Action buttons column */}
      {showActionButtons && (
        <HotColumn
          width={90}
          readOnly={true}
          renderer={(instance, td, row, col, prop, value, cellProps) =>
            actionButtonsRenderer(instance, td, row, col, prop, value, cellProps, forceCutRowContent)
          }
        />
      )}
    </HotTable>
  );
}

export default EsqTable;
