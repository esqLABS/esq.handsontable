# Getting Started with esq.handsontable

![esq.handsontable logo](../reference/figures/logo.png)

## Introduction

`esq.handsontable` is an R Shiny package that provides an interactive,
Excel-like data table component. Built on
[Handsontable](https://handsontable.com/) and React, it offers features
like dropdowns, multi-select, validation, conditional cell disabling,
and more.

## Installation

``` r
# Install from GitHub
devtools::install_github("esqlabs/esq.handsontable")
```

## Quick Start

Here’s a minimal example:

``` r
library(shiny)
library(esq.handsontable)

ui <- fluidPage(
  esq_tableInput("my_table",
    data = data.frame(
      name = c("Alice", "Bob", "Charlie"),
      age = c(25, 30, 35),
      active = c(TRUE, FALSE, TRUE)
    ),
    columns = list(
      list(name = "name", type = "text"),
      list(name = "age", type = "numeric"),
      list(name = "active", type = "checkbox")
    )
  )
)

server <- function(input, output, session) {
  observeEvent(input$my_table_edited, {
    data <- jsonlite::fromJSON(input$my_table_edited)
    print(data)
  })
}

shinyApp(ui, server)
```

## Core Concepts

### The `esq_tableInput()` Function

| Argument              | Description                                            |
|-----------------------|--------------------------------------------------------|
| `inputId`             | Unique identifier for the table                        |
| `data`                | A data frame with initial data                         |
| `columns`             | List of column configurations                          |
| `options`             | Named list of dropdown options for dynamic updates     |
| `column_descriptions` | Optional tooltips for columns                          |
| `show_action_buttons` | Show add/delete row buttons (default: TRUE)            |
| `context_menu`        | Enable right-click context menu (default: TRUE)        |
| `none_value`          | *Deprecated, ignored.* Kept for backward compatibility |
| `height`              | Table height (default: “100%”)                         |
| `width`               | Table width (default: “100%”)                          |
| `cell_conditions`     | Optional conditional cell rules                        |

### Column Types

| Type          | Description                                                                                                                  |
|---------------|------------------------------------------------------------------------------------------------------------------------------|
| `text`        | Standard text input                                                                                                          |
| `numeric`     | Number input with validation                                                                                                 |
| `checkbox`    | Boolean checkbox                                                                                                             |
| `dropdown`    | Single-select dropdown                                                                                                       |
| `multiselect` | Multi-select dropdown                                                                                                        |
| `date`        | Calendar picker (Pikaday). Configure with `dateFormat` (default `"YYYY-MM-DD"`), optional `correctFormat`, and `defaultDate` |

### Context Menu

Right-click any cell to access: insert row above/below, remove row,
undo/redo, copy, clear selection, and clear column.

`context_menu` accepts:

- `TRUE` (default) — show all items
- `FALSE` — disable the menu
- a character vector — show only the listed items, in order. Use `"---"`
  to insert a separator.

``` r
esq_tableInput("my_table",
  data = my_data,
  columns = my_columns,
  context_menu = c("row_above", "row_below", "---", "remove_row", "undo", "redo")
)
```

Valid item names: `row_above`, `row_below`, `remove_row`, `undo`,
`redo`, `copy`, `clear`, `clear_column`.

### Retrieving Data

``` r
observeEvent(input$my_table_edited, {
  data <- jsonlite::fromJSON(input$my_table_edited)
  # Use the data...
})
```

## Next Steps

- See
  [`vignette("column-types")`](https://esqlabs.github.io/esq.handsontable/articles/column-types.md)
  for detailed column configuration
- See
  [`vignette("conditional-cells")`](https://esqlabs.github.io/esq.handsontable/articles/conditional-cells.md)
  for dynamic cell behavior
- See
  [`vignette("dynamic-updates")`](https://esqlabs.github.io/esq.handsontable/articles/dynamic-updates.md)
  for updating options at runtime
- Check the `examples/` folder for complete working apps
