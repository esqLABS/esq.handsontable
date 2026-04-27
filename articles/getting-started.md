# Getting Started with esq.handsontable

![esq.handsontable logo](../reference/figures/logo.png)

## Introduction

`esq.handsontable` is an R shiny package that provides an interactive,
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

Build a small data set and a matching column configuration:

``` r
library(shiny)
library(esq.handsontable)

people <- data.frame(
  name = c("Alice", "Bob", "Charlie"),
  age = c(25, 30, 35),
  active = c(TRUE, FALSE, TRUE),
  stringsAsFactors = FALSE
)

people_columns <- list(
  list(name = "name", type = "text"),
  list(name = "age", type = "numeric"),
  list(name = "active", type = "checkbox")
)

people
#>      name age active
#> 1   Alice  25   TRUE
#> 2     Bob  30  FALSE
#> 3 Charlie  35   TRUE
```

[`esq_tableInput()`](https://esqlabs.github.io/esq.handsontable/reference/esq_tableInput.md)
returns a shiny UI element. You can construct it outside of an app to
inspect the structure:

``` r
table_ui <- esq_tableInput(
  "my_table",
  data = people,
  columns = people_columns
)

class(table_ui)
#> [1] "shiny.tag.list" "list"
```

Wrap it in a shiny app to use it interactively. The
[`shinyApp()`](https://rdrr.io/pkg/shiny/man/shinyApp.html) call only
starts when the vignette is run interactively:

``` r
ui <- fluidPage(table_ui)

server <- function(input, output, session) {
  observeEvent(input$my_table_edited, {
    data <- jsonlite::fromJSON(input$my_table_edited)
    print(data)
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
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
custom_menu_ui <- esq_tableInput(
  "my_table",
  data = people,
  columns = people_columns,
  context_menu = c("row_above", "row_below", "---", "remove_row", "undo", "redo")
)

inherits(custom_menu_ui, "shiny.tag")
#> [1] FALSE
```

Valid item names: `row_above`, `row_below`, `remove_row`, `undo`,
`redo`, `copy`, `clear`, `clear_column`.

### Retrieving Data

In a shiny server, parse the JSON sent on each edit:

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
