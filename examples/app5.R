# App 5: Full-Featured Clinical Trial Manager
# Demonstrates all features combined in a real-world scenario

library(shiny)
library(esq.handsontable)

ui <- fluidPage(
  tags$head(
    tags$style(HTML("
      .header-panel {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 20px 25px;
        margin: -20px -20px 25px -20px;
        border-radius: 0;
      }
      .header-panel h2 { margin: 0 0 5px 0; font-weight: 600; }
      .header-panel p { margin: 0; opacity: 0.9; font-size: 14px; }
      .stats-row { display: flex; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
      .stat-box {
        flex: 1;
        min-width: 120px;
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        padding: 18px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid #dee2e6;
      }
      .stat-box .value { font-size: 28px; font-weight: 700; color: #6366f1; }
      .stat-box .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
      .feature-badge {
        display: inline-block;
        background: #e0e7ff;
        color: #4338ca;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        margin: 2px;
      }
    "))
  ),

  div(class = "header-panel",
    h2("Clinical Trial Data Manager"),
    p("esq.handsontable - Full Featured Demo | All column types, conditional cells, dynamic updates")
  ),

  sidebarLayout(
    sidebarPanel(
      width = 3,
      h4("Controls"),

      selectInput("phase_filter", "Filter by Phase:",
        choices = c("All Phases", "Phase I", "Phase II", "Phase III", "Phase IV")
      ),

      hr(),

      h5("Dynamic Updates"),
      selectInput("specialty_set", "Specialty Options:",
        choices = c("General", "Oncology Focus", "Cardiology Focus", "Neurology Focus")
      ),
      actionButton("apply_specialties", "Apply Specialties", class = "btn-info btn-block"),

      hr(),

      h5("Actions"),
      actionButton("refresh", "Refresh Data", class = "btn-success btn-block"),
      downloadButton("download_csv", "Download CSV", class = "btn-block"),

      hr(),

      h5("Features Demonstrated:"),
      div(
        span(class = "feature-badge", "Text"),
        span(class = "feature-badge", "Numeric"),
        span(class = "feature-badge", "Checkbox"),
        span(class = "feature-badge", "Dropdown"),
        span(class = "feature-badge", "Multi-select"),
        span(class = "feature-badge", "Sortable"),
        span(class = "feature-badge", "Conditions"),
        span(class = "feature-badge", "Tooltips"),
        span(class = "feature-badge", "Read-only"),
        span(class = "feature-badge", "Validation")
      )
    ),

    mainPanel(
      width = 9,

      div(class = "stats-row",
        div(class = "stat-box",
          div(class = "value", textOutput("total_patients", inline = TRUE)),
          div(class = "label", "Total Patients")
        ),
        div(class = "stat-box",
          div(class = "value", textOutput("active_sites", inline = TRUE)),
          div(class = "label", "Active Sites")
        ),
        div(class = "stat-box",
          div(class = "value", textOutput("avg_enrollment", inline = TRUE)),
          div(class = "label", "Avg Enrollment %")
        ),
        div(class = "stat-box",
          div(class = "value", textOutput("total_sites", inline = TRUE)),
          div(class = "label", "Total Sites")
        )
      ),

      esq_tableInput("trial_table",
        data = data.frame(
          site_id = c("SITE-001", "SITE-002", "SITE-003", "SITE-004", "SITE-005", "SITE-006"),
          site_name = c("Boston Medical Center", "LA Research Institute", "Chicago Clinical", "NYC Hospital", "Miami Research", "Seattle Medical"),
          phase = c("Phase II", "Phase III", "Phase II", "Phase I", "Phase III", "Phase II"),
          status = c("Recruiting", "Active", "Recruiting", "Setup", "Completed", "Paused"),
          enrolled = c(45, 120, 38, 0, 95, 62),
          target = c(100, 150, 80, 50, 100, 100),
          pi_name = c("Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown", "Dr. Davis", "Dr. Miller"),
          specialties = c("Oncology, Cardiology", "Oncology", "Neurology, Psychiatry", "Cardiology", "Oncology, Immunology", "Neurology"),
          start_date = c("2024-01-15", "2023-06-01", "2024-02-20", "2024-03-01", "2023-01-10", "2024-01-05"),
          active = c(TRUE, TRUE, TRUE, FALSE, FALSE, FALSE),
          stringsAsFactors = FALSE
        ),
        columns = list(
          list(name = "site_id", type = "text", width = 85, readOnly = TRUE),
          list(name = "site_name", type = "text", width = 160),
          list(name = "phase", type = "dropdown",
               source = c("Phase I", "Phase II", "Phase III", "Phase IV"), width = 85),
          list(name = "status", type = "dropdown",
               source = c("Setup", "Recruiting", "Active", "Paused", "Completed", "Terminated"), width = 100),
          list(name = "enrolled", type = "numeric", width = 75),
          list(name = "target", type = "numeric", width = 70),
          list(name = "pi_name", type = "text", width = 110),
          list(name = "specialties", type = "multiselect",
               source = c("Oncology", "Cardiology", "Neurology", "Psychiatry", "Immunology", "Endocrinology", "Rheumatology", "Dermatology", "Pulmonology", "Nephrology"),
               sortable = TRUE, width = 180),
          list(name = "start_date", type = "text", width = 95),
          list(name = "active", type = "checkbox", width = 60)
        ),
        cell_conditions = list(
          list(column = "enrolled", when_column = "status", when_value = "Setup", readOnly = TRUE),
          list(column = "enrolled", when_column = "status", when_value = "Completed", readOnly = TRUE),
          list(column = "target", when_column = "status", when_value = "Completed", readOnly = TRUE)
        ),
        column_descriptions = list(
          site_id = "Unique site identifier (auto-generated)",
          site_name = "Full name of the clinical site",
          phase = "Current trial phase",
          status = "Site recruitment status",
          enrolled = "Patients currently enrolled (disabled for Setup/Completed)",
          target = "Target enrollment number",
          pi_name = "Principal Investigator name",
          specialties = "Medical specialties - drag to prioritize",
          start_date = "Site start date (YYYY-MM-DD)",
          active = "Is site currently active?"
        )
      ),

      hr(),

      fluidRow(
        column(6,
          h5("Activity Log"),
          verbatimTextOutput("activity_log", placeholder = TRUE)
        ),
        column(6,
          h5("Selected Data Summary"),
          verbatimTextOutput("data_summary", placeholder = TRUE)
        )
      )
    )
  )
)

server <- function(input, output, session) {
  # Data storage
  table_data <- reactiveVal(NULL)
  activity <- reactiveVal(character())

  # Initial data for calculations
  initial_data <- data.frame(
    enrolled = c(45, 120, 38, 0, 95, 62),
    target = c(100, 150, 80, 50, 100, 100),
    active = c(TRUE, TRUE, TRUE, FALSE, FALSE, FALSE)
  )

  log_activity <- function(msg) {
    activity(c(paste0("[", format(Sys.time(), "%H:%M:%S"), "] ", msg), head(activity(), 7)))
  }

  observe({ log_activity("Application initialized") })

  observeEvent(input$trial_table_edited, {
    data <- jsonlite::fromJSON(input$trial_table_edited)
    table_data(data)
    log_activity("Table data modified")
  })

  # Stats
  output$total_patients <- renderText({
    data <- if (!is.null(table_data())) table_data() else initial_data
    sum(data$enrolled, na.rm = TRUE)
  })

  output$active_sites <- renderText({
    data <- if (!is.null(table_data())) table_data() else initial_data
    sum(data$active, na.rm = TRUE)
  })

  output$avg_enrollment <- renderText({
    data <- if (!is.null(table_data())) table_data() else initial_data
    enrolled <- sum(data$enrolled, na.rm = TRUE)
    target <- sum(data$target, na.rm = TRUE)
    paste0(round(enrolled / target * 100, 0), "%")
  })

  output$total_sites <- renderText({
    data <- if (!is.null(table_data())) table_data() else initial_data
    nrow(data)
  })

  # Apply specialties
  observeEvent(input$apply_specialties, {
    new_specs <- switch(input$specialty_set,
      "Oncology Focus" = c("Oncology", "Immunology", "Hematology", "Radiation Oncology", "Surgical Oncology"),
      "Cardiology Focus" = c("Cardiology", "Cardiac Surgery", "Electrophysiology", "Heart Failure", "Interventional"),
      "Neurology Focus" = c("Neurology", "Neurosurgery", "Psychiatry", "Sleep Medicine", "Pain Management"),
      c("Oncology", "Cardiology", "Neurology", "Psychiatry", "Immunology", "Endocrinology", "Rheumatology", "Dermatology", "Pulmonology", "Nephrology")
    )

    updateEsqTable(session, "trial_table", options = list(specialties = new_specs))
    log_activity(paste("Specialties updated to:", input$specialty_set))
  })

  observeEvent(input$refresh, {
    log_activity("Data refresh requested")
    showNotification("Data refreshed!", type = "message", duration = 2)
  })

  output$activity_log <- renderPrint({
    if (length(activity()) > 0) cat(paste(activity(), collapse = "\n"))
    else cat("No activity yet...")
  })

  output$data_summary <- renderPrint({
    if (!is.null(table_data())) {
      data <- table_data()
      cat("Sites by Status:\n")
      print(table(data$status))
      cat("\nSites by Phase:\n")
      print(table(data$phase))
    } else {
      cat("Edit the table to see summary...")
    }
  })

  output$download_csv <- downloadHandler(
    filename = function() paste0("trial_data_", Sys.Date(), ".csv"),
    content = function(file) {
      data <- if (!is.null(table_data())) table_data() else data.frame()
      write.csv(data, file, row.names = FALSE)
      log_activity("CSV downloaded")
    }
  )
}

shinyApp(ui, server)
