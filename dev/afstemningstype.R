url <- "http://oda.ft.dk/api/Afstemningstype"

ft_data <- httr::GET(url)
ft_data <- httr::content(ft_data)
value <- null_to_na(ft_data$value)
value_df <- purrr::map_df(value, function(x) tibble::as_tibble(x))
