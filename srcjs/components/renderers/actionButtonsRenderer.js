import { forceCutRowContent } from '../../utils/rowUtils';

/**
 * Renderer that displays add/delete action buttons in a cell
 * Typically used in the last column of a table
 *
 * @param {Object} instance - Handsontable instance
 * @param {HTMLElement} td - Table cell element
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {string} prop - Property name
 * @param {*} value - Cell value
 * @param {Object} cellProps - Cell properties
 * @param {Function} onClearRow - Optional custom function to clear row content
 */
export function actionButtonsRenderer(
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProps,
  onClearRow = forceCutRowContent
) {
  td.innerHTML = "";
  td.className = (td.className || "") + " htCenter htMiddle";

  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.gap = "6px";
  wrap.style.justifyContent = "center";

  // Add button
  const addBtn = document.createElement("button");
  addBtn.title = "Add row below";
  addBtn.style.border = "none";
  addBtn.style.background = "transparent";
  addBtn.style.cursor = "pointer";
  addBtn.style.display = "flex";
  addBtn.style.alignItems = "center";
  addBtn.style.justifyContent = "center";

  addBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
         viewBox="0 0 24 24" fill="none" stroke="#bbbbbb"
         stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `;
  addBtn.addEventListener("mousedown", (e) => e.stopPropagation());
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    instance.alter("insert_row_below", row, 1);
  });

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.title = "Delete row";
  delBtn.style.border = "none";
  delBtn.style.background = "transparent";
  delBtn.style.cursor = "pointer";
  delBtn.style.display = "flex";
  delBtn.style.alignItems = "center";
  delBtn.style.justifyContent = "center";

  delBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
         viewBox="0 0 24 24" fill="none" stroke="#c0392b"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>
  `;
  delBtn.addEventListener("mousedown", (e) => e.stopPropagation());
  delBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rowCount = instance.countRows();
    if (rowCount === 1) {
      // Can't delete the last row, just clear it
      try {
        onClearRow(instance, 0);
      } catch {
        const rowData = instance.getSourceDataAtRow(0);
        if (rowData && typeof rowData === "object") {
          Object.keys(rowData).forEach((k) => (rowData[k] = null));
          instance.render();
        }
      }
    } else {
      instance.alter("remove_row", row, 1);
    }
  });

  wrap.appendChild(addBtn);
  wrap.appendChild(delBtn);
  td.appendChild(wrap);
  return td;
}

/**
 * Creates an action buttons renderer with custom handlers
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onAdd - Custom add row handler (row, instance) => void
 * @param {Function} options.onDelete - Custom delete row handler (row, instance) => void
 * @param {boolean} options.showAdd - Whether to show add button (default: true)
 * @param {boolean} options.showDelete - Whether to show delete button (default: true)
 * @returns {Function} Renderer function
 */
export function createActionButtonsRenderer(options = {}) {
  const {
    onAdd = null,
    onDelete = null,
    showAdd = true,
    showDelete = true
  } = options;

  return function(instance, td, row, col, prop, value, cellProps) {
    td.innerHTML = "";
    td.className = (td.className || "") + " htCenter htMiddle";

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.gap = "6px";
    wrap.style.justifyContent = "center";

    if (showAdd) {
      const addBtn = document.createElement("button");
      addBtn.title = "Add row below";
      addBtn.style.border = "none";
      addBtn.style.background = "transparent";
      addBtn.style.cursor = "pointer";
      addBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
             viewBox="0 0 24 24" fill="none" stroke="#bbbbbb"
             stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      `;
      addBtn.addEventListener("mousedown", (e) => e.stopPropagation());
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAdd) {
          onAdd(row, instance);
        } else {
          instance.alter("insert_row_below", row, 1);
        }
      });
      wrap.appendChild(addBtn);
    }

    if (showDelete) {
      const delBtn = document.createElement("button");
      delBtn.title = "Delete row";
      delBtn.style.border = "none";
      delBtn.style.background = "transparent";
      delBtn.style.cursor = "pointer";
      delBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
             viewBox="0 0 24 24" fill="none" stroke="#c0392b"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
        </svg>
      `;
      delBtn.addEventListener("mousedown", (e) => e.stopPropagation());
      delBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
          onDelete(row, instance);
        } else {
          const rowCount = instance.countRows();
          if (rowCount > 1) {
            instance.alter("remove_row", row, 1);
          }
        }
      });
      wrap.appendChild(delBtn);
    }

    td.appendChild(wrap);
    return td;
  };
}
