/**
 * esq.handsontable - Main entry point
 * A powerful, reusable Handsontable wrapper for R Shiny applications
 */
import 'regenerator-runtime/runtime';
import { reactShinyInput } from 'reactR';
import { useState, useEffect } from 'react';
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
    optionKey: col.optionKey
  }));
}

/**
 * Main Table Input component for Shiny binding
 */
const TableInput = ({ configuration, value, setValue }) => {
  // Parse configuration
  const tableKey = configuration.table_key || 'default';
  const columns = parseColumnConfig(configuration.columns);
  const columnDescriptions = configuration.column_descriptions || {};
  const showActionButtons = configuration.show_action_buttons !== false;
  const contextMenu = configuration.context_menu !== false;
  const noneValue = configuration.none_value || '--NONE--';
  const height = configuration.height || '100%';
  const width = configuration.width || '100%';

  // Parse data
  const initialData = value ? base64ToUtf8Json(value) : [];

  // Get array columns for processing
  const arrayColumns = columns
    .filter(col => col.type === 'multiselect')
    .map(col => col.name);

  // Process data if needed
  const processedData = processShinyData(initialData, arrayColumns);

  // Update options store when configuration changes
  useEffect(() => {
    if (configuration.options) {
      const processedOptions = {};
      Object.entries(configuration.options).forEach(([key, val]) => {
        processedOptions[key] = validateVectorInputR(val);
      });
      setOptions(tableKey, processedOptions);
    }
  }, [configuration.options, tableKey]);

  // Handle data changes
  const handleDataChange = (data) => {
    if (typeof Shiny !== 'undefined') {
      Shiny.setInputValue(
        `${configuration.shiny_el_id_name}_edited`,
        JSON.stringify(data),
        { priority: "event" }
      );
    }
  };

  // Build getCellProperties function from configuration
  const getCellProperties = configuration.cell_conditions
    ? (row, col, prop, tableData) => {
        const conditions = configuration.cell_conditions;
        const props = {};

        // Check each condition
        conditions.forEach(condition => {
          if (condition.column === prop) {
            // Evaluate condition based on another column's value
            if (condition.when_column && condition.when_value !== undefined) {
              const checkCol = condition.when_column;
              const rowData = tableData[row];
              if (rowData) {
                const actualValue = rowData[columns.findIndex(c => c.name === checkCol)];
                const matches = condition.when_value === actualValue ||
                  (Array.isArray(condition.when_value) && condition.when_value.includes(actualValue)) ||
                  (condition.when_value_lower && actualValue?.toLowerCase() === condition.when_value_lower);

                if (matches) {
                  if (condition.readOnly !== undefined) props.readOnly = condition.readOnly;
                  if (condition.type !== undefined) props.type = condition.type;
                  if (condition.source !== undefined) props.source = validateVectorInputR(condition.source);
                }
              }
            }
          }
        });

        return props;
      }
    : undefined;

  return (
    <div className="esq-handsontable-container">
      <EsqTable
        data={processedData}
        columns={columns}
        onDataChange={handleDataChange}
        showActionButtons={showActionButtons}
        contextMenu={contextMenu}
        noneValue={noneValue}
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
