var d = new Date();
var pageSize = 20; // change if the value in WebApi changes.
var currentUrl;

$(document).ready(function () {

    // Set min height of .containerBody
    handleContainerBody();
    $(window).resize(function () {
        handleContainerBody();
    });

    $('input:radio[value=Equal]').attr('checked', true);
    GetPropertiesForEntity(true);
    GetNavigationPropertiesForEntity(true, false);

    $("body").keydown(function (e) {
        var keyCode = (window.event) ? e.which : e.keyCode;
        if (keyCode == 13) {
            $("#searchButtonFree").focus();
        }
    });

    $('.fa-info-circle').mouseover(function (e) {
        var id = $(this).attr('id');
        var top = e.pageY;
        var left = e.pageX + 20;

        $("." + id + "Info").css({ top: top + 'px', left: left + 'px' });

        $("." + id + "Info").show();
    });

    $('.fa-info-circle').mouseout(function () {
        var id = $(this).attr('id');
        $("." + id + "Info").hide();
    });

    $('#freeSearch').change(function () {
        GetPropertiesForEntity(true);
        GetNavigationPropertiesForEntity(true, false);
    });

    $('#newValueToSearch').change(function () {
        if ($('#newValueToSearch').is(':checked'))
        {
            $('.idSearchArea').hide(100);
        }
        else
        {
            $('.idSearchArea').show(100);
        }
    });

    $('#searchButtonFree').click(function () {
        var idValueInput = $('#keyValueToSearch').val() != undefined && $('#keyValueToSearch').val() != '';
        var searchTextValue = $('#searchPropertySearchValue').val() != '';
        var searchOnlyNew = $('#newValueToSearch').is(':checked');
        if (idValueInput && !searchTextValue && !searchOnlyNew) {
            Search(undefined, 'key', true);
            GetDataFromNavigationProp();
        }
        else {
            Search(undefined, 'free', false);
        }
    })

    $('#searchButtonXML').click(function () {
        var url = $('.theText a').attr('href');
        GetXMLResponse(url);
    })

    $('#searchButtonJSON').click(function () {
        var url = $('.theText a').attr('href');
        GetJSONResponse(url);
    })

    $('#newMenuItemOdata').click(function () {
        var odataQueryUrl = BuildBaseUrl() + "Home/OdataQuery";
        window.location.replace(odataQueryUrl);
    });

    $('#newMenuItemModel').click(function () {
        var modelOdaurl = BuildBaseUrl() + "Home/OdaModel";
        window.location.replace(modelOdaurl);
    });

    $('#newMenuItemBrowser').click(function () {
        var modelOdaurl = BuildBaseUrl() + "Home/WebApi";
        window.location.replace(modelOdaurl);
    });

    $('.closeUrl').click(function () {
        $('.generatedQueryUrl').hide();
    });
});

function handleContainerBody()
{
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var resultInProcent = (((windowWidth - 241) / windowWidth)*100)-8;

    $('.containerBody').css('min-height', (windowHeight - 183) + 'px');
    $('.resultContainer').css('width', resultInProcent + '%')
}

function containerImage()
{
    if ($('.newContentSkov').css('max-height') == '0px' && $('.newContentClouds').css('max-height') == '0px') {
        setTimeout(function () { $('.newContentSkov').css('max-height', '200px'); }, 1000);
    }
    else if ($('.newContentSkov').css('max-height') == '200px') {
        $('.newContentSkov').css('max-height', '0px');
        setTimeout(function () { $('.newContentClouds').css('max-height', '200px'); }, 1000);
    }
    else if ($('.newContentClouds').css('max-height') == '200px') {
        $('.newContentSkov').css('max-height', '0px');
        $('.newContentClouds').css('max-height', '0px');
    }
}

function HideRequestInformation()
{
    $('.noDataFound').hide();
    $('.errorInApplication').hide();
}

function ResetSearchValues() {
    $('.resultArea').empty();
    $('#keyValueToSearch').val('');
    $('#newValueToSearch').removeAttr('checked');
    $('#dateTimeLastSearch').text('');
    $('.queryResultText').text('');
    $('.filterArea').hide(100);
    $('#searchPropertySearchValue').val('');
}

function ShowTheAjaxLoader()
{
    var top = Math.max(0, (($(window).height() / 2) + $(window).scrollTop()));
    var left = Math.max(0, (($(window).width() / 2) + $(window).scrollLeft()));
    $('#ajaxLoader').css('top', top + 'px');
    $('#ajaxLoader').css('left', left + 'px');
    $('#ajaxLoader').show();
}

function GetFilterRadioValue() {
    return $('input:radio[name=FilterRadio]:checked').val();
}

function GetNavigationPropertiesForEntity(resetSearchValues, getDataFromProp) {
    var baseUrl = BuildBaseUrl();

    if (resetSearchValues) {
        ResetSearchValues();
    }
    
    var selectedValue = $('#freeSearch :selected').attr('id');
    var url = baseUrl + 'Home/GetNavigationPropertiesForEntity?entity=' + selectedValue;
    url = encodeURI(url);
    var navigationProp = new Array();
    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            for (var i = 0; i < data.Navigations.length; i++) {
                navigationProp.push(data.Navigations[i]);
            }
            DisplayNavigationProp(navigationProp);
            if (getDataFromProp) {
                GetDataFromNavigationProp();
            }
        },
        error: function (x, y, z) {
        }
    });
}

function GetPropertiesForEntity(resetSearchValues) {
    var selectedValue = $('#freeSearch option:selected').attr('id');

    var baseUrl = BuildBaseUrl();
  
    if (resetSearchValues) {
        ResetSearchValues();
    }
    var url = baseUrl + 'Home/GetPropertiesForEntity?entity=' + selectedValue;
    url = encodeURI(url);
    var properties = new Array();
    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            DisplayProperties(data);
        },
        error: function (x, y, z) {
        }
    });
}

function Search(expandProp, search, drilldown) {
    var selectedEntity = $('#freeSearch option:selected').val();
    $('#searchPropertyValueList').removeClass("errorColor");
    var url = GetCorrectUrl(selectedEntity);
    if (search == 'key') {
        if(CheckKeyValue(false))
            GetRequest(url + GetCorrectExpandProperty($('#keyValueToSearch').val(), expandProp, drilldown));
    }
    else {
        if ($('#newValueToSearch').is(':checked')) {
            url = GenerateGetNewUrl(url);
        }
        else if ($('#searchPropertySearchValue').val() != '') {
            var searchText = $('#searchPropertySearchValue').val();
            var propName = $('#propertyList option:selected').attr('id');
            var propType = $('#propertyList option:selected').attr('data-item');
            if (propType != undefined && propType != '') {
                url = GenerateGetNewFilterUrl(url, propName, propType, searchText);
            }
            else {
                $('#searchPropertyValueList').addClass("errorColor");
                return;
            }
        }
        else {
            url += '?$inlinecount=allpages';
        }
        GetRequest(url);
    }
}

function DisplayProperties(data) {
    $('#searchPropertyValueList').html(data);
    $('#propertyList').change(function () {
        var propName = $('#propertyList option:selected').attr('data-item');
        if (propName != '') {
            $('.idSearchArea').hide(100);
            if (propName == "Edm.DateTime") {
                $('#searchPropertySearchValue').datepicker();
                $('.filterArea').show(300);
            }
            else {
                $("#searchPropertySearchValue").datepicker("destroy");
                $('.filterArea').show(300);
            }
        }
        else {
            $('.filterArea').hide(100);
            $('.idSearchArea').show(100);
            $('#searchPropertySearchValue').val('');
        }
    });
}

function DisplayNavigationProp(array) {
    var divContainer = document.createElement('div');
    for (var i = 0; i < array.length; i++) {
        var element = document.createElement('div');
        element.className = 'disabledNavigationElement';
        element.id = 'Navigation' + array[i];
        element.textContent = array[i];
        element.onclick = function (element) {
            NavigationPropertyClicked(element);
        }
        divContainer.appendChild(element);
    }
    $('#navigationArea').html(divContainer);
}

function GetCorrectExpandProperty(keyValue, expandProp, drilldown) {
    var returnString = '(' + keyValue + ')';
    if (expandProp != undefined && expandProp != '') {
        returnString += '/' + expandProp;
    }
    if (drilldown)
    {
        return returnString;
    }
    else
        return returnString + '?$inlinecount=allpages';
}

function GetCorrectUrl(url) {
    var baseUrl = window.location.host;
    var correctedUrl = url.replace("[server]", baseUrl);
    return correctedUrl;
}

function CreateDivHead() {
    var mainDiv = document.createElement('div');
    mainDiv.className = 'resultDiv';
    return mainDiv;
}

function EnableFormatButton()
{
    $('.showWhenResult').show();
}

function CreateRequestedUrlLink(url) {
    var link = document.createElement('a');
    link.setAttribute("target", "_blank");
    link.setAttribute("href", url);
    var linkText = document.createTextNode(url);
    link.appendChild(linkText);
    currentUrl = url;
    EnableFormatButton();
    return link;
}

function CreateDivHeadLink(forwardlink, backwardlink) {
    var tblrow = document.createElement('div');

    var tblrow = document.createElement('div');
    var tblcellValue = document.createElement('div');
    tblcellValue.className = "nextLink";

    if (backwardlink != undefined) {
        var linkbackward = document.createElement('i');
        linkbackward.className = "fa fa-backward navigationLink";
        linkbackward.onclick = function () {
            GetRequest(backwardlink);
        }
        tblcellValue.appendChild(linkbackward);
    }
    else {
        var linkbackward = document.createElement('i');
        linkbackward.className = "fa fa-backward navigationLinkDisabled";
        tblcellValue.appendChild(linkbackward);
    }
    if (forwardlink != undefined) {
        var link = document.createElement('i');
        link.className = "fa fa-forward navigationLink";
        link.onclick = function () {
            GetRequest(forwardlink);
        }

        tblcellValue.appendChild(link);
    }
    else {
        var link = document.createElement('i');
        link.className = "fa fa-forward navigationLinkDisabled";
        tblcellValue.appendChild(link);
    }

    // create expand icon field
    var expand = document.createElement('i');
    expand.className = "fa fa-expand expandLink";
    expand.onclick = function () {
        ExpandResults();
    }

    // create show link
    var queryLink = document.createElement('i');
    queryLink.className = "fa fa-link showQueryLink";
    queryLink.onclick = function () {
        ShowQueryLink();
    }

    // create queryResult
    var queryResultText = document.createElement('span');
    queryResultText.className = "queryResultText";

    tblcellValue.appendChild(expand);
    tblcellValue.appendChild(queryLink);
    tblcellValue.appendChild(queryResultText);

    tblrow.appendChild(tblcellValue);
    return tblrow;
}

function CreateTableRow(prop, key) {
    var tblrow = document.createElement('div');
    tblrow.className = 'resultElement';
    var tblcellProp = document.createElement('div');
    tblcellProp.className = 'boldColumn';
    var tblcellValue = document.createElement('div');
    tblcellValue.className = 'resultElementValue';
    tblcellProp.textContent = prop;
    if (key != undefined && key != "" && !isWhiteSpace(key)) {
        tblcellValue.textContent = key;
    }
    else {
        if ((key == false || key == true) && !isWhiteSpace(key)) {
            tblcellValue.textContent = key
        }
        else {
            if (isNull(key)) {
                tblcellValue.textContent = "";
            }
            else {
                tblcellValue.textContent = "";
            }
        }
    }
    tblrow.appendChild(tblcellProp);
    tblrow.appendChild(tblcellValue);
    var clear = document.createElement('div');
    clear.className = 'clearDiv';
    tblrow.appendChild(clear);
    return tblrow;
}

function isWhiteSpace(str) {
    var trimmedStr = $.trim(str);
    return trimmedStr === "";
}

function isNull(str) {
    return str === null;
}

function CreateObjectRow(property, key) {
    return CreateTableRow(property, key[property]);
}

// Generates a new url if we whant to search for new items
function GenerateGetNewUrl(url) {
    var dateString = GenerateDateTimeString(d);
    //'2014-01-03T13:10:20.757'
    url += '?$inlinecount=allpages&$filter=opdateringsdato%20gt%20datetime\'' + dateString + '\'';
    return url;
}

// Generates a new url if we whant to search for new items
function GenerateGetNewFilterUrl(url, filterName, filterType, filterText) {
    if (filterType == 'Edm.String') {
        if (GetFilterRadioValue() == 'Equal') {
            url += '?$inlinecount=allpages&$filter=' + filterName + '%20eq%20' + '\'' + filterText + '\'';
        }
        else {
            url += '?$inlinecount=allpages&$filter=substringof(\'' + filterText + '\',' + filterName + ')%20eq%20true';
        }
    }
    else if (filterType == 'Edm.Int32') {
        url += '?$inlinecount=allpages&$filter=' + filterName + '%20eq%20' + filterText;
    }
    else if (filterType == 'Edm.Boolean') {
        url += '?$inlinecount=allpages&$filter=' + filterName + '%20eq%20' + filterText;
    }
    else if (filterType == 'Edm.DateTime') {
        url += '?$inlinecount=allpages&$filter=year(' + filterName + ') eq ' + filterText.substring(0, 4) + ' and month(' + filterName + ') eq ' + parseInt(filterText.substring(5, 7)) + ' and day(' + filterName + ') eq ' + parseInt(filterText.substring(8, 10));
    }
    return url;
}

function CheckKeyValue(ignoreErrorDisplay) {
    var value = $('#keyValueToSearch').val() != undefined && $('#keyValueToSearch').val() != '';
    if (value)
        $('#keyValueToSearch').removeClass('errorBorder');
    else {
        if (!ignoreErrorDisplay) {
            $('#keyValueToSearch').addClass('errorBorder');
        }
    }
    return value;
}

// Get the value from the navigation prop
function NavigationPropertyClicked(element) {
    if (CheckKeyValue(element.target.className == "disabledNavigationElement")) {
        var expandProp = element.target.id.replace("Navigation", "");
        if (element.target.className != "disabledNavigationElement") {
            Search(expandProp, "key", false);
        }
    }
}

// Create a date time string from a date
function GenerateDateTimeString(dateTime) {
    var dateString = '';
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth();
    month++;
    if (month < 10) {
        month = '0' + month;
    }
    var day = dateTime.getUTCDate();
    if (day < 10) {
        day = '0' + day;
    }
    var hour = dateTime.getHours();
    if (hour < 10) {
        hour = '0' + hour;
    }
    var minute = dateTime.getMinutes();
    if (minute < 10) {
        minute = '0' + minute;
    }
    var second = dateTime.getSeconds();
    if (second < 10) {
        second = '0' + second;
    }
    var millisecond = dateTime.getMilliseconds();

    dateString = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second + '.' + millisecond;
    return dateString;
}

function HandleResultItemContainer() {
    var clickedElement = $(this);
    var elementToShow = $('#' + clickedElement.parent().attr('id') + "resultItemsContainer");
    var visible = $('#' + elementToShow.attr('id') + ':visible').length;
    if (visible == 0) {
        elementToShow.show(100);
    }
    else {
        elementToShow.hide(100);
    }
}

function HandleResultItemDrillDown()
{
    var clickedElement = $(this);
    $('#keyValueToSearch').val(clickedElement.attr('data-id'));
    var dataItem = clickedElement.attr('data-item');
    $("#freeSearch option[id=" + dataItem + "]").prop('selected', true);
    Search(undefined, 'key', true);
    GetPropertiesForEntity(false);
    GetNavigationPropertiesForEntity(false, true);
}

function CreateBackwardLink(nextLink)
{
    if (nextLink != undefined && nextLink != '') {
        var nextLinkSkip = (nextLink.indexOf("skip=") != -1);
        var currentLinkSkip = (currentUrl.indexOf("skip=") != -1);
        if (currentLinkSkip && !(currentUrl.indexOf("skip=0") != -1))
        {
            var lengtOfcurrentUrl = currentUrl.length;
            var skipNumber = currentUrl.substring(currentUrl.indexOf("skip=") + 5, lengtOfcurrentUrl);
            var newSkipNumber = skipNumber - pageSize;
            return currentUrl.substring(0, currentUrl.indexOf("skip=") + 5) + newSkipNumber;
        }
        else
        {
            return undefined;
        }
    }
    else {
        var currentLinkSkip = (currentUrl.indexOf("skip=") != -1);
        if (currentLinkSkip)
        {
            var lengtOfcurrentUrl = currentUrl.length;
            var skipNumber = currentUrl.substring(currentUrl.indexOf("skip=") + 5, lengtOfcurrentUrl);
            var newSkipNumber = skipNumber - pageSize;
            return currentUrl.substring(0, currentUrl.indexOf("skip=") + 5) + newSkipNumber;
        }
        return undefined;
    }
}

function GenerateRowHTML(id, datetime, titel)
{
    var row = document.createElement('div');
    row.className = "resultRowElement";
    row.onclick = HandleResultItemContainer;
    if (titel != undefined && titel != "") {
        row.innerHTML = '<div class=resultRowIdentifier>' + id + '</div><div class=resultRowTitle>' + titel + '</span><div class=resultRowDateTime>' + datetime.substring(0, 19).replace('T', ' ') + '</div>';
    }
    else
    {
        row.innerHTML = '<div class=resultRowIdentifier>' + id + '</div><div class=resultRowDateTime>' + datetime.substring(0, 19).replace('T', ' ') + '</div>';
    }
    return row;
}

function GenerateDrillDownElement(data, id)
{
    var odataMetadata = data['odata.metadata'];
    var index = odataMetadata.indexOf("#");
    var odataElement = odataMetadata.substring(index + 1);
    var element = document.createElement('div');
    element.className = "resultRowDrillDownElement";
    element.setAttribute('data-item', decodeURIComponent(odataElement.replace("/@Element", "")));
    element.setAttribute('data-id', id);
    element.setAttribute('title', 'Navigere videre');
    element.onclick = HandleResultItemDrillDown;
    element.innerHTML = '<i class="fa fa-cog"></i>';
    return element;
}

function GetResultText(data)
{
    var totalCount = data["odata.count"];
    if (totalCount != 0)
    {
        var pages = totalCount / pageSize;
        var ceil = Math.ceil(pages);
        if (data["odata.nextLink"] != undefined) {
            var nextLink = data["odata.nextLink"];
            indexOfSkip = nextLink.indexOf('skip=');
            var skipvalue = parseInt(nextLink.substring(indexOfSkip + 5));
            if (!skipvalue)
                skipvalue = 0;
            var currentPageIndex = parseInt(skipvalue / pageSize);
            return 'Viser ' + (skipvalue - pageSize + 1) + ' - ' + skipvalue + " af totalt " + totalCount + " (Side " + currentPageIndex + " af " + ceil + ")";
        }
        else {
            return 'Viser ' + (totalCount - data.value.length + 1) + ' - ' + totalCount + " af totalt " + totalCount + " (Side " + ceil + " af " + ceil + ")";
        }
    }
    return 'Viser ' + data.value.length + ' af ' + totalCount;
}

function ExpandResults()
{
    $('.resultItemsContainer').fadeToggle();
}

function ShowQueryLink()
{
    if ($('.generatedQueryUrl').is(":visible")) {
        $('.generatedQueryUrl').hide();
    }
    else {
        $('.generatedQueryUrl').show();
    }
}

// Handle if result from server is a collection of entities
function HandleResultCollection(data) {
    d = new Date();
    $('#dateTimeLastSearch').text(GenerateDateTimeString(d));
    $('#ajaxLoader').hide();
    HideRequestInformation();
    var mainDiv = CreateDivHead();
    mainDiv.appendChild(CreateDivHeadLink(data['odata.nextLink'], CreateBackwardLink(data['odata.nextLink'])));
    // Check if we have data?
    if (data.value.length != 0) {
        // Create tabel for each object in response and append to main table
        for (var i = 0; i < data.value.length; i++) {

            var resultRow = document.createElement('div');
            resultRow.setAttribute("id", i);
            resultRow.className = "resultItemsRow";
            var titel = GetTitelForData(data, i);
            resultRow.appendChild(GenerateRowHTML(data.value[i].id, data.value[i].opdateringsdato, titel));

            var resultContainer = document.createElement('div');
            resultContainer.className = "resultItemsContainer";
            resultContainer.setAttribute("id", i + "resultItemsContainer");

            for (property in data.value[i]) {
                if (property != "odata.metadata") {
                    var objectRow = CreateObjectRow(property, data.value[i]);
                    resultContainer.appendChild(objectRow);
                }
            }
            resultContainer.appendChild(GenerateDrillDownElement(data, data.value[i].id));
            resultRow.appendChild(resultContainer);
            mainDiv.appendChild(resultRow);
            $('.resultArea').html(mainDiv);
        }
    }
    else
    {
        $('.noDataFound').show();
    }
    $('.queryResultText').text(GetResultText(data));
}

function CreateWrapperObjectToSingleResult(data)
{
    var newObject = new Object();
    newObject['odata.metadata'] = data['odata.metadata'];
    newObject['odata.count'] = 1;
    newObject.value = [];
    newObject.value.push(data);
    return newObject;
}

// Handle the general request to the server
function GetRequest(url) {
    $('.resultArea').empty();
    $('.queryResultText').empty();
    HideRequestInformation();
    ShowTheAjaxLoader();
    $('.theText').html(CreateRequestedUrlLink(url));
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.value instanceof Array) {
                HandleResultCollection(data);
            }
            else {
                HandleResultCollection(CreateWrapperObjectToSingleResult(data));
                ExpandResults();
            }
        },
        error: function (x, y, z) {
            $('#ajaxLoader').hide();
            if (x.status != undefined && x.status != "" && (x.status == "404" || x.status == "400")) {
                $('.noDataFound').show();
            }
            else if (x.status != undefined && x.status != "" && (x.status == "500")) {
                $('.errorInApplication').show();
            }
            else
                $('.queryResultText').text(x.status + " " + z);
        }
    });
}

// Get the current url as XML
function GetXMLResponse(url)
{
    var newXmlUrl = url + "&$format=xml";
    window.open(newXmlUrl, "_blank");
}

// Get the current url as JSON
function GetJSONResponse(url)
{
    window.open(url, "_blank");
}


