# esq.handsontable 1.0.0

## Initial CRAN Release

### Features

* `esq_tableInput()` - Create interactive data tables in Shiny
* `updateEsqTable()` - Dynamically update dropdown options at runtime

### Column Types

* **text** - Standard text input
* **numeric** - Number input with validation
* **checkbox** - Boolean checkbox cells
* **dropdown** - Single-select dropdown with validation
* **multiselect** - Multi-select dropdown with optional drag-and-drop sorting

### Additional Features

* Conditional cell properties - Disable cells based on other cell values
* Column tooltips - Add helpful descriptions to column headers
* Context menu - Right-click to add/remove rows
* Validation - Visual feedback for invalid dropdown values
* Dynamic updates - Change dropdown options without recreating the table
