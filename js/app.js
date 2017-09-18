
// centered the map to the location marker of Nahargarh fort
var centerLocation = {lat: 26.9373166, lng: 75.8154803};
// initialising the map variable
var map;
// This is a pre made list. Although this could be easily pulled from Google places search or some other API.
//To keep the app simple I have pre-selected these places of interest in Jaipur, which is my hometown.
var locations = [
    {
      lat: 26.9373166,
		  lng: 75.8154803,
      name: "Nahargarh Fort",
    },
    {
      lat: 26.9850877,
		  lng: 75.8455928,
      name: "Jaigarh Fort",
    },
    {
      lat: 26.9854865,
		  lng: 75.8513454,
      name: "Amber Fort",
    },
    {
      lat: 26.9239363,
		  lng: 75.8267438,
      name: "Hawa Mahal",
    },
    {
      lat: 26.9040972,
		  lng: 75.79702,
      name: "Curious Life coffee roasters",
    },
    {
      lat: 26.909924,
		  lng: 75.812962,
      name: "Hotel Diggi Palace",
    }

];

// adding this so that the maps api loads first before KO starts
$(window).load(function() {
// This works a default way to show information
var defaultContent = '<div style="width: 120px; height: 100px;"><p style="text-align: center;">Fetching information</p></div>';

// Let us begin with KO. Setting up viewmodel
var ViewModel = function() {
    // assign self to this parameter for easy reference to viewModel objects.
    var self = this;
    // Storing the input by a user to filter the results in a KO observable
    self.filterInput = ko.observable("");
    // Storing all the locations in a KO observable array
    self.poiList = ko.observableArray([]);
    // we initialize locDetails objects and push them in the poiList array
    locations.forEach(function(item){
        self.poiList.push( new locDetails(item) );
    });
    // initiate google map infowindow object and set content here as the default content
    self.infowindow = new google.maps.InfoWindow({
        content: defaultContent
    });

    // this function is for displaying infowindow on clicked objects
    // Iterate through the location details in poiList and drop the markers
    // Reset the content of the infowindow to the defaultInfoWindow.
    // Onclick add animation to the marker
    // Call wiki AJAX for infowindow
    self.displayInfoWindow = function(location) {
        // Set the markers and everytime called also resets according to the new poiList
        for (var i = 0; i < locations.length; i++) {
            self.poiList()[i].marker.setIcon("https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png");
        }
        // reset infowindow content to defaultContent
        self.infowindow.setContent(defaultContent);
        // set clicked marker to a blue marker
        location.marker.setIcon("https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png");
        // open infowindow on the clicked marker
        self.infowindow.open(map, location.marker);
        // call ajax function to get info from wikipedia
        var loco = location.name();
        self.ajax(loco);
    };

    // definition for ajax function to get wikipedia information
    self.ajax = function(loc) {
      var encodedCityName = encodeURI(loc);
      var wikiURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&origin="+"*"+"&titles="+encodedCityName;
        // creating an object to pass into the jquery ajax call
        var call = {
          // request type ( GET or POST )
	          type: "GET",
            url: wikiURL,
            dataType: "jsonp",
            // handling error in the AJAX call.
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                self.infowindow.setContent('<div style="width: 300px; height: 60px;"><p style="text-align: center;">No info about <strong>'+loc+'</strong> available at this time.<br> How about exploring it yourself?</p></div>');
            },
            // If the call is successful
            success: function(results) {
              // storig the page id in key to access further information
              var key = Object.keys(results.query.pages);
                // Storing the returned JSON
                var name = results.query.pages[key[0]].title;
                var extract= results.query.pages[key[0]].extract || 'No information available for this location';
                // using the data and creating the content string for infowindow
                var contentString = '<div id="name"><h4>'+name+'</h4></div><div id="extract">'+extract+'</div>';
                // set the infowindow context with the completed html from one line above
                self.infowindow.setContent(contentString);
            }
        };
        // call ajax function
        $.ajax(call);
    };

    // iterate through poiList ko observable array
    self.poiList().forEach(function(location){
        // addding click event listener to each location.marker then return the data by calling the displayInfoWindow function and passing location as parameter.
        google.maps.event.addListener(location.marker, 'click', (function(){
            return function(){
                self.displayInfoWindow(location);
            };
        })(location));
        // add event 'closeclick' to each infowindow and then ensure that the marker changes back to red-dot
        google.maps.event.addListener(self.infowindow, 'closeclick', (function(){
            return function(){
                // reset all other markers to default red
                for (var j = 0; j < locations.length; j++) {
                    self.poiList()[j].marker.setIcon("https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png");
                }
            };
        })(location));
    });


    self.computedList = ko.computed(function(){
        // array to store the result
        var filterArr = [];
        var poiLength = self.poiList().length;

        // iterate through the the poiList's name value and convert to lowercase
        for (var i = 0; i < poiLength; i++){
          // find the index of the the input value. Only run if the input index exists
            if (self.poiList()[i].name().toLowerCase().indexOf(self.filterInput().toLowerCase()) != -1) {
              // pushing the found content to the filter array
                    filterArr.push(self.poiList()[i]);
                    self.poiList()[i].showMarker(map);
            } else {
                // hiding the markers that are not returned in the search
                self.poiList()[i].showMarker(null);
            }
        }
        // alphabetical sorting
        return filterArr.sort(function(a, b){ return a.name() > b.name() ? 1 : -1;});
    });
};

// Not working with Google nearby places api
// refer how to convert object to array
// store the wiki extract info here?
// locdetails object to store data in the observable array and to retrieve info

var locDetails = function(data) {
    // assign self to this perimeter so we can easily point objects to viewmodel
    var self = this;
    // store location's name data as ko observables
    self.name = ko.observable(data.name);
    // latitude and longitude to set the marker location
    self.latLng = { lat: data.lat, lng: data.lng };
    // image for the marker
    var image = {
        url: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
    };
    // new marker object
    self.marker = new google.maps.Marker({
        position: self.latLng,
        map: null,
        icon: image,
    });
    // function to display or hide marker
    self.showMarker = function(mapOrNull) {
         if (mapOrNull === map) {
            if (self.marker.map === null) {
                self.marker.setMap(mapOrNull);
            }
        } else {
            self.marker.setMap(null);
        }
    };
};
ko.applyBindings(new ViewModel());
});

// initialize google map
function initMap() {
    var myLatLng = centerLocation;

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: myLatLng,
        mapTypeId: google.maps.MapTypeId.ROAD
    });

}
