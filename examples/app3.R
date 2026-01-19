# App 3: Multi-Select Table
# Demonstrates multi-select columns with drag-and-drop sorting

library(shiny)
library(esq.handsontable)

ui <- fluidPage(
  titlePanel("App 3: Multi-Select Columns"),

  sidebarLayout(
    sidebarPanel(
      h4("Features"),
      tags$ul(
        tags$li("Multi-select dropdowns"),
        tags$li("Drag-and-drop sorting"),
        tags$li("Sortable vs non-sortable"),
        tags$li("Comma-separated values")
      ),
      hr(),
      div(class = "alert alert-info",
        tags$strong("Tips:"),
        tags$ul(
          tags$li("Click cell to open multi-select"),
          tags$li("Check multiple items"),
          tags$li("Drag items to reorder (if sortable)"),
          tags$li("Order is preserved in data")
        )
      ),
      hr(),
      actionButton("get_data", "Get Current Data", class = "btn-primary")
    ),

    mainPanel(
      h4("Project Team Assignment"),
      esq_tableInput("multiselect_table",
        data = data.frame(
          project = c("Website Redesign", "Mobile App", "API Development", "Data Pipeline", "Security Audit"),
          lead = c("Alice", "Bob", "Charlie", "Diana", "Eve"),
          team_members = c(
            "Alice, Bob, Charlie",
            "Diana, Eve",
            "Frank, Grace, Henry",
            "Ivy, Jack",
            "Kate, Leo, Mike"
          ),
          skills = c(
            "HTML, CSS, JavaScript, React",
            "React Native, iOS, Android",
            "Node.js, Python, PostgreSQL",
            "Python, SQL, Spark",
            "Security, Networking, Linux"
          ),
          tags = c(
            "frontend, design, urgent",
            "mobile, cross-platform",
            "backend, api, database",
            "data, etl, analytics",
            "security, compliance"
          ),
          stringsAsFactors = FALSE
        ),
        columns = list(
          list(name = "project", type = "text", width = 150, readOnly = TRUE),
          list(
            name = "lead",
            type = "dropdown",
            source = c("Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Leo", "Mike"),
            width = 100
          ),
          list(
            name = "team_members",
            type = "multiselect",
            source = c("Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Leo", "Mike"),
            sortable = TRUE,
            width = 200
          ),
          list(
            name = "skills",
            type = "multiselect",
            source = c("HTML", "CSS", "JavaScript", "React", "React Native", "iOS", "Android",
                       "Node.js", "Python", "PostgreSQL", "SQL", "Spark", "Security", "Networking", "Linux"),
            sortable = TRUE,
            width = 220
          ),
          list(
            name = "tags",
            type = "multiselect",
            source = c("frontend", "backend", "mobile", "design", "api", "database",
                       "cross-platform", "data", "etl", "analytics", "security", "compliance", "urgent"),
            sortable = FALSE,
            width = 180
          )
        ),
        column_descriptions = list(
          project = "Project name",
          lead = "Project lead (single person)",
          team_members = "Team members - drag to set priority order",
          skills = "Required skills - drag to set importance",
          tags = "Project tags (order doesn't matter)"
        )
      ),
      hr(),
      h4("Current Data:"),
      verbatimTextOutput("current_data"),
      hr(),
      h5("Note:"),
      p("Multi-select values are stored as comma-separated strings. Sortable columns preserve the order you set by dragging.")
    )
  )
)

server <- function(input, output, session) {
  current_data <- reactiveVal(NULL)

  observeEvent(input$multiselect_table_edited, {
    data <- jsonlite::fromJSON(input$multiselect_table_edited)
    current_data(data)
  })

  observeEvent(input$get_data, {
    output$current_data <- renderPrint({
      if (!is.null(current_data())) {
        data <- current_data()
        cat("Project Data:\n")
        cat("=============\n\n")
        for (i in 1:nrow(data)) {
          cat(sprintf("Project: %s\n", data$project[i]))
          cat(sprintf("  Lead: %s\n", data$lead[i]))
          cat(sprintf("  Team: %s\n", data$team_members[i]))
          cat(sprintf("  Skills: %s\n", data$skills[i]))
          cat(sprintf("  Tags: %s\n\n", data$tags[i]))
        }
      } else {
        cat("Edit the table to see data changes.")
      }
    })
  })
}

shinyApp(ui, server)
