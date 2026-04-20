import { autocompleteRenderer } from 'handsontable/renderers';

/**
 * Renderer for dropdown cells that validates values against available options
 * Shows red background and tooltip when value is not in the options list
 *
 * @param {Object} instance - Handsontable instance
 * @param {HTMLElement} td - Table cell element
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {string} prop - Property name
 * @param {*} value - Cell value
 * @param {Object} cellProperties - Cell properties including source (dropdown options)
 */
export function dropdownValidationRenderer(
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) {
  autocompleteRenderer.apply(this, arguments);

  // Get the valid dropdown options
  const validSource = cellProperties.source || [];

  // Skip validation for empty values
  if (value === null || value === undefined || value === '') {
    td.style.background = "#ffffff";
    td.title = '';
    return td;
  }

  // Check if the value exists in the dropdown options
  const isValid = validSource.includes(value);

  if (!isValid) {
    // Highlight in red if value doesn't match dropdown options
    td.style.background = "#ffbeba";
    td.style.color = "#000000";
    td.title = `Warning: "${value}" is not in the available options list. This value may be invalid.`;
  } else {
    // Valid value - normal background
    td.style.background = "#ffffff";
    td.title = '';
  }

  return td;
}

/**
 * Renderer for dropdown cells with validation against a specific column's options
 * Use this when you need to show which column/tab the value should come from
 *
 * @param {string} columnLabel - Human-readable label for the column
 * @param {string} tabLabel - Human-readable label for the tab/section
 * @returns {Function} Renderer function
 */
export function createDropdownValidationRenderer(columnLabel, tabLabel) {
  return function(instance, td, row, col, prop, value, cellProperties) {
    autocompleteRenderer.apply(this, arguments);

    const validSource = cellProperties.source || [];

    if (value && !validSource.includes(value)) {
      td.style.background = "#ffbeba";
      td.title = `${columnLabel} "${value}" is not present in the '${tabLabel}' options!`;
    } else {
      td.style.background = "#ffffff";
      td.title = "";
    }

    return td;
  };
}
