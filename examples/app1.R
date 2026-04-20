# App 1: Basic Table
# Demonstrates basic text, numeric, and checkbox columns

library(shiny)
library(esq.handsontable)

initial_data <- data.frame(
  id = c("P001", "P002", "P003", "P004", "P005"),
  name = c("Widget A", "Widget B", "Gadget X", "Gadget Y", "Device Z"),
  price = c(19.99, 29.99, 39.99, 49.99, 99.99),
  quantity = c(100, 50, 75, 25, 10),
  active = c(TRUE, TRUE, FALSE, TRUE, FALSE),
  stringsAsFactors = FALSE
)

columns_config <- list(
  list(name = "id", type = "text", width = 80, readOnly = TRUE),
  list(name = "name", type = "text", width = 150),
  list(name = "price", type = "numeric", width = 100),
  list(name = "quantity", type = "numeric", width = 100),
  list(name = "active", type = "checkbox", width = 80)
)

ui <- fluidPage(
  titlePanel("App 1: Basic Table"),

  sidebarLayout(
    sidebarPanel(
      h4("Features"),
      tags$ul(
        tags$li("Text columns"),
        tags$li("Numeric columns"),
        tags$li("Checkbox columns"),
        tags$li("Read-only columns")
      ),
      hr(),
      actionButton("show_data", "Show Current Data", class = "btn-primary")
    ),

    mainPanel(
      h4("Product Inventory"),
      esq_tableInput("basic_table",
        data = initial_data,
        columns = columns_config,
        column_descriptions = list(
          id = "Product ID (auto-generated)",
          name = "Product name",
          price = "Price in USD",
          quantity = "Current stock quantity",
          active = "Is product available for sale?"
        )
      ),
      hr(),
      h4("Current Data:"),
      verbatimTextOutput("data_output")
    )
  )
)

server <- function(input, output, session) {
  current_data <- reactiveVal(initial_data)
  show_trigger <- reactiveVal(0)

  observeEvent(input$basic_table_edited, {
    data <- jsonlite::fromJSON(input$basic_table_edited)
    current_data(data)
  })

  observeEvent(input$show_data, {
    show_trigger(show_trigger() + 1)
    showNotification("Current table data displayed below", type = "message", duration = 2)
  })

  output$data_output <- renderPrint({
    show_trigger()
    print(current_data())
  })
}

shinyApp(ui, server)
