# Column Types and Configuration

``` r
library(shiny)
library(esq.handsontable)
```

## Column Configuration Options

Each column is configured as a list with various options:

| Option     | Type    | Description                      | Default |
|------------|---------|----------------------------------|---------|
| `name`     | string  | Column name (required)           | \-      |
| `type`     | string  | Column type (required)           | \-      |
| `source`   | vector  | Options for dropdown/multiselect | NULL    |
| `sortable` | boolean | Enable drag-sort for multiselect | FALSE   |
| `validate` | boolean | Validate dropdown values         | TRUE    |
| `readOnly` | boolean | Make column read-only            | FALSE   |
| `width`    | number  | Column width in pixels           | auto    |

## Text Columns

Standard text input fields:

``` r
description_col <- list(name = "description", type = "text", width = 200)

# Read-only text
id_col <- list(name = "id", type = "text", readOnly = TRUE, width = 80)

str(description_col)
#> List of 3
#>  $ name : chr "description"
#>  $ type : chr "text"
#>  $ width: num 200
```

## Numeric Columns

Number input with automatic validation:

``` r
quantity_col <- list(name = "quantity", type = "numeric", width = 100)
price_col <- list(name = "price", type = "numeric", width = 80)

str(price_col)
#> List of 3
#>  $ name : chr "price"
#>  $ type : chr "numeric"
#>  $ width: num 80
```

## Checkbox Columns

Boolean checkbox cells. Data should contain `TRUE`/`FALSE` values.

``` r
active_col <- list(name = "active", type = "checkbox", width = 70)
str(active_col)
#> List of 3
#>  $ name : chr "active"
#>  $ type : chr "checkbox"
#>  $ width: num 70
```

## Dropdown Columns

Single-select dropdown menus:

``` r
category_col <- list(
  name = "category",
  type = "dropdown",
  source = c("Electronics", "Clothing", "Food", "Other"),
  width = 120
)

# Allow empty values
optional_col <- list(
  name = "optional",
  type = "dropdown",
  source = c("", "Option A", "Option B"),
  width = 100
)

# Disable validation
flexible_col <- list(
  name = "flexible",
  type = "dropdown",
  source = c("A", "B", "C"),
  validate = FALSE
)

category_col$source
#> [1] "Electronics" "Clothing"    "Food"        "Other"
```

## Multi-Select Columns

Select multiple values from a list. Multi-select values are stored as
comma-separated strings (e.g., `"tag1, tag2, tag3"`).

``` r
# Basic multi-select
tags_col <- list(
  name = "tags",
  type = "multiselect",
  source = c("urgent", "review", "approved", "pending"),
  width = 180
)

# Sortable multi-select (drag to reorder)
priorities_col <- list(
  name = "priorities",
  type = "multiselect",
  source = c("Critical", "High", "Medium", "Low"),
  sortable = TRUE,
  width = 180
)

priorities_col$sortable
#> [1] TRUE
```

## Column Descriptions (Tooltips)

Add helpful tooltips to column headers:

``` r
my_data <- data.frame(
  id = c("A1", "A2"),
  name = c("First", "Second"),
  status = c("open", "closed"),
  priority = c("High", "Low"),
  stringsAsFactors = FALSE
)

my_columns <- list(
  list(name = "id", type = "text", readOnly = TRUE),
  list(name = "name", type = "text"),
  list(name = "status", type = "dropdown", source = c("open", "closed")),
  list(name = "priority", type = "dropdown",
       source = c("High", "Medium", "Low"))
)

tooltip_ui <- esq_tableInput(
  "my_table",
  data = my_data,
  columns = my_columns,
  column_descriptions = list(
    id = "Unique identifier (auto-generated)",
    name = "Full name of the item",
    status = "Current processing status",
    priority = "Task priority level (drag to reorder)"
  )
)

inherits(tooltip_ui, "shiny.tag")
#> [1] FALSE
```

## Complete Example

``` r
inventory <- data.frame(
  sku = c("SKU-001", "SKU-002"),
  name = c("Widget", "Gadget"),
  category = c("Electronics", "Tools"),
  price = c(29.99, 49.99),
  tags = c("sale, featured", "new"),
  in_stock = c(TRUE, FALSE),
  stringsAsFactors = FALSE
)

inventory_columns <- list(
  list(name = "sku", type = "text", width = 90, readOnly = TRUE),
  list(name = "name", type = "text", width = 150),
  list(name = "category", type = "dropdown",
       source = c("Electronics", "Tools", "Clothing"), width = 110),
  list(name = "price", type = "numeric", width = 80),
  list(name = "tags", type = "multiselect",
       source = c("sale", "featured", "new", "clearance"),
       sortable = TRUE, width = 150),
  list(name = "in_stock", type = "checkbox", width = 70)
)

inventory_ui <- esq_tableInput(
  "inventory",
  data = inventory,
  columns = inventory_columns,
  column_descriptions = list(
    sku = "Stock Keeping Unit (read-only)",
    name = "Product name",
    category = "Product category",
    price = "Price in USD",
    tags = "Product tags (drag to prioritize)",
    in_stock = "Currently in stock?"
  )
)

inventory
#>       sku   name    category price           tags in_stock
#> 1 SKU-001 Widget Electronics 29.99 sale, featured     TRUE
#> 2 SKU-002 Gadget       Tools 49.99            new    FALSE
```

Wrap it in a shiny app to view interactively:

``` r
ui <- fluidPage(inventory_ui)

server <- function(input, output, session) {
  observeEvent(input$inventory_edited, {
    data <- jsonlite::fromJSON(input$inventory_edited)
    print(data)
  })
}

if (interactive()) {
  shinyApp(ui, server)
}
```

## Recommended Column Widths

| Column Type  | Recommended Width |
|--------------|-------------------|
| ID/Code      | 60-90px           |
| Short text   | 100-150px         |
| Long text    | 200-300px         |
| Numeric      | 70-100px          |
| Checkbox     | 60-80px           |
| Dropdown     | 100-150px         |
| Multi-select | 150-200px         |
