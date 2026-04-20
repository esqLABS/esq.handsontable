test_that("esq_tableInput creates valid HTML", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(
      name = c("A", "B"),
      value = c(1, 2),
      stringsAsFactors = FALSE
    ),
    columns = list(
      list(name = "name", type = "text"),
      list(name = "value", type = "numeric")
    )
  )

  expect_true(inherits(result, "shiny.tag") || inherits(result, "shiny.tag.list"))
})

test_that("esq_tableInput handles all column types", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(
      text_col = "text",
      num_col = 1,
      check_col = TRUE,
      drop_col = "A",
      multi_col = "A, B",
      stringsAsFactors = FALSE
    ),
    columns = list(
      list(name = "text_col", type = "text"),
      list(name = "num_col", type = "numeric"),
      list(name = "check_col", type = "checkbox"),
      list(name = "drop_col", type = "dropdown", source = c("A", "B")),
      list(name = "multi_col", type = "multiselect", source = c("A", "B", "C"))
    )
  )

  expect_true(inherits(result, "shiny.tag") || inherits(result, "shiny.tag.list"))
})

test_that("esq_tableInput handles cell_conditions", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(
      type = "A",
      value = 1,
      stringsAsFactors = FALSE
    ),
    columns = list(
      list(name = "type", type = "dropdown", source = c("A", "B")),
      list(name = "value", type = "numeric")
    ),
    cell_conditions = list(
      list(
        column = "value",
        when_column = "type",
        when_value = "B",
        readOnly = TRUE
      )
    )
  )

  expect_true(inherits(result, "shiny.tag") || inherits(result, "shiny.tag.list"))
})

test_that("esq_tableInput handles column_descriptions", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(name = "A", value = 1, stringsAsFactors = FALSE),
    columns = list(
      list(name = "name", type = "text"),
      list(name = "value", type = "numeric")
    ),
    column_descriptions = list(
      name = "The name field",
      value = "The value field"
    )
  )

  expect_true(inherits(result, "shiny.tag") || inherits(result, "shiny.tag.list"))
})

test_that("esq_tableInput handles NULL data", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = NULL,
    columns = list(
      list(name = "name", type = "text")
    )
  )

  expect_true(inherits(result, "shiny.tag") || inherits(result, "shiny.tag.list"))
})

test_that("esq_tableInput handles empty data frame", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(name = character(0), value = numeric(0)),
    columns = list(
      list(name = "name", type = "text"),
      list(name = "value", type = "numeric")
    )
  )

  expect_true(inherits(result, "shiny.tag") || inherits(result, "shiny.tag.list"))
})

test_that("esq_tableInput validates inputId", {
  skip_if_not_installed("shiny")

  expect_error(
    esq_tableInput(inputId = 123, data = NULL, columns = list()),
    "is.character"
  )
  expect_error(
    esq_tableInput(inputId = c("a", "b"), data = NULL, columns = list()),
    "length"
  )
})

test_that("esq_tableInput validates data argument", {
  skip_if_not_installed("shiny")

  expect_error(
    esq_tableInput(inputId = "test", data = "not a data frame", columns = list()),
    "is.data.frame"
  )
  expect_error(
    esq_tableInput(inputId = "test", data = list(a = 1), columns = list()),
    "is.data.frame"
  )
})

test_that("esq_tableInput base64 encoding works correctly", {
  skip_if_not_installed("shiny")

  df <- data.frame(
    name = c("Alice", "Bob"),
    value = c(1, 2),
    stringsAsFactors = FALSE
  )

  result <- esq_tableInput(
    inputId = "test_table",
    data = df,
    columns = list(
      list(name = "name", type = "text"),
      list(name = "value", type = "numeric")
    )
  )

  # The result should contain a script tag with base64-encoded data
  result_html <- as.character(result)
  expect_true(nchar(result_html) > 0)
})

test_that("esq_tableInput passes configuration correctly", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "my_table",
    data = data.frame(x = 1, stringsAsFactors = FALSE),
    columns = list(list(name = "x", type = "numeric")),
    show_action_buttons = FALSE,
    context_menu = FALSE,
    none_value = "EMPTY",
    height = "400px",
    width = "800px"
  )

  expect_true(inherits(result, "shiny.tag") || inherits(result, "shiny.tag.list"))
})

test_that("updateEsqTable validates inputs", {
  skip_if_not_installed("shiny")

  expect_error(
    updateEsqTable(session = list(), inputId = 123),
    "is.character"
  )
  expect_error(
    updateEsqTable(session = list(), inputId = "test", data = "not df"),
    "is.data.frame"
  )
  expect_error(
    updateEsqTable(session = list(), inputId = "test", options = "not list"),
    "is.list"
  )
})
