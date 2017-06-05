
url <- "http://oda.ft.dk/api/"

api_info <- xml2::read_xml(url)

api_list <- xml2::as_list(api_info)

api_list <- api_list[[1]]
api_list <- api_list[-1]

api_endpoints <- purrr::map_df(api_list, function(x){
  tibble::tibble(
    endpoint = unlist(x$title),
    href = attributes(x)$href
  )
})


api_endpoints$endpoint <- tolower(api_endpoints$endpoint)
api_endpoints$endpoint <- stringr::str_replace_all(api_endpoints$endpoint, "æ", "ae")
api_endpoints$endpoint <- stringr::str_replace_all(api_endpoints$endpoint, "ø", "oe")
api_endpoints$endpoint <- stringr::str_replace_all(api_endpoints$endpoint, "å", "aa")

devtools::use_data(api_endpoints, overwrite = T)
