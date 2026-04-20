#' @keywords internal
"_PACKAGE"

#' Create an esq.handsontable widget
#'
#' Creates an interactive, Excel-like data table using Handsontable.
#' Supports text, numeric, checkbox, dropdown, multi-select, and date
#' columns with features like validation, conditional cell disabling,
#' calendar pickers, and more.
#'
#' @param inputId The input slot that will be used to access the value.
#' @param data A data frame containing the initial data to display.
#' @param columns A list of column configurations (see Details).
#' @param options A named list of dropdown options that can be referenced by columns.
#' @param column_descriptions A named list of column descriptions for tooltips.
#' @param show_action_buttons Whether to show add/delete buttons column (default: TRUE).
#' @param context_menu Controls the right-click context menu. Accepts:
#'   \itemize{
#'     \item \code{TRUE} (default) - show all built-in items
#'     \item \code{FALSE} - disable the menu
#'     \item a character vector of item names - show only the listed items,
#'           in the given order. Valid names: \code{"row_above"},
#'           \code{"row_below"}, \code{"remove_row"}, \code{"undo"},
#'           \code{"redo"}, \code{"copy"}, \code{"clear"},
#'           \code{"clear_column"}. Use \code{"---"} to insert a separator.
#'   }
#' @param none_value Deprecated and ignored. Dropdown cells can be cleared with
#'   the Delete or Backspace key. Kept for backward compatibility.
#' @param height Table height (default: "100\%").
#' @param width Table width (default: "100\%").
#' @param cell_conditions A list of conditional cell configurations (see Details).
#'
#' @details
#' ## Column Configuration
#'
#' Each column should be a list with the following elements:
#' \itemize{
#'   \item \code{name} - Column name (required)
#'   \item \code{type} - Column type: "text", "numeric", "checkbox", "dropdown",
#'         "multiselect", or "date" (required)
#'   \item \code{source} - Options for dropdown/multiselect columns
#'   \item \code{sortable} - Enable drag-and-drop sorting for multiselect
#'         (default: FALSE)
#'   \item \code{validate} - Validate dropdown values (default: TRUE)
#'   \item \code{readOnly} - Make column read-only (default: FALSE)
#'   \item \code{width} - Column width in pixels
#'   \item \code{dateFormat} - Moment.js format string for date columns
#'         (default: "YYYY-MM-DD")
#'   \item \code{correctFormat} - Auto-correct user-typed dates to the
#'         declared format (default: TRUE)
#'   \item \code{defaultDate} - Date shown when the cell is empty and
#'         the calendar picker opens
#' }
#'
#' ## Context Menu
#'
#' The built-in right-click menu includes: insert row above/below,
#' remove row, undo/redo, copy, clear selection, and clear column.
#' Set \code{context_menu = FALSE} to disable it, or pass a character
#' vector of item names to show only a subset - for example
#' \code{context_menu = c("row_above", "row_below", "---", "remove_row")}.
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
#' @return A Shiny UI element containing the Handsontable widget.
#'
#' @examples
#' if (interactive()) {
#' library(shiny)
#'
#' ui <- fluidPage(
#'   esq_tableInput("myTable",
#'     data = data.frame(
#'       name = c("Item 1", "Item 2"),
#'       category = c("A", "B"),
#'       active = c(TRUE, FALSE),
#'       stringsAsFactors = FALSE
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
#'     data <- jsonlite::fromJSON(input$myTable_edited)
#'     print(data)
#'   })
#' }
#'
#' shinyApp(ui, server)
#' }
#'
#' @seealso \code{\link{updateEsqTable}}
#'
#' @importFrom base64enc base64encode
#' @importFrom jsonlite toJSON
#' @importFrom htmltools htmlDependency tags
#' @importFrom reactR createReactShinyInput
#' @importFrom shiny restoreInput
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
  stopifnot(
    is.character(inputId), length(inputId) == 1L,
    is.null(data) || is.data.frame(data),
    is.list(columns),
    is.list(options),
    is.list(column_descriptions),
    is.logical(show_action_buttons), length(show_action_buttons) == 1L,
    (is.logical(context_menu) && length(context_menu) == 1L) || is.character(context_menu),
    is.character(none_value), length(none_value) == 1L,
    is.list(cell_conditions)
  )

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
#' Dynamically updates the data, dropdown options, or column configurations
#' for an existing esq.handsontable widget without recreating the table.
#'
#' @param session The Shiny session object.
#' @param inputId The input ID of the table to update.
#' @param data New data frame (optional).
#' @param options A named list where names are column names and values are
#'   character vectors of new dropdown options (optional).
#' @param columns Updated column configurations (optional).
#'
#' @return Called for side effect (sends message to client). Returns
#'   \code{invisible(NULL)}.
#'
#' @examples
#' if (interactive()) {
#' server <- function(input, output, session) {
#'   observeEvent(input$update_button, {
#'     updateEsqTable(session, "my_table",
#'       options = list(
#'         category = c("New A", "New B", "New C"),
#'         status = c("Active", "Inactive")
#'       )
#'     )
#'   })
#' }
#' }
#'
#' @seealso \code{\link{esq_tableInput}}
#'
#' @importFrom jsonlite toJSON
#' @importFrom base64enc base64encode
#' @export
updateEsqTable <- function(
  session,
  inputId,
  data = NULL,
  options = NULL,
  columns = NULL
) {
  stopifnot(
    is.character(inputId), length(inputId) == 1L,
    is.null(data) || is.data.frame(data),
    is.null(options) || is.list(options),
    is.null(columns) || is.list(columns)
  )

  message <- list()

  if (!is.null(data)) {
    data_json <- jsonlite::toJSON(data, dataframe = "rows", auto_unbox = TRUE)
    message$data <- base64enc::base64encode(charToRaw(as.character(data_json)))
    # Nonce forces the JS binding to re-parse even when the payload is
    # byte-identical to the prior one (e.g. resetting after row add/delete).
    message$data_nonce <- as.numeric(Sys.time())
  }

  if (!is.null(options)) {
    message$options <- options
  }

  if (!is.null(columns)) {
    message$columns <- columns
  }

  session$sendInputMessage(inputId, message)
  invisible(NULL)
}
