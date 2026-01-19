test_that("esq_tableInput creates valid HTML", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(
      name = c("A", "B"),
      value = c(1, 2)
    ),
    columns = list(
      list(name = "name", type = "text"),
      list(name = "value", type = "numeric")
    )
  )


  expect_s3_class(result, "shiny.tag")
})

test_that("esq_tableInput handles column types", {
  skip_if_not_installed("shiny")

  # Test all column types
  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(
      text_col = "text",
      num_col = 1,
      check_col = TRUE,
      drop_col = "A",
      multi_col = "A, B"
    ),
    columns = list(
      list(name = "text_col", type = "text"),
      list(name = "num_col", type = "numeric"),
      list(name = "check_col", type = "checkbox"),
      list(name = "drop_col", type = "dropdown", source = c("A", "B")),
      list(name = "multi_col", type = "multiselect", source = c("A", "B", "C"))
    )
  )

  expect_s3_class(result, "shiny.tag")
})

test_that("esq_tableInput handles cell_conditions", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(
      type = "A",
      value = 1
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

  expect_s3_class(result, "shiny.tag")
})

test_that("esq_tableInput handles column_descriptions", {
  skip_if_not_installed("shiny")

  result <- esq_tableInput(
    inputId = "test_table",
    data = data.frame(name = "A", value = 1),
    columns = list(
      list(name = "name", type = "text"),
      list(name = "value", type = "numeric")
    ),
    column_descriptions = list(
      name = "The name field",
      value = "The value field"
    )
  )

  expect_s3_class(result, "shiny.tag")
})
