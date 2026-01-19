# App 4: Conditional Cells
# Demonstrates dynamic cell disabling based on other cell values

library(shiny)
library(esq.handsontable)

ui <- fluidPage(
  titlePanel("App 4: Conditional Cell Properties"),

  sidebarLayout(
    sidebarPanel(
      h4("Features"),
      tags$ul(
        tags$li("Cells disable based on other values"),
        tags$li("Dynamic read-only states"),
        tags$li("Context-aware forms"),
        tags$li("Multiple condition rules")
      ),
      hr(),
      div(class = "alert alert-success",
        tags$strong("Try This:"),
        tags$ul(
          tags$li("Set Data Type to 'Observed' - Scenario disables"),
          tags$li("Set Data Type to 'Simulated' - Data Set disables"),
          tags$li("Set Payment to 'Free' - Amount & Discount disable")
        )
      ),
      hr(),
      div(class = "alert alert-warning",
        tags$strong("How It Works:"),
        p("The cell_conditions parameter defines rules that automatically disable cells when trigger conditions are met.")
      )
    ),

    mainPanel(
      h4("Analysis Configuration"),
      p("Configure your analysis by selecting data types. Some fields are only relevant for certain data types."),
      esq_tableInput("analysis_table",
        data = data.frame(
          name = c("Analysis 1", "Analysis 2", "Analysis 3", "Analysis 4"),
          dataType = c("Simulated", "Observed", "Simulated", "Observed"),
          scenario = c("Baseline", "", "Treatment A", ""),
          dataSet = c("", "Patient Data 2023", "", "Clinical Trial B"),
          outputType = c("Summary", "Detailed", "Summary", "Detailed"),
          stringsAsFactors = FALSE
        ),
        columns = list(
          list(name = "name", type = "text", width = 120),
          list(
            name = "dataType",
            type = "dropdown",
            source = c("Simulated", "Observed"),
            width = 110
          ),
          list(
            name = "scenario",
            type = "dropdown",
            source = c("Baseline", "Treatment A", "Treatment B", "Combination"),
            width = 130
          ),
          list(
            name = "dataSet",
            type = "dropdown",
            source = c("Patient Data 2022", "Patient Data 2023", "Clinical Trial A", "Clinical Trial B"),
            width = 150
          ),
          list(
            name = "outputType",
            type = "dropdown",
            source = c("Summary", "Detailed", "Raw"),
            width = 100
          )
        ),
        cell_conditions = list(
          list(
            column = "scenario",
            when_column = "dataType",
            when_value = "Observed",
            readOnly = TRUE
          ),
          list(
            column = "dataSet",
            when_column = "dataType",
            when_value = "Simulated",
            readOnly = TRUE
          )
        ),
        column_descriptions = list(
          name = "Analysis name",
          dataType = "Choose Simulated or Observed data",
          scenario = "Simulation scenario (only for Simulated)",
          dataSet = "Data source (only for Observed)",
          outputType = "Type of output to generate"
        )
      ),

      hr(),
      h4("Payment Configuration"),
      p("Payment type affects which fields are editable."),
      esq_tableInput("payment_table",
        data = data.frame(
          service = c("Basic Plan", "Pro Plan", "Enterprise", "Trial", "Custom"),
          payment = c("Paid", "Paid", "Subscription", "Free", "Paid"),
          amount = c(9.99, 29.99, 99.99, 0, 149.99),
          discount = c(0, 10, 20, 0, 15),
          billing = c("Monthly", "Monthly", "Annual", "", "Annual"),
          stringsAsFactors = FALSE
        ),
        columns = list(
          list(name = "service", type = "text", width = 120, readOnly = TRUE),
          list(
            name = "payment",
            type = "dropdown",
            source = c("Free", "Paid", "Subscription", "Trial"),
            width = 110
          ),
          list(name = "amount", type = "numeric", width = 90),
          list(name = "discount", type = "numeric", width = 90),
          list(
            name = "billing",
            type = "dropdown",
            source = c("Monthly", "Quarterly", "Annual"),
            width = 100
          )
        ),
        cell_conditions = list(
          list(
            column = "amount",
            when_column = "payment",
            when_value = "Free",
            readOnly = TRUE
          ),
          list(
            column = "discount",
            when_column = "payment",
            when_value = "Free",
            readOnly = TRUE
          ),
          list(
            column = "billing",
            when_column = "payment",
            when_value = "Free",
            readOnly = TRUE
          ),
          list(
            column = "amount",
            when_column = "payment",
            when_value = "Trial",
            readOnly = TRUE
          ),
          list(
            column = "discount",
            when_column = "payment",
            when_value = "Trial",
            readOnly = TRUE
          )
        ),
        column_descriptions = list(
          service = "Service name",
          payment = "Payment type",
          amount = "Monthly amount in USD (disabled for Free/Trial)",
          discount = "Discount percentage (disabled for Free/Trial)",
          billing = "Billing cycle (disabled for Free)"
        )
      ),

      hr(),
      h4("Data Output:"),
      verbatimTextOutput("data_output")
    )
  )
)

server <- function(input, output, session) {
  analysis_data <- reactiveVal(NULL)
  payment_data <- reactiveVal(NULL)

  observeEvent(input$analysis_table_edited, {
    analysis_data(jsonlite::fromJSON(input$analysis_table_edited))
  })

  observeEvent(input$payment_table_edited, {
    payment_data(jsonlite::fromJSON(input$payment_table_edited))
  })

  output$data_output <- renderPrint({
    cat("=== Analysis Data ===\n")
    if (!is.null(analysis_data())) {
      print(analysis_data())
    } else {
      cat("(no changes)\n")
    }
    cat("\n=== Payment Data ===\n")
    if (!is.null(payment_data())) {
      print(payment_data())
    } else {
      cat("(no changes)\n")
    }
  })
}

shinyApp(ui, server)
