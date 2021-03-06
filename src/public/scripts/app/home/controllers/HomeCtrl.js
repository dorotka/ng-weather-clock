var home = angular.module('home');

function HomeCtrl($scope, ForecastService, $timeout, $interval, TimezoneService) {

	$scope.init = function(){
		// variables 
		//$scope.loading = true;
		var currentData;
		// units can be 'us' for F or 'si'/'ca' for C
		$scope.unit = 'ca';
		// can be 'night' or 'day'
		$scope.timeOfDay;
		$scope.icon;
		$scope.moment = moment().unix();
		$scope.askLocation = {'show': false};
		// Calls on load
		$scope.initGeocoder();
		$scope.getLocation();
		$scope.getCurrentLocalTime();
	};

/* Time and date related functions */

	$scope.getCurrentLocalTime = function(time){
		if(!time){
			$scope.now = moment()
			$scope.nowTime = $scope.now.format('hh:mm A');
		} else{
			$scope.now = moment(time);
			$scope.nowTime = $scope.now.format('hh:mm A');
		}
		
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
		$scope.getDay();
		$scope.getTimeOfDay();
	};

	$scope.getDay = function(){
		$scope.dayOfWeek = $scope.now.day();
	}

	$scope.getTimeOfDay = function(){
		($scope.now.hour() < 7 || $scope.now.hour() > 19) ? $scope.timeOfDay = 'night' : $scope.timeOfDay = 'day';
	};

/* Weather related functions */
	
	function setConditions(data){
        	
    	if($scope.unit == 'ca'){
    		$scope.cData = data;
    		currentData = $scope.cData;
    	} else {
    		$scope.fData = data;
    		currentData = $scope.fData;
    	}

        // console.log("Weather", currentData );
        $scope.currently = currentData.currently;
        $scope.daily = currentData.daily;
        $scope.hourly = currentData.hourly;
        $scope.weatherTimezone = currentData.timezone;
        $scope.alerts = currentData.alerts;
        $scope.weatherTime = $scope.currently.time;
        $scope.assignIcons($scope.currently);
        $scope.assignIcons($scope.hourly.data);
        $scope.formatDates();
        // console.log("$scope.hourly", $scope.hourly);
    }

    $scope.getWeather = function(lat, lon, unit){
        //TODO: change to true call
        ForecastService.getWeather(setConditions, lat,  lon, unit);

        //get static weather data
  //       ForecastService.getFakeWeather().get()
		// .$promise.then(
		//     setConditions
		// );
	};

	$scope.formatDates = function(){
		angular.forEach($scope.hourly.data, function(hour){
			hour.timeFormatted = moment.unix(hour.time).format('hh A');
		});
	};

	$scope.weatherToIcon = [
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

	// Method takes icon returned by forcast.io and assigns corresponding weater-icon class
	$scope.assignIcons = function(conditions){
		// if single condition
		if(angular.isUndefined(conditions.length)){
			angular.forEach($scope.weatherToIcon, function(data){
				if(data[conditions.icon]) {
					conditions.displayIcon = data[conditions.icon];
					$scope.showIcon = true;
					return;
				} 	
			});

			//default
			if(!conditions.displayIcon ){
				conditions.displayIcon = 'wi-night-partly-cloudy';
				$scope.showIcon = true;
			}
		// if multiple conditions (like hourly, daily)
		} else{
			angular.forEach(conditions, function(condition){
				angular.forEach($scope.weatherToIcon, function(data){
					if(data[condition.icon]) {
						condition.displayIcon = data[condition.icon];
						return;
					} 	
				});
				//default
				if(!condition.displayIcon ){
					condition.displayIcon = 'wi-night-partly-cloudy';
				}
			});
		}
	};

	//method changes units in use and sends another request for data since changing units will also change daily, hourly units + wind speed units etc..
	$scope.changeUnit = function(unit){
		if(!unit || $scope.unit == unit) return;
		// $scope.currently.temperature = null;
		$scope.unit = unit;
		if(unit == 'ca'){
    		setConditions($scope.cData);
    	} else {
    		if(!$scope.fData){
    			$scope.getWeather($scope.lat, $scope.lon, $scope.unit);
    		} else{
    			setConditions($scope.fData);
    		}
    	}
		
	};

/* Location related functions */

	$scope.getLocation = function(){

        if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
        		navigator.geolocation.getCurrentPosition(getPosition, showErr);
        } else {
            $scope.askLocation.show = true;
        }

        function getPosition(position) {
        	$scope.lat = position.coords.latitude;
        	$scope.lon = position.coords.longitude;

			$scope.getCityName($scope.lat, $scope.lon);
	        $scope.getWeather($scope.lat, $scope.lon, $scope.unit);
        }

        function showErr (response){
        	console.log("Error", response);
        	$scope.askLocation.show = true;
        }
    };

    $scope.searchcity = function(searchString){
        var service = new google.maps.places.AutocompleteService();
        if(searchString != ''){
	        service.getPlacePredictions({'input': searchString, 'types': ['(cities)']}, function(predictions, status){
	        	// console.log("predictions", predictions, status);
	        	$scope.places = predictions;
	        });
        }
    };

    $scope.selectPlace = function(place){
    	$scope.city = { 'long_name' : place.terms[0].value};
    	var id = place.id;
    	// console.log('placeId', id);

		$scope.getLatLng($scope.city.long_name);
    };

    $scope.getLatLng = function(city){
        $scope.geocoder.geocode({'address': city}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
            	// console.log("result", results);
			    if(results.length && results.length > 0){
			    	$scope.lat = results[0].geometry.location.lat();
			    	$scope.lon = results[0].geometry.location.lng();
			    } else{
			    	if(results.geometry){
				    	$scope.lat = results.geometry.location.lat();
				    	$scope.lon = results.geometry.location.lng();
			    	}
			    }

			    $scope.getWeather($scope.lat, $scope.lon, $scope.unit);
			    $scope.getTimezone($scope.lat, $scope.lon);
			    $scope.askLocation.show = false;
            } else {
                console.log("Geocoder failed due to: " + status);
            }
        });

    };

    $scope.getTimezone = function(lat, lng){
    	TimezoneService.getTimezone(setTime, lat, lng);

    	function setTime(response){
    		if(response && response.time){
    			$scope.getCurrentLocalTime(response.time);
    		} else{
    			console.log("Issue getting timezone data", data);
    		}
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

home.controller('HomeCtrl', ['$scope', 'ForecastService', '$timeout', '$interval', 'TimezoneService', HomeCtrl]);
