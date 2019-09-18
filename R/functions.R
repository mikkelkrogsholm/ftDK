
#### null_to_na #### ----
# Is not exported. It is a helper.

#' Turns NULL values in a list into NAs.
#'
#' @param mylist is a list, where the NULL values are to be turned into NAs.

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


#### see_endpoints #### ----

#' See the available endpoints in the API
#'
#' @return A vector of possible endpoints
#' @export
#'
#' @examples
#' library(ftDK)
#' see_endpoints()

see_endpoints <- function(){
  ftDK::api_endpoints$endpoint
}

#### get_ft #### ----

#' Get data from the API
#'
#' @param endpoint is the endpoint in the API that you want data from.
#' @param extraargs is aditional arguments to be used when calling the API - eg. filter
#'
#' @return a data frame with the data requested
#' @export
#'
#' @examples
#'
#'\dontrun{
#' library(ftDK)
#' see_endpoints()
#' ft_data  <- get_ft("afstemning")
#' ft_data
#' }

get_ft <- function(endpoint, extraargs = NULL){

  # Make local copy of the endpoints data frame
  endpoint_df <- ftDK::api_endpoints

  # Extract the appropriate href for the endpoint
  href <- endpoint_df$href[which(endpoint_df$endpoint == endpoint)]

  # Create a baseurl for that endpoint
  base_url <- paste0("https://oda.ft.dk/api/", href, "?$inlinecount=allpages")

  if(!is.null(extraargs)){
    base_url <- paste0(base_url, extraargs)
  }

  # Get total page count
  ft_data <- httr::GET(base_url)
  ft_data <- httr::content(ft_data)
  odata.count <- as.numeric(ft_data$odata.count)

  # Create vector of offsets to run throug
  seqnr <- seq(0, ceiling(odata.count/20)*20, 20)

  # User feedback
  message(paste("Fetching", odata.count, "rows of data"))

  # Use an lapply loop to fetch data
  ft_data_list <- pbapply::pblapply(seqnr, function(i){

    url <- paste0(base_url, "&$skip=", as.integer(i))

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
