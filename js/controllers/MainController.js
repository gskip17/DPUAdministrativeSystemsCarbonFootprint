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

  function leg() {
    this.StartCity = '',
    this.EndCity = '',
    this.Miles = 0
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
      }

      totalDistance = DirectionsResult.routes[0].legs[0].distance.text;
      $scope.totalMileage = DirectionsResult.routes[0].legs[0].distance.text;

      console.log("distance = "+$scope.totalMileage);
      console.log(DirectionsResult);
      console.log(totalDistance);
      console.log($scope.RoundTrip);

      // If it is a round trip, double the number.
      // Because google returns only a string for miles, we must
      // convert the value it gives us (meters) to miles.
      if($scope.RoundTrip == true){
        var meters = DirectionsResult.routes[0].legs[0].distance.value;
        //convert meters to miles, double the value;
        var miles = (meters * 0.000621371) * 2;

        miles = Math.floor(miles);

        $scope.totalMileage = miles + " mi";
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


  function initMap(){

    directionsDisplay = new google.maps.DirectionsRenderer();

    var depauw = new google.maps.LatLng(39.640414, -86.861686);
    var mapOptions = {
      zoom:14,
      center: depauw
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);

  }

}]);
