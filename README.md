
<!-- README.md is generated from README.Rmd. Please edit that file -->
ftDK
====

The goal of `ftDK` is to provide an easy wrapper in R for the API of the Danish Parliament. You can see the website for the API her: <http://www.ft.dk/AabneData.aspx>

Installation
------------

You can install ftDK from github with:

``` r
# install.packages("devtools")
devtools::install_github("mikkelkrogsholm/ftDK")
```

Example
-------

This is a basic example which shows you how to solve a common problem:

``` r
library(ftDK)

# See the avaible endpoints 
see_endpoints()
#>  [1] "afstemning"              "afstemningstype"        
#>  [3] "aktstykke"               "aktoer"                 
#>  [5] "aktoeraktoer"            "aktoeraktoerrolle"      
#>  [7] "aktoertype"              "almdel"                 
#>  [9] "dagsordenspunkt"         "dagsordenspunktdokument"
#> [11] "dagsordenspunktsag"      "debat"                  
#> [13] "dokument"                "dokumentaktoer"         
#> [15] "dokumentaktoerrolle"     "dokumentkategori"       
#> [17] "dokumenttype"            "dokumentstatus"         
#> [19] "emneord"                 "emneorddokument"        
#> [21] "emneordsag"              "emneordstype"           
#> [23] "eusag"                   "forslag"                
#> [25] "fil"                     "kollonebeskrivelse"     
#> [27] "entitetbeskrivelse"      "moede"                  
#> [29] "moedeaktoer"             "moedestatus"            
#> [31] "moedetype"               "omtryk"                 
#> [33] "periode"                 "sag"                    
#> [35] "sagaktoer"               "sagaktoerrolle"         
#> [37] "sagdokument"             "sagdokumentrolle"       
#> [39] "sagskategori"            "sagsstatus"             
#> [41] "sagstrin"                "sagstrinaktoer"         
#> [43] "sagstrinaktoerrolle"     "sambehandlinger"        
#> [45] "sagstrindokument"        "sagstrinsstatus"        
#> [47] "sagstrinstype"           "sagstype"               
#> [49] "stemme"                  "stemmetype"

# Lets fetch the data for the "afstemning" endpoint
ft_data  <- get_ft("afstemning")
#> Fetching 1763 rows of data
#> Putting it all in to one data frame

# Lets have a look at the data
ft_data
#> # A tibble: 1,763 × 9
#>       id nummer
#>    <int>  <int>
#> 1      1    411
#> 2      2    412
#> 3      5    412
#> 4      6    410
#> 5      7    408
#> 6      8    407
#> 7      9    404
#> 8     10    405
#> 9     11    406
#> 10    12    400
#> # ... with 1,753 more rows, and 7 more variables: konklusion <chr>,
#> #   vedtaget <lgl>, kommentar <chr>, mødeid <int>, typeid <int>,
#> #   sagstrinid <int>, opdateringsdato <chr>
```

This is a first version of the package. It does the job of pulling data from the API. Next up will be to create more elaborate functions. Please contribute to the package if you can.
