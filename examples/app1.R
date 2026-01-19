# App 1: Basic Table
# Demonstrates basic text, numeric, and checkbox columns

library(shiny)
library(esq.handsontable)

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
      actionButton("show_data", "Show Current Data", class = "btn-primary"),
      hr(),
      actionButton("reset", "Reset Data", class = "btn-warning")
    ),

    mainPanel(
      h4("Product Inventory"),
      esq_tableInput("basic_table",
        data = data.frame(
          id = c("P001", "P002", "P003", "P004", "P005"),
          name = c("Widget A", "Widget B", "Gadget X", "Gadget Y", "Device Z"),
          price = c(19.99, 29.99, 39.99, 49.99, 99.99),
          quantity = c(100, 50, 75, 25, 10),
          active = c(TRUE, TRUE, FALSE, TRUE, FALSE),
          stringsAsFactors = FALSE
        ),
        columns = list(
          list(name = "id", type = "text", width = 80, readOnly = TRUE),
          list(name = "name", type = "text", width = 150),
          list(name = "price", type = "numeric", width = 100),
          list(name = "quantity", type = "numeric", width = 100),
          list(name = "active", type = "checkbox", width = 80)
        ),
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
  current_data <- reactiveVal(NULL)

  observeEvent(input$basic_table_edited, {
    data <- jsonlite::fromJSON(input$basic_table_edited)
    current_data(data)
  })

  observeEvent(input$show_data, {
    output$data_output <- renderPrint({
      if (!is.null(current_data())) {
        print(current_data())
      } else {
        cat("No changes made yet. Edit the table and click again.")
      }
    })
  })

  observeEvent(input$reset, {
    showNotification("Reset functionality requires page refresh", type = "message")
  })
}

shinyApp(ui, server)
