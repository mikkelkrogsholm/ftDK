null_to_na <- function (mylist) {
  lapply(mylist, function(x) {
    if (is.list(x)) {
      null_to_na(x)
    }
    else {
      if (is.null(x))
        NA
      else x
    }
  })
}

se_endpoints <- function(){
  api_endpoints$endpoint
}

hent_fra_ft <- function(endpoint){

  endpoint_df <- ftDK::api_endpoints

  href <- endpoint_df$href[which(endpoint_df$endpoint == endpoint)]

  base_url <- paste0("http://oda.ft.dk/api/", href, "?$inlinecount=allpages")

  # Get total page count
  ft_data <- httr::GET(base_url)
  ft_data <- httr::content(ft_data)
  odata.count <- as.numeric(ft_data$odata.count)

  # Create vector of offsets to run throug
  seqnr <- seq(0, ceiling(odata.count/20)*20, 20)

  # User feedback
  message(paste("Fetching", odata.count, "rows of data"))

  # Apply loop to fetch data
  ft_data_list <- pbapply::pblapply(seqnr, function(i){

    url <- paste0(base_url, "&$skip=", i)

    ft_data <- httr::GET(url)
    ft_data <- httr::content(ft_data)
    value <- null_to_na(ft_data$value)
    value_df <- purrr::map_df(value, function(x) tibble::as_tibble(x))

    return(value_df)
  })

  # Put all data into one data frame
  message("Putting it all in to one data frame")
  ft_data_df <- dplyr::bind_rows(ft_data_list)

  # Return the data
  return(ft_data_df)

}
