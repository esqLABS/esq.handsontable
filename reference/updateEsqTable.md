# Update an esq.handsontable widget

Dynamically updates the data, dropdown options, or column configurations
for an existing esq.handsontable widget without recreating the table.

## Usage

``` r
updateEsqTable(session, inputId, data = NULL, options = NULL, columns = NULL)
```

## Arguments

- session:

  The Shiny session object.

- inputId:

  The input ID of the table to update.

- data:

  New data frame (optional).

- options:

  A named list where names are column names and values are character
  vectors of new dropdown options (optional).

- columns:

  Updated column configurations (optional).

## Value

Called for side effect (sends message to client). Returns
`invisible(NULL)`.

## See also

[`esq_tableInput`](https://esqlabs.github.io/esq.handsontable/reference/esq_tableInput.md)

## Examples

``` r
if (interactive()) {
server <- function(input, output, session) {
  observeEvent(input$update_button, {
    updateEsqTable(session, "my_table",
      options = list(
        category = c("New A", "New B", "New C"),
        status = c("Active", "Inactive")
      )
    )
  })
}
}
```
