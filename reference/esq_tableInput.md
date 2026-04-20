# Create an esq.handsontable widget

Creates an interactive, Excel-like data table using Handsontable.
Supports text, numeric, checkbox, dropdown, multi-select, and date
columns with features like validation, conditional cell disabling,
calendar pickers, and more.

## Usage

``` r
esq_tableInput(
  inputId,
  data = NULL,
  columns = list(),
  options = list(),
  column_descriptions = list(),
  show_action_buttons = TRUE,
  context_menu = TRUE,
  none_value = "--NONE--",
  height = "100%",
  width = "100%",
  cell_conditions = list()
)
```

## Arguments

- inputId:

  The input slot that will be used to access the value.

- data:

  A data frame containing the initial data to display.

- columns:

  A list of column configurations (see Details).

- options:

  A named list of dropdown options that can be referenced by columns.

- column_descriptions:

  A named list of column descriptions for tooltips.

- show_action_buttons:

  Whether to show add/delete buttons column (default: TRUE).

- context_menu:

  Controls the right-click context menu. Accepts:

  - `TRUE` (default) - show all built-in items

  - `FALSE` - disable the menu

  - a character vector of item names - show only the listed items, in
    the given order. Valid names: `"row_above"`, `"row_below"`,
    `"remove_row"`, `"undo"`, `"redo"`, `"copy"`, `"clear"`,
    `"clear_column"`. Use `"---"` to insert a separator.

- none_value:

  Deprecated and ignored. Dropdown cells can be cleared with the Delete
  or Backspace key. Kept for backward compatibility.

- height:

  Table height as a CSS value (default fills the container).

- width:

  Table width as a CSS value (default fills the container).

- cell_conditions:

  A list of conditional cell configurations (see Details).

## Value

A Shiny UI element containing the Handsontable widget.

## Details

### Column Configuration

Each column should be a list with the following elements:

- `name` - Column name (required)

- `type` - Column type: "text", "numeric", "checkbox", "dropdown",
  "multiselect", or "date" (required)

- `source` - Options for dropdown/multiselect columns

- `sortable` - Enable drag-and-drop sorting for multiselect (default:
  FALSE)

- `validate` - Validate dropdown values (default: TRUE)

- `readOnly` - Make column read-only (default: FALSE)

- `width` - Column width in pixels

- `dateFormat` - Moment.js format string for date columns (default:
  "YYYY-MM-DD")

- `correctFormat` - Auto-correct user-typed dates to the declared format
  (default: TRUE)

- `defaultDate` - Date shown when the cell is empty and the calendar
  picker opens

### Context Menu

The built-in right-click menu includes: insert row above/below, remove
row, undo/redo, copy, clear selection, and clear column. Set
`context_menu = FALSE` to disable it, or pass a character vector of item
names to show only a subset - for example
`context_menu = c("row_above", "row_below", "---", "remove_row")`.

### Cell Conditions

Cell conditions allow dynamic cell properties based on other cell
values. Each condition should be a list with:

- `column` - The column to apply the condition to

- `when_column` - The column to check

- `when_value` - The value that triggers the condition

- `readOnly` - Set cell to read-only when condition is met

- `type` - Change cell type when condition is met

- `source` - Change dropdown options when condition is met

## See also

[`updateEsqTable`](https://esqlabs.github.io/esq.handsontable/reference/updateEsqTable.md)

## Examples

``` r
if (interactive()) {
library(shiny)

ui <- fluidPage(
  esq_tableInput("myTable",
    data = data.frame(
      name = c("Item 1", "Item 2"),
      category = c("A", "B"),
      active = c(TRUE, FALSE),
      stringsAsFactors = FALSE
    ),
    columns = list(
      list(name = "name", type = "text"),
      list(name = "category", type = "dropdown", source = c("A", "B", "C")),
      list(name = "active", type = "checkbox")
    )
  )
)

server <- function(input, output, session) {
  observeEvent(input$myTable_edited, {
    data <- jsonlite::fromJSON(input$myTable_edited)
    print(data)
  })
}

shinyApp(ui, server)
}
```
