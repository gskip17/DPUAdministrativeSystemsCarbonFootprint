app.controller('MainController', ['$scope', function($scope){

  // Initialize our map.
  initMap();

  $scope.title = "Carbon Footprint";
  $scope.RoundTrip = false;
  $scope.method = 'driving';
  $scope.gPlace;
  $scope.StartAddress = '';
  $scope.DestAddress = '';
  $scope.planeLegs = [];

  toastr.options = {
    "positionClass":"toast-top-center"
  };

  function leg() {
    this.StartCity = '',
    this.EndCity = '',
    this.Miles = 0,
    this.StartDetails,
    this.EndDetails
  };

  $scope.planeLegs.push(new leg());


  var directionsDisplay;
  var totalDistance;
  var directionsService = new google.maps.DirectionsService();
  var map;

  $scope.calcMiles = function(){

    var route = directionsService.route({
      origin: $scope.StartAddress,
      destination: $scope.DestAddress,
      travelMode: "DRIVING",
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(DirectionsResult, status){

      if(status == "OK"){
        directionsDisplay.setDirections(DirectionsResult);
      } else {
        toastr.error('Error finding address, please make sure you are as specific as possible with street addresses.');
      }
      //console.log(DirectionsResult);

      totalDistance = Math.floor(DirectionsResult.routes[0].legs[0].distance.value * 0.000621371);
      $scope.totalMileage = Math.floor(DirectionsResult.routes[0].legs[0].distance.value * 0.000621371);

      // If you are curious about the stuff we recieve, uncomment these lines of code.
      //console.log("distance = "+$scope.totalMileage);
      //console.log(DirectionsResult);
      //console.log(totalDistance);
      //console.log($scope.RoundTrip);

      // If it is a round trip, double the number.
      // Because google returns only a string for miles, we must
      // convert the value it gives us (meters) to miles.
      if($scope.RoundTrip == true){
        var meters = DirectionsResult.routes[0].legs[0].distance.value;
        //convert meters to miles, double the value;
        var miles = (meters * 0.000621371) * 2;

        miles = Math.floor(miles);

        $scope.totalMileage = miles;
        $scope.$apply();
      }

      // Ensure scope variables are applied.
      $scope.$apply();
    });


  };

  $scope.setWaypoints = function(){
      var start = new google.maps.Marker({
        position: $scope.StartingAddress,
        title:"Departing Address"
      });

      console.log(start);

      start.setMap(map);
  }

  $scope.getJsonDistance = function(){

    var origin1 = 'Greencastle Indiana, United States';
    var destinationA = 'Stockholm, Sweden';

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin1],
        destinations: [destinationA],
        travelMode: 'TRANSIT',
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      }, function(response, status){
        console.log(response);
      });

  };

  $scope.addLeg = function(){
    $scope.planeLegs.push(new leg());
  }

  $scope.removeLeg = function(key){
    $scope.planeLegs.pop(key);
  }

  $scope.getTrip = function(){

    try{
      if(validatePlaneTrip() == false){
        return toastr.error('Please ensure you select all cities from the autocomplete drop down list.')
      }
    } catch (e){
      return 0;
      console.log(e);
    }


    totalDistance = 0;

    for(var leg in $scope.planeLegs){
      // Put our current leg in a readable format.
      var current = $scope.planeLegs[leg];
      // Create LatLng objects from geolocation metadata provided by autocomplete.
      var startLat = current.StartDetails.geometry.location.lat();
      var startLng = current.StartDetails.geometry.location.lng();
      var start = new google.maps.LatLng(startLat, startLng);

      var destLat = current.EndDetails.geometry.location.lat();
      var destLng = current.EndDetails.geometry.location.lng();
      var dest = new google.maps.LatLng(destLat, destLng);

      // Should probably put the converting float into a constant. For those confused about the 0.000621371,
      // this float converts the distance given by google (in meters) to miles.
      var distance = google.maps.geometry.spherical.computeDistanceBetween(start, dest) * 0.000621371;
      console.log("Computed distance is " + distance);

      // Save the metadata for miles in the local object (in case we need specific data later in the JSON submission).
      current.Miles = distance;
      // Compound the total before moving on.
      totalDistance += distance;
    }

    // Round the miles to the nearest whole number (way too many decimals).
    totalDistance = Math.floor(totalDistance);
    console.log("Total distance traveled is " + totalDistance);
    $scope.totalMileage = totalDistance;
  };


  // Helper function. We just quickly loop through the legs array to ensure
  // that a user picked a valid Google location from the autocomplete dropdown.
  // Otherwise we would have no coordinates to do the DistanceMatrix stuff.
  function validatePlaneTrip() {

    for (var leg in $scope.planeLegs){
      var current = $scope.planeLegs[leg];
      // if StartDetails or EndDetails is false (no input), then the input was not filled
      // in from the autocomplete dropdown.
      if(!current.StartDetails || !current.EndDetails){
        return false;
      }
    }
    // If we get here, this means the form has been filled out correctly.
    return true;

  }

  // Checks the form for a value in the main data inputs. (Not a complete validation).
  function validateBody(){
    if(!$scope.NumStudents || !$scope.NumFaculty || !$scope.DateOfTravel){
      return false;
    }
    return true;
  }

  // Initializes the pretty map we see.
  function initMap(){

    directionsDisplay = new google.maps.DirectionsRenderer();

    var depauw = new google.maps.LatLng(39.640414, -86.861686);
    var mapOptions = {
      zoom:14,
      center: depauw
    }

    // WIERDNESS, you MUST use getElementById, and NOT a jQuery selector to
    // reference the div containing the map. I need to check jQuery source and
    // see if I can find a reason for this..
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);

  }

}]);
