var home = angular.module('home');

function HomeCtrl($scope, ForecastService, $timeout, $interval) {

	$scope.init = function(){
		// variables 
		//$scope.loading = true;
		// units can be 'us' for F or 'si'/'ca' for C
		$scope.unit = 'ca';
		// can be 'night' or 'day'
		$scope.timeOfDay;
		$scope.icon;
		$scope.moment = moment().unix();

		// Calls on load
		$scope.getTimeOfDay()
		$scope.initGeocoder();
		$scope.getLocation();
		$scope.getCurrentLocalTime();
		$scope.getDay();
	};

/* Time and date related functions */

	$scope.getCurrentLocalTime = function(){
		$scope.now = moment().format('hh:mm A');
		var tickInterval = 1000;
		
		var tick = function(){
			// once a full minute, change interval to 60000ms so we don't update every secons
			if(tickInterval == 1000 && moment().second() == 0){
				$interval.cancel($scope.stop);
				tickInterval = 60000;
				$scope.stop = $interval(tick, tickInterval);
			}
			$scope.now = moment().format('hh:mm A');
		};

		$scope.stop = $interval(tick, tickInterval);
	};

	$scope.getDay = function(){
		$scope.dayOfWeek = moment().day();
	}

	$scope.getTimeOfDay = function(){
		(moment().hour() < 7 || moment().hour() > 19) ? $scope.timeOfDay = 'night' : $scope.timeOfDay = 'day';
	};

/* Weather related functions */

    $scope.getWeather = function(lat, lon, unit){

        function setConditions(data){
            //console.log("Weather", data );
            $scope.currently = data.currently;
            $scope.daily = data.daily;
            $scope.hourly = data.hourly;
            // console.log("$scope.hourly", $scope.hourly);
            $scope.weatherTimezone = data.timezone;
            $scope.alerts = data.alerts;
            $scope.weatherTime = $scope.currently.time;
            $scope.assignIcon($scope.currently.icon);
            $scope.formatDates();
        }

        ForecastService.getWeather(setConditions, lat,  lon, unit);

        //get static weather data
        /*ForecastService.getFakeWeather().get()
		.$promise.then(
		    setConditions
		);*/
	};

	$scope.formatDates = function(){
		angular.forEach($scope.hourly.data, function(hour){
			hour.timeFormatted = moment.unix(hour.time).format('hh A');
		});
	};

	// Method takes icon returned by forcast.io and assigns corresponding weater-icon class
	$scope.assignIcon = function(icon){
		
		var weatherToIcon = [
			{ 'sleet' : 'wi-sleet' },
			{ 'clear-day' : 'wi-day-sunny' },
			{ 'clear-night' : 'wi-night-clear' },
			{ 'rain' : 'wi-rain' },
			{ 'snow' : 'wi-snow' },
			{ 'wind' : 'wi-strong-wind' },
			{ 'fog' : 'wi-fog' },
			{ 'cloudy' : 'wi-cloudy' },
			{ 'partly-cloudy-day' : 'wi-day-cloudy' },
			{ 'partly-cloudy-night' : 'wi-night-partly-cloudy' }
		];

		angular.forEach(weatherToIcon, function(data){
			if(data[icon]) {
				$scope.icon = data[icon];
				$scope.showIcon = true;
				return;
			} 	
		});

		//default
		if(!$scope.icon ){
			$scope.icon = 'wi-night-partly-cloudy';
			$scope.showIcon = true;
		}
	};

	//method changes units in use and sends another request for data since changing units will also change daily, hourly units + wind speed units etc..
	$scope.changeUnit = function(unit){
		$scope.currently.temperature = null;
		$scope.unit = unit;
		$scope.getWeather($scope.lat, $scope.lon, $scope.unit);
	};

/* Location related functions */

	$scope.getLocation = function(){

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getPosition, showErr);
        } else {
            loc = "Geolocation is not supported by this browser.";
        }

        function getPosition(position) {
        	$scope.lat = position.coords.latitude;
        	$scope.lon = position.coords.longitude;

			$scope.getCityName($scope.lat, $scope.lon);
	        $scope.getWeather($scope.lat, $scope.lon, $scope.unit);
        }

        function showErr (response){
        	console.log("Error", response);
        }
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
