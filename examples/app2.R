# App 2: Dropdown Table
# Demonstrates single-select dropdown columns with validation

library(shiny)
library(esq.handsontable)

ui <- fluidPage(
  titlePanel("App 2: Dropdown Columns"),

  esq_tableInput("dropdown_table",
    data = data.frame(
      item = c("Laptop", "T-Shirt", "Headphones", "Jeans", "Monitor"),
      category = c("Electronics", "Clothing", "Electronics", "Clothing", "Electronics"),
      status = c("In Stock", "Low Stock", "Out of Stock", "In Stock", "In Stock"),
      priority = c("High", "Medium", "High", "Low", "Medium"),
      location = c("Warehouse A", "Warehouse B", "Warehouse A", "Warehouse B", "Warehouse A"),
      stringsAsFactors = FALSE
    ),
    columns = list(
      list(name = "item", type = "text", width = 150),
      list(
        name = "category",
        type = "dropdown",
        source = c("Electronics", "Clothing", "Home", "Sports", "Food"),
        width = 120
      ),
      list(
        name = "status",
        type = "dropdown",
        source = c("In Stock", "Low Stock", "Out of Stock", "Discontinued"),
        width = 120
      ),
      list(
        name = "priority",
        type = "dropdown",
        source = c("Critical", "High", "Medium", "Low"),
        width = 100
      ),
      list(
        name = "location",
        type = "dropdown",
        source = c("Warehouse A", "Warehouse B", "Warehouse C", "Store Front"),
        width = 120
      )
    ),
    column_descriptions = list(
      item = "Item name or description",
      category = "Product category",
      status = "Current stock status",
      priority = "Restock priority level",
      location = "Storage location"
    )
  ),
  hr(),
  h5("Event Log:"),
  verbatimTextOutput("event_log")
)

server <- function(input, output, session) {
  log_messages <- reactiveVal(character())

  log_event <- function(msg) {
    log_messages(c(paste0("[", format(Sys.time(), "%H:%M:%S"), "] ", msg), head(log_messages(), 9)))
  }

  observeEvent(input$dropdown_table_edited, {
    log_event("Table data modified")
  })

  output$event_log <- renderPrint({
    if (length(log_messages()) > 0) {
      cat(paste(log_messages(), collapse = "\n"))
    } else {
      cat("No events yet...")
    }
  })
}

shinyApp(ui, server)
