# Dynamic Updates

## Introduction

[`updateEsqTable()`](https://esqlabs.github.io/esq.handsontable/reference/updateEsqTable.md)
lets you change a table’s data, dropdown/multiselect options, or column
configuration at runtime — without recreating the widget.

## Syntax

``` r
updateEsqTable(
  session,            # Shiny session object
  inputId,            # Table input ID
  data = NULL,        # New data frame (replaces current rows)
  options = NULL,     # Named list: column name -> new option vector
  columns = NULL      # Updated column configurations (same format as esq_tableInput)
)
```

All three arguments are optional; pass only what you need to change.

## Basic Example

``` r
library(shiny)
library(esq.handsontable)

ui <- fluidPage(
  selectInput("region", "Region:",
    choices = c("North America", "Europe", "Asia")),
  actionButton("update", "Update Countries"),

  esq_tableInput("sales",
    data = data.frame(
      product = c("Widget", "Gadget"),
      country = c("USA", "Canada")
    ),
    columns = list(
      list(name = "product", type = "text"),
      list(name = "country", type = "dropdown",
           source = c("USA", "Canada", "Mexico"))
    )
  )
)

server <- function(input, output, session) {
  observeEvent(input$update, {
    countries <- switch(input$region,
      "North America" = c("USA", "Canada", "Mexico"),
      "Europe" = c("UK", "Germany", "France", "Spain"),
      "Asia" = c("Japan", "China", "South Korea", "India")
    )

    updateEsqTable(session, "sales",
      options = list(country = countries)
    )
  })
}

shinyApp(ui, server)
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

``` r
updateEsqTable(session, "my_table",
  options = list(
    country = c("USA", "Canada"),
    state = c("California", "Texas"),
    city = c("Los Angeles", "Houston")
  )
)
```

## Reactive Updates

``` r
server <- function(input, output, session) {
  available_options <- reactive({
    # Could be a database query
    switch(input$category,
      "Electronics" = c("Phones", "Laptops", "Tablets"),
      "Clothing" = c("Shirts", "Pants", "Shoes"),
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

``` r
location_data <- list(
  "USA" = c("California", "Texas", "New York"),
  "Canada" = c("Ontario", "Quebec", "BC")
)

server <- function(input, output, session) {
  observeEvent(input$country, {
    states <- location_data[[input$country]]

    updateEsqTable(session, "location_table",
      options = list(state = states)
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
