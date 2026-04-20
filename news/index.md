# Changelog

## esq.handsontable 1.0.0

### Initial Release

#### Functions

- [`esq_tableInput()`](https://esqlabs.github.io/esq.handsontable/reference/esq_tableInput.md) -
  Create interactive data tables in Shiny
- [`updateEsqTable()`](https://esqlabs.github.io/esq.handsontable/reference/updateEsqTable.md) -
  Dynamically update data, dropdown options, or column configuration at
  runtime

#### Column Types

- **text** - Standard text input
- **numeric** - Number input with validation
- **checkbox** - Boolean checkbox cells
- **dropdown** - Single-select dropdown with validation
- **multiselect** - Multi-select dropdown with optional drag-and-drop
  sorting
- **date** - Calendar picker (Pikaday); configurable via `dateFormat`
  (default `"YYYY-MM-DD"`), `correctFormat`, and `defaultDate`

#### Features

- Conditional cell properties - disable or re-type cells based on other
  cell values
- Column tooltips - helpful descriptions on column headers
- Validation - visual feedback when dropdown values fall outside the
  source
- Customizable right-click context menu - insert row above/below, remove
  row, undo/redo, copy, clear selection, clear column. `context_menu`
  accepts `TRUE`, `FALSE`, or a character vector of item names for
  fine-grained control (use `"---"` for separators)
- Action buttons column - add/delete buttons in each row
- Cumulative option updates - calling `updateEsqTable(options = ...)`
  merges with previously sent options rather than replacing them, so
  per-column updates can be issued independently
