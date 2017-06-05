/**
 * @fileoverview Script to handle the request for each navigation property to 
 *      determine if we have data to show or not. Used in Webapi.cshtml.
 * @author as@ft.dk (Anders Svensson)
 */

function GetDataFromNavigationProp() {
    var url = $('.theText').text();
    var navigationArray = [];

    $('.navigationElement, .disabledNavigationElement').each(function (index) {
        navigationArray.push($(this).attr('id'));
    });

    GetDataFromNavigation(navigationArray, url);
}

function CreateNavigationUrl(navigation, url)
{
    url = url.replace("?$inlinecount=allpages", "");
    url = url + "/" + navigation;
    return url;
}

function GetDataFromNavigation(navigationArray, url)
{
    if (navigationArray.length < 1)
        return;
    var navigation = navigationArray.pop();
    navigation = navigation.replace("Navigation", "");
    var correctedUrl = CreateNavigationUrl(navigation, url);

    $.ajax({
        url: correctedUrl,
        type: 'GET',
        success: function (data) {
            if (data.id != undefined || (data.value != undefined && data.value.length > 0)) {
                $('#Navigation' + navigation).removeClass("disabledNavigationElement");
                $('#Navigation' + navigation).addClass("navigationElement");
            }
            else {
                $('#Navigation' + navigation).removeClass("navigationElement");
                $('#Navigation' + navigation).addClass("disabledNavigationElement");
            }
            GetDataFromNavigation(navigationArray, url);

        },
        error: function (x, y, z) {
            if (x.statusText == "timeout") {
                // Det kan være at vores request tar lang tid og hvis det tar lang tid tror vi at der findes data at hente.
                $('#Navigation' + navigation).removeClass("disabledNavigationElement");
                $('#Navigation' + navigation).addClass("navigationElement");
            }
            else {
                $('#Navigation' + navigation).removeClass("navigationElement");
                $('#Navigation' + navigation).addClass("disabledNavigationElement");
            }
            GetDataFromNavigation(navigationArray, url);
        },
        timeout: 2000
    });
}
