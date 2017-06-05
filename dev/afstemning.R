
url <-  "http://oda.ft.dk/api/Afstemning"

all_values <- list()

i <- 1

repeat{

  message(paste("Run #", i))

  ft_data <- httr::GET(url)
  ft_data <- httr::content(ft_data)
  value <- null_to_na(ft_data$value)
  value_df <- purrr::map_df(value, function(x) tibble::as_tibble(x))

  all_values <- c(all_values, list(value_df))

  url <- ft_data$odata.nextLink

  if(is.null(url)) break

  i <- i + 1

}

all_values_df <- dplyr::bind_rows(all_values)

