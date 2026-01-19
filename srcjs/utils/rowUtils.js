/**
 * Row manipulation utilities for Handsontable
 */

/**
 * Clears all cell content in a row, temporarily disabling read-only cells
 * @param {Object} hot - Handsontable instance
 * @param {number} rowIndex - Index of row to clear
 */
export function forceCutRowContent(hot, rowIndex) {
  if (!hot) return;

  const colCount = hot.countCols();
  let readOnlyColumns = [];

  // Temporarily disable read-only mode
  for (let col = 0; col < colCount; col++) {
    let cellMeta = hot.getCellMeta(rowIndex, col);

    if (cellMeta.readOnly) {
      readOnlyColumns.push(col);
      hot.setCellMeta(rowIndex, col, "readOnly", false);
    }
  }

  // Select the entire row before performing the cut operation
  hot.selectCells([[rowIndex, 0, rowIndex, colCount - 1]]);

  // Perform the cut operation with a small delay
  setTimeout(() => {
    hot.getPlugin("CopyPaste").cut();

    // Restore read-only state after cutting
    setTimeout(() => {
      readOnlyColumns.forEach((col) => {
        hot.setCellMeta(rowIndex, col, "readOnly", true);
      });
      hot.render();
    }, 50);
  }, 50);
}

/**
 * Clears all data in a row by setting values to null
 * Alternative to forceCutRowContent that doesn't use clipboard
 * @param {Object} hot - Handsontable instance
 * @param {number} rowIndex - Index of row to clear
 */
export function clearRowData(hot, rowIndex) {
  if (!hot) return;

  const colCount = hot.countCols();
  const changes = [];

  for (let col = 0; col < colCount; col++) {
    const cellMeta = hot.getCellMeta(rowIndex, col);
    // Skip action buttons column (typically readOnly with no data property)
    if (!cellMeta.readOnly || cellMeta.data) {
      changes.push([rowIndex, col, null]);
    }
  }

  if (changes.length > 0) {
    hot.setDataAtCell(changes);
  }
}
