#' esq.handsontable - A powerful Handsontable wrapper for R Shiny
#'
#' @description
#' Creates interactive data tables with dropdowns, multi-select, validation,
#' and more using Handsontable and React.
#'
#' @name esq.handsontable
#' @docType package
NULL

#' Create an esq.handsontable widget
#'
#' @param inputId The input slot that will be used to access the value
#' @param data A data frame with the initial data
#' @param columns A list of column configurations (see Details)
#' @param options A named list of dropdown options that can be referenced by columns
#' @param column_descriptions A named list of column descriptions for tooltips
#' @param show_action_buttons Whether to show add/delete buttons column (default: TRUE)
#' @param context_menu Whether to enable right-click context menu (default: TRUE)
#' @param none_value The value to use for empty dropdown selection (default: "--NONE--
#' @param height Table height (default: "100%")
#' @param width Table width (default: "100%")
#' @param cell_conditions A list of conditional cell configurations (see Details)
#'
#' @details
#' ## Column Configuration
#'
#' Each column should be a list with the following elements:
#' \itemize{
#'   \item \code{name} - Column name (required)
#'   \item \code{type} - Column type: "text", "numeric", "checkbox", "dropdown", or "multiselect"
#'   \item \code{source} - Vector of options for dropdown/multiselect columns
#'   \item \code{sortable} - Whether multiselect values can be reordered (default: FALSE)
#'   \item \code{validate} - Whether to validate dropdown values (default: TRUE)
#'   \item \code{readOnly} - Whether the column is read-only (default: FALSE)
#'   \item \code{width} - Column width in pixels
#' }
#'
#' ## Cell Conditions
#'
#' Cell conditions allow dynamic cell properties based on other cell values.
#' Each condition should be a list with:
#' \itemize{
#'   \item \code{column} - The column to apply the condition to
#'   \item \code{when_column} - The column to check
#'   \item \code{when_value} - The value that triggers the condition
#'   \item \code{readOnly} - Set cell to read-only when condition is met
#'   \item \code{type} - Change cell type when condition is met
#'   \item \code{source} - Change dropdown options when condition is met
#' }
#'
#' @return A Shiny input element
#'
#' @examples
#' \dontrun{
#' library(shiny)
#' library(esq.handsontable)
#'
#' ui <- fluidPage(
#'   esq_tableInput("myTable",
#'     data = data.frame(
#'       name = c("Item 1", "Item 2"),
#'       category = c("A", "B"),
#'       active = c(TRUE, FALSE)
#'     ),
#'     columns = list(
#'       list(name = "name", type = "text"),
#'       list(name = "category", type = "dropdown", source = c("A", "B", "C")),
#'       list(name = "active", type = "checkbox")
#'     )
#'   )
#' )
#'
#' server <- function(input, output, session) {
#'   observeEvent(input$myTable_edited, {
#'     # Handle edited data
#'     data <- jsonlite::fromJSON(input$myTable_edited)
#'     print(data)
#'   })
#' }
#'
#' shinyApp(ui, server)
#' }
#'
#' @export
esq_tableInput <- function(
  inputId,
  data = NULL,
  columns = list(),
  options = list(),
  column_descriptions = list(),
  show_action_buttons = TRUE,
  context_menu = TRUE,
  none_value = "--NONE--",
  height = "100%",
  width = "100%",
  cell_conditions = list()
) {

  # Convert data to JSON and base64 encode
  if (is.null(data) || nrow(data) == 0) {
    data_json <- "[]"
  } else {
    data_json <- jsonlite::toJSON(data, dataframe = "rows", auto_unbox = TRUE)
  }
  data_base64 <- base64enc::base64encode(charToRaw(as.character(data_json)))

  # Build configuration
  configuration <- list(
    shiny_el_id_name = inputId,
    table_key = inputId,
    columns = columns,
    options = options,
    column_descriptions = column_descriptions,
    show_action_buttons = show_action_buttons,
    context_menu = context_menu,
    none_value = none_value,
    height = height,
    width = width,
    cell_conditions = cell_conditions
  )

  # Create the widget
  reactR::createReactShinyInput(
    inputId = inputId,
    class = "esq_table_",
    dependencies = htmltools::htmlDependency(
      name = "esq.handsontable",
      version = "1.0.0",
      src = system.file("www/esq.handsontable/main_bundle", package = "esq.handsontable"),
      script = "bundle.js"
    ),
    default = data_base64,
    configuration = configuration,
    container = htmltools::tags$div
  )
}

#' Update an esq.handsontable widget
#'
#' @param session The Shiny session object
#' @param inputId The input slot to update
#' @param data New data frame (optional)
#' @param options Updated dropdown options (optional)
#' @param columns Updated column configurations (optional)
#'
#' @export
updateEsqTable <- function(
  session,
  inputId,
  data = NULL,
  options = NULL,
  columns = NULL
) {
  message <- list()

  if (!is.null(data)) {
    data_json <- jsonlite::toJSON(data, dataframe = "rows", auto_unbox = TRUE)
    message$data <- base64enc::base64encode(charToRaw(as.character(data_json)))
  }

  if (!is.null(options)) {
    message$options <- options
  }

  if (!is.null(columns)) {
    message$columns <- columns
  }

  session$sendInputMessage(inputId, message)
}
