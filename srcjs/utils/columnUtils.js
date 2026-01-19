/**
 * Column header utilities for Handsontable
 */

/**
 * Creates a column header hook that adds tooltips from a descriptions object
 *
 * @param {Object} columnDescriptions - Object mapping column names to descriptions
 * @returns {Function} Hook function for Handsontable's afterGetColHeader
 *
 * @example
 * const descriptions = {
 *   name: "The item's display name",
 *   category: "Category for grouping items"
 * };
 *
 * <HotTable
 *   afterGetColHeader={createColumnHeaderHook(descriptions)}
 *   ...
 * />
 */
export function createColumnHeaderHook(columnDescriptions = {}) {
  return function(col, TH) {
    // Get the header text
    const headerText = TH.querySelector('.colHeader')?.textContent || TH.textContent;

    // Skip if no header text or if it's the Actions column
    if (!headerText || headerText === 'Actions') {
      return;
    }

    // Get description for this column
    const description = columnDescriptions[headerText];

    if (description) {
      TH.setAttribute('title', description);
      TH.style.cursor = 'help';
    }
  };
}

/**
 * Generates column settings from a column configuration array
 *
 * @param {Array} columns - Array of column configuration objects
 * @returns {Array} Handsontable-compatible column settings
 *
 * @example
 * const columns = [
 *   { name: "id", type: "text" },
 *   { name: "active", type: "checkbox" },
 *   { name: "category", type: "dropdown", source: ["A", "B"] }
 * ];
 *
 * const settings = generateColumnSettings(columns);
 */
export function generateColumnSettings(columns) {
  return columns.map(col => {
    const settings = {
      data: col.name,
      type: col.type || 'text'
    };

    // Add dropdown source if provided
    if (col.source) {
      settings.source = col.source;
    }

    // Add read-only setting
    if (col.readOnly === true) {
      settings.readOnly = true;
    }

    // Add width if provided
    if (col.width) {
      settings.width = col.width;
    }

    return settings;
  });
}
