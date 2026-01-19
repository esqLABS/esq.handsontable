# App 2: Dropdown Table
# Demonstrates single-select dropdown columns with validation

library(shiny)
library(esq.handsontable)

ui <- fluidPage(
  titlePanel("App 2: Dropdown Columns"),

  sidebarLayout(
    sidebarPanel(
      h4("Features"),
      tags$ul(
        tags$li("Single-select dropdowns"),
        tags$li("Validation highlighting"),
        tags$li("Dynamic option updates"),
        tags$li("Column tooltips")
      ),
      hr(),
      h5("Update Dropdown Options"),
      selectInput("category_set", "Category Set:",
        choices = c(
          "Standard" = "standard",
          "Electronics" = "electronics",
          "Clothing" = "clothing",
          "Food" = "food"
        )
      ),
      actionButton("update_categories", "Apply Categories", class = "btn-info"),
      hr(),
      selectInput("status_set", "Status Set:",
        choices = c(
          "Inventory" = "inventory",
          "Order" = "order",
          "Project" = "project"
        )
      ),
      actionButton("update_status", "Apply Status", class = "btn-info")
    ),

    mainPanel(
      h4("Item Management"),
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
  )
)

server <- function(input, output, session) {
  log_messages <- reactiveVal(character())

  log_event <- function(msg) {
    log_messages(c(paste0("[", format(Sys.time(), "%H:%M:%S"), "] ", msg), head(log_messages(), 9)))
  }

  # Update category options
  observeEvent(input$update_categories, {
    new_categories <- switch(input$category_set,
      "electronics" = c("Computers", "Phones", "Audio", "Accessories", "Gaming"),
      "clothing" = c("Shirts", "Pants", "Shoes", "Accessories", "Outerwear"),
      "food" = c("Fresh", "Frozen", "Canned", "Beverages", "Snacks"),
      c("Electronics", "Clothing", "Home", "Sports", "Food")
    )

    updateEsqTable(session, "dropdown_table",
      options = list(category = new_categories)
    )

    log_event(paste("Categories updated to:", input$category_set))
  })

  # Update status options
  observeEvent(input$update_status, {
    new_status <- switch(input$status_set,
      "order" = c("Pending", "Processing", "Shipped", "Delivered", "Cancelled"),
      "project" = c("Not Started", "In Progress", "Review", "Completed", "On Hold"),
      c("In Stock", "Low Stock", "Out of Stock", "Discontinued")
    )

    updateEsqTable(session, "dropdown_table",
      options = list(status = new_status)
    )

    log_event(paste("Status updated to:", input$status_set))
  })

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
