///Set current location and initialize map with Google Maps API
function initMap() {

  var currentLocation = {lat: 45.5013382, lng: -73.5556981};
  var mapOptions = {
    center: currentLocation,
    zoom: 11,
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

  ko.applyBindings(new viewModel() );

};

//Set up ViewModel
function viewModel() {
  'use strict';

  var self = this;

  //Store all locations in observable array
  self.locationsList = ko.observableArray([]);

  //Initilize default infowindow
  var infowindow = new google.maps.InfoWindow(
  {
    content: ''
  });

  //Set up Model
  var locations = [
    {
     name: 'Place des Arts',
     wikiUrl: 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=Place%20des%20Arts&callback=wikiCallback',
     latlng: { lat: 45.5083198, lng: -73.5686252 },
     marker: ' ',
     content: ' '
    },
    {
      name: 'Olympic Stadium',
      wikiUrl: 'http://en.wikipedia.org//w/api.php?action=opensearch&format=json&search=Olympic%20Stadium%20(Montreal)&callback=wikiCallback',
      latlng: { lat: 45.5579957, lng: -73.5540756 },
      marker: ' ',
      content: ' '
    },
    {
      name: 'Notre-Dame Basilica',
      wikiUrl: 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=Notre-Dame%20Basilica%20(Montreal)&callback=wikiCallback',
      latlng: { lat: 45.5044412, lng: -73.5581573 },
      marker: ' ',
      content: ' '
    },
    {
      name: 'McGill University',
      wikiUrl: 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=McGill%20University&callback=wikiCallback',
      latlng: { lat: 45.5047847, lng: -73.5793451 },
      marker: ' ',
      content: ' '
    },
    {
      name: 'Mount-Royal',
      wikiUrl: 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=Mount%20Royal&callback=wikiCallback',
      latlng: { lat: 45.5071005, lng: -73.620533 },
      marker: ' ',
      content: ' '
    }
  ];

//Display error message if Google Maps fails to load
function googleError() {
  document.getElementById("map").innerHTML = "There was an error loading Google Maps."
};

  //Construct locations
  var Location = function(data) {
    this.name = data.name;
    this.marker = data.marker;
    this.wikiUrl = data.wikiUrl;
    this.content = data.content;
    this.latlng = data.latlng;
  };

  //Get content for infowindows
  function displayContent(locationItem) {

  var infoWindowContent;


    //Wikipedia API AJAX request
    $.ajax({
      url: locationItem.wikiUrl,
      dataType: 'jsonp',
      success: function(data) {
        infoWindowContent = ('<div>' +  '<p>' + data[0] + '</p>' + '<p>' + data[2] + '</p>' + '</div>');
        locationItem.content = infoWindowContent;
        return(infoWindowContent)
      },
      error: function() {
        infoWindowContent = ('<div>' +  '<p>' + data[0] + '</p>' + '<p>' + data[2] + '</p>' + '</div>');
      }
    });
};

  //Create list of locations from the Model
  locations.forEach(function(locationItem) {

    //Build markers for each location
    var markerOptions = {
      map: map,
      position: locationItem.latlng,
      animation: google.maps.Animation.DROP,
    };

  locationItem.marker = new google.maps.Marker(markerOptions);

    //Define content for each infowindow
    var infoWindowContent = displayContent(locationItem);
    locationItem.content = infoWindowContent;


  //Set up event listeners for each location for clicks
  locationItem.marker.addListener('click', (function(markerRef, infoWindowContent) {
    return function() {
    infowindow.setContent(locationItem.content);
    infowindow.open(map, markerRef);}
  })
  (locationItem.marker,locationItem.content));

    //Push new location items to the locations array
    self.locationsList.push(new Location(locationItem) );
});


  //Animate the marker and open the infowindow when location on the list is clicked
  self.setMarker = function(locationItem) {
    locationItem.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout( function() { locationItem.marker.setAnimation(null); }, 1500);
    google.maps.event.trigger(locationItem.marker, 'click');
  };

  //Copy values of locations to be stored in observabale array
  self.filteredList = ko.observableArray([]);

  //If name of a location matches searched string, push locations to filtered list
  locations.forEach(function (locationItem) {
    self.filteredList.push(new Location(locationItem) );
  });

  //Store user's input
  self.query = ko.observable('');


  //Handle filtering of location based on user input
  self.filteringFunction = function(locations)  {

    var searchInput = self.query().toLowerCase();
    self.filteredList.removeAll();

      self.locationsList().forEach(function(locations) {
        locations.marker.setVisible(false);

       if (locations.name.toLowerCase().indexOf(searchInput) !== -1)
          self.filteredList.push(locations);

      });

      //Make markers visible for filtered locations
      self.filteredList().forEach(function(locations) {
          locations.marker.setVisible(true);
      });


  };

};
