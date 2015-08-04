var home = angular.module('home');

function HomeCtrl($scope, ForecastService, $timeout, $interval) {

	$scope.init = function(){
		$scope.loading = true;
		$scope.getCurrentLocalTime();
		$scope.getDay();
		// units can be 'us' for F or 'si'/'ca' for C
		$scope.unit = 'ca';
		// can be 'night' or 'day'
		$scope.timeOfDay;
		$scope.getTimeOfDay();
		$scope.icon;
		$scope.assignIcon();
		$scope.initGeocoder();
		$scope.getLocation();
	};

	$scope.assignIcon = function(icon){
		//TODO: Use after weather check and assign depending on weather
		/* Icons correspond to those: clear-day, clear-night, rain, snow, sleet, wind, fog, 
		cloudy, partly-cloudy-day, or partly-cloudy-night
		*/
		$scope.timeOfDay == 'night' ? $scope.icon = 'fa-moon-o' : $scope.icon = 'fa-sun-o';
		//$scope.icon = icon;
		//$scope.iconSrc = '/media/images/weather-icons/' + icon + '.svg';
	};

	$scope.getCurrentLocalTime = function(){
		$scope.now = moment().format('hh:mm A');
		var tickInterval = 1000;
		
		var tick = function(){
			// once a full minute, change interval to 60000ms
			if(tickInterval == 1000 && moment().second() == 0){
				$interval.cancel($scope.stop);
				tickInterval = 60000;
				$scope.stop = $interval(tick, tickInterval);
			}
			$scope.now = moment().format('hh:mm A');
			//.tz("Europe/Berlin");
		};

		$scope.stop = $interval(tick, tickInterval);
	};

	$scope.getDay = function(){
		$scope.dayOfWeek = moment().day();
	}

	$scope.getTimeOfDay = function(){
		(moment().hour() < 7 || moment().hour() > 19) ? $scope.timeOfDay = 'night' : $scope.timeOfDay = 'day';
	};

	$scope.getLocation = function(){

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showErr);
        } else {
            loc = "Geolocation is not supported by this browser.";
        }

        function showPosition(position) {
        	$scope.lat = position.coords.latitude;
        	$scope.lon = position.coords.longitude;

			$scope.getCityName($scope.lat, $scope.lon);
	        $scope.getWeather($scope.lat, $scope.lon, $scope.unit);
        }

        function showErr (response){
        	console.log("Error", response);
        }
    };

    $scope.getWeather = function(lat, lon, unit){
        console.log("lat, lon", lat, lon);

        function setConditions(data){
            console.log("Weather", data );
            $scope.currently = data.currently;
            console.log("$scope.currently", $scope.currently, $scope.currently.temperature);
            $scope.daily = data.daily;
            $scope.hourly = data.hourly;
            $scope.weatherTimezone = data.timezone;
            $scope.alerts = data.alerts;
            $scope.weatherTime = $scope.currently.time;
            $scope.assignIcon($scope.currently.icon);
            // console.log("time we are checking the weather for", moment.unix($scope.weatherTime).format('YYYY-MM-DDTHH:mm:ss'), 
            // moment.unix($scope.weatherTime).format('hh:mm A'));
        }

        ForecastService.getWeather(setConditions, lat,  lon, unit);

        // get static weather data
  //       ForecastService.getFakeWeather().get()
		// .$promise.then(
		//     //success
		//     function( response ){
		//     	console.log("Forcast response", response);
		//     	$scope.currently = response.currently;
		//     	$scope.assignIcon($scope.currently.icon);
		//     	$scope.loading = false;
		//     },
		//     //error
		//     function( error	 ){
		//     	console.log("Forcast error", response);
		//     	$scope.loading = false;
		//     }
		// );

	};

    $scope.initGeocoder = function(){
        if(!$scope.geocoder) $scope.geocoder = new google.maps.Geocoder();
    };

    $scope.getCityName = function(lat, lng){

        var latlng = new google.maps.LatLng(lat, lng);
        $scope.geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
            //console.log("result", results);
			    if (results[1]) {
			        for (var i=0; i<results[0].address_components.length; i++) {
			            for (var b=0;b<results[0].address_components[i].types.length;b++) {

			            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
			                if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
			                    //this is the object you are looking for
			                    $scope.city= results[0].address_components[i];
			                    break;
			                }
			            }
			        }
			        //city data
			        console.log("city  long", $scope.city.long_name);
			        $scope.loading = false;

			    } else {
			        console.log("No results found");
			    }
            } else {
                console.log("Geocoder failed due to: " + status);
            }
        });

    };

}

home.controller('HomeCtrl', ['$scope', 'ForecastService', '$timeout', '$interval', HomeCtrl]);
