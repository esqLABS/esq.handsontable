/**
 * esq.handsontable - Main entry point
 * A Handsontable wrapper for R Shiny applications
 */
import 'regenerator-runtime/runtime';
import { reactShinyInput } from 'reactR';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './index.css';

// Components
import EsqTable from './components/EsqTable';

// Store
import { setOptions } from './store/optionsStore';

// Utils
import { base64ToUtf8Json, validateVectorInputR, processShinyData } from './utils/dataUtils';

/**
 * Parse column configuration from Shiny
 * Converts R list format to JavaScript column config
 */
function parseColumnConfig(config) {
  if (!config || !Array.isArray(config)) return [];

  return config.map(col => ({
    name: col.name,
    type: col.type || 'text',
    source: col.source ? validateVectorInputR(col.source) : undefined,
    sortable: col.sortable || false,
    validate: col.validate !== false,
    readOnly: col.readOnly || false,
    width: col.width,
    title: col.title,
    label: col.label,
    smartQuotes: col.smartQuotes || false,
    showSecondaryText: col.showSecondaryText || false,
    secondaryTextMap: col.secondaryTextMap || {},
    storeKey: col.storeKey,
    optionKey: col.optionKey,
    dateFormat: col.dateFormat,
    correctFormat: col.correctFormat,
    defaultDate: col.defaultDate
  }));
}

/**
 * Main Table Input component for Shiny binding
 */
const TableInput = ({ configuration, value, setValue }) => {
  // Parse configuration
  const tableKey = configuration.table_key || 'default';
  const baseColumns = useMemo(() => parseColumnConfig(configuration.columns), [configuration.columns]);

  // Accumulate options across updateEsqTable calls. reactR shallow-merges the
  // message into configuration, so sending { options: { status: [...] } }
  // would otherwise overwrite a previously sent { category: [...] }.
  const mergedOptionsRef = useRef({});
  const [mergedOptions, setMergedOptions] = useState({});
  useEffect(() => {
    const opts = configuration.options;
    if (!opts || Array.isArray(opts)) return;
    const next = { ...mergedOptionsRef.current, ...opts };
    mergedOptionsRef.current = next;
    setMergedOptions(next);
  }, [configuration.options]);

  // Merge dynamic options (from updateEsqTable) into column sources so that
  // both dropdown and multiselect columns pick up the latest options without
  // requiring the caller to resend the full column config.
  const columns = useMemo(() => {
    if (!mergedOptions || Object.keys(mergedOptions).length === 0) return baseColumns;
    return baseColumns.map(col => {
      const colOpts = mergedOptions[col.name];
      if (colOpts) {
        return { ...col, source: validateVectorInputR(colOpts) };
      }
      return col;
    });
  }, [baseColumns, mergedOptions]);

  const columnDescriptions = configuration.column_descriptions || {};
  const showActionButtons = configuration.show_action_buttons !== false;
  // context_menu from R: TRUE → true (all defaults), FALSE → false (disabled),
  // character vector → array of item names (order preserved). A single-element
  // R character vector may arrive as a bare string after jsonlite auto_unbox.
  const rawContextMenu = configuration.context_menu;
  let contextMenu;
  if (Array.isArray(rawContextMenu)) {
    contextMenu = rawContextMenu;
  } else if (typeof rawContextMenu === 'string') {
    contextMenu = [rawContextMenu];
  } else {
    contextMenu = rawContextMenu !== false;
  }
  const height = configuration.height || '100%';
  const width = configuration.width || '100%';

  // Track data source — prefer configuration.data (from updateEsqTable) over
  // value (initial default from createReactShinyInput).  When R calls
  // session$sendInputMessage the message keys are merged into configuration
  // by reactR, so updated data arrives as configuration.data (base64).
  const rawData = configuration.data || value;

  // data_nonce changes on every updateEsqTable(data=...) call, forcing a
  // re-parse even when the base64 payload is byte-identical (e.g. resetting
  // to initial_data after the user added/removed rows, which Handsontable
  // mutates in place without changing the array reference).
  const dataNonce = configuration.data_nonce;

  // Parse data
  const initialData = useMemo(() => {
    return rawData ? base64ToUtf8Json(rawData) : [];
  }, [rawData, dataNonce]);

  // Get array columns for processing
  const arrayColumns = useMemo(
    () => columns.filter(col => col.type === 'multiselect').map(col => col.name),
    [columns]
  );

  // Process data if needed
  const processedData = useMemo(
    () => processShinyData(initialData, arrayColumns),
    [initialData, arrayColumns]
  );

  // Update options store when merged options change
  useEffect(() => {
    if (mergedOptions && Object.keys(mergedOptions).length > 0) {
      const processedOptions = {};
      Object.entries(mergedOptions).forEach(([key, val]) => {
        processedOptions[key] = validateVectorInputR(val);
      });
      setOptions(tableKey, processedOptions);
    }
  }, [mergedOptions, tableKey]);

  // Handle data changes — send edited data back to Shiny
  const handleDataChange = useCallback((data) => {
    if (typeof Shiny !== 'undefined') {
      Shiny.setInputValue(
        `${configuration.shiny_el_id_name}_edited`,
        JSON.stringify(data),
        { priority: "event" }
      );
    }
  }, [configuration.shiny_el_id_name]);

  // Build getCellProperties function from configuration.
  // Also pre-compute the set of columns that are targets of any condition so
  // we can explicitly reset readOnly/renderer when no condition fires (otherwise
  // Handsontable keeps the last-applied cell meta and the cell stays locked).
  const getCellProperties = useMemo(() => {
    if (!configuration.cell_conditions) return undefined;

    const conditions = configuration.cell_conditions;

    // Columns that can be affected by at least one condition
    const conditionTargets = new Set(conditions.map(c => c.column));

    return (row, col, prop, tableData, columnNames) => {
      const props = {};
      let anyMatch = false;

      conditions.forEach(condition => {
        if (condition.column === prop) {
          if (condition.when_column && condition.when_value !== undefined) {
            const checkCol = condition.when_column;
            const rowData = tableData[row];
            if (rowData) {
              // rowData from hot.getData() is an array; look up by column index
              const colIndex = columnNames.indexOf(checkCol);
              const actualValue = colIndex >= 0 ? rowData[colIndex] : undefined;
              const matches = condition.when_value === actualValue ||
                (Array.isArray(condition.when_value) && condition.when_value.includes(actualValue)) ||
                (condition.when_value_lower && actualValue?.toLowerCase() === condition.when_value_lower);

              if (matches) {
                anyMatch = true;
                if (condition.readOnly !== undefined) props.readOnly = condition.readOnly;
                if (condition.type !== undefined) props.type = condition.type;
                if (condition.source !== undefined) props.source = validateVectorInputR(condition.source);
              }
            }
          }
        }
      });

      // If this column is a condition target but no condition matched,
      // explicitly reset readOnly so Handsontable clears the previous meta.
      if (!anyMatch && conditionTargets.has(prop)) {
        props.readOnly = false;
      }

      return props;
    };
  }, [configuration.cell_conditions]);

  return (
    <div className="esq-handsontable-container">
      <EsqTable
        data={processedData}
        columns={columns}
        onDataChange={handleDataChange}
        showActionButtons={showActionButtons}
        contextMenu={contextMenu}
        columnDescriptions={columnDescriptions}
        height={height}
        width={width}
        getCellProperties={getCellProperties}
      />
    </div>
  );
};

/**
 * Initialize Shiny input binding
 */
export default function initEsqTable() {
  return reactShinyInput(
    ".esq_table_",
    "esq.handsontable.esq_table_",
    TableInput
  );
}

// Auto-initialize
initEsqTable();
