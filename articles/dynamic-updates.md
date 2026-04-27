# Dynamic Updates

``` r
library(shiny)
library(esq.handsontable)
```

## Introduction

[`updateEsqTable()`](https://esqlabs.github.io/esq.handsontable/reference/updateEsqTable.md)
lets you change a table’s data, dropdown/multiselect options, or column
configuration at runtime — without recreating the widget.

## Syntax

The function signature, with all arguments optional except `session` and
`inputId`:

``` r
args(updateEsqTable)
#> function (session, inputId, data = NULL, options = NULL, columns = NULL) 
#> NULL
```

Pass only what you need to change:

- `data` - replacement data frame for all rows
- `options` - named list mapping column name to new option vector
- `columns` - updated column configurations (same format as
  [`esq_tableInput()`](https://esqlabs.github.io/esq.handsontable/reference/esq_tableInput.md))

## Basic Example

Build a sales table whose `country` dropdown can be swapped per region:

``` r
sales_data <- data.frame(
  product = c("Widget", "Gadget"),
  country = c("USA", "Canada"),
  stringsAsFactors = FALSE
)

sales_columns <- list(
  list(name = "product", type = "text"),
  list(name = "country", type = "dropdown",
       source = c("USA", "Canada", "Mexico"))
)

region_choices <- list(
  "North America" = c("USA", "Canada", "Mexico"),
  "Europe"        = c("UK", "Germany", "France", "Spain"),
  "Asia"          = c("Japan", "China", "South Korea", "India")
)

region_choices[["Europe"]]
#> [1] "UK"      "Germany" "France"  "Spain"
```

Hook it up in a shiny app:

``` r
ui <- fluidPage(
  selectInput("region", "Region:", choices = names(region_choices)),
  actionButton("update", "Update Countries"),
  esq_tableInput("sales", data = sales_data, columns = sales_columns)
)

server <- function(input, output, session) {
  observeEvent(input$update, {
    updateEsqTable(session, "sales",
      options = list(country = region_choices[[input$region]])
    )
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
```

## Replacing Table Data

Pass a new data frame to swap out all rows:

``` r
observeEvent(input$reset, {
  updateEsqTable(session, "sales", data = original_data)
})

# Filter and push a subset
observeEvent(input$region, {
  filtered <- all_data[all_data$region == input$region, ]
  updateEsqTable(session, "sales", data = filtered)
})
```

## Update Multiple Columns

A single call can update several option vectors at once:

``` r
batched_options <- list(
  country = c("USA", "Canada"),
  state   = c("California", "Texas"),
  city    = c("Los Angeles", "Houston")
)

names(batched_options)
#> [1] "country" "state"   "city"
```

``` r
updateEsqTable(session, "my_table", options = batched_options)
```

## Reactive Updates

``` r
server <- function(input, output, session) {
  available_options <- reactive({
    # Could be a database query
    switch(input$category,
      "Electronics" = c("Phones", "Laptops", "Tablets"),
      "Clothing"    = c("Shirts", "Pants", "Shoes"),
      c("Other")
    )
  })

  observe({
    updateEsqTable(session, "product_table",
      options = list(subcategory = available_options())
    )
  })
}
```

## Cascading Dropdowns

A lookup table maps each country to its list of states:

``` r
location_data <- list(
  "USA"    = c("California", "Texas", "New York"),
  "Canada" = c("Ontario", "Quebec", "BC")
)

location_data[["USA"]]
#> [1] "California" "Texas"      "New York"
```

``` r
server <- function(input, output, session) {
  observeEvent(input$country, {
    updateEsqTable(session, "location_table",
      options = list(state = location_data[[input$country]])
    )
  })
}
```

## Database-Driven Updates

``` r
server <- function(input, output, session) {
  observeEvent(input$refresh, {
    # Query from database
    # categories <- dbGetQuery(con,
    #   "SELECT DISTINCT category FROM products")

    categories <- c("New Category 1", "New Category 2")

    updateEsqTable(session, "product_table",
      options = list(category = categories)
    )

    showNotification("Options updated!", type = "message")
  })
}
```

## Shiny Modules

When using modules, the session is automatically namespaced:

``` r
tableModuleServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    observeEvent(input$refresh, {
      # Use inputId without namespace prefix
      updateEsqTable(session, "data_table",
        options = list(category = new_categories)
      )
    })
  })
}
```

## Performance Tips

### Batch Updates

Option updates merge cumulatively on the client, so either form works. A
single call avoids redundant round-trips and is preferred.

``` r
# Preferred: single call
updateEsqTable(session, "table",
  options = list(
    col1 = opts1,
    col2 = opts2,
    col3 = opts3
  )
)

# Also fine: separate calls (previous options are retained)
updateEsqTable(session, "table", options = list(col1 = opts1))
updateEsqTable(session, "table", options = list(col2 = opts2))
```

### Debouncing

``` r
server <- function(input, output, session) {
  search_debounced <- debounce(reactive(input$search), 300)

  observe({
    term <- search_debounced()
    options <- fetch_options(term)
    updateEsqTable(session, "table",
      options = list(items = options)
    )
  })
}
```

## Best Practices

1.  **Update only when needed** - Don’t update on every keystroke
2.  **Batch updates** - Combine multiple columns in one call
3.  **Provide feedback** - Show notifications for slow updates
4.  **Handle invalid values** - Warn users about orphaned values
5.  **Test edge cases** - Empty options, special characters
