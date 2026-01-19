/**
 * esq.handsontable - Export all modules
 *
 * This file can be used for importing components directly
 * when not using the Shiny integration
 */

// Main component
export { default as EsqTable } from './components/EsqTable';

// Renderers
export {
  readOnlyRenderer,
  invalidCellRenderer,
  dropdownValidationRenderer,
  createDropdownValidationRenderer,
  actionButtonsRenderer,
  createActionButtonsRenderer
} from './components/renderers';

// Editors
export { default as MultiSelectEditor } from './editors/MultiSelectEditor';
export { default as MultiSelectModal } from './editors/MultiSelectModal';

// Store
export {
  setOptions,
  getOptions,
  getTableOptions,
  subscribeOptions,
  clearOptions,
  clearTableOptions
} from './store/optionsStore';
export { useOptions, useOption } from './store/useOptions';
export { withOptions } from './store/withOptions';

// Utils
export {
  validateVectorInputR,
  splitOutsideQuotes,
  wrapIntoQuotes,
  wrapObjectKeysIntoQuotes,
  base64ToUtf8Json,
  decodeHtmlEntities,
  processShinyData,
  prepareShinyData
} from './utils/dataUtils';

export {
  forceCutRowContent,
  clearRowData
} from './utils/rowUtils';

export {
  createColumnHeaderHook,
  generateColumnSettings
} from './utils/columnUtils';
