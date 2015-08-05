/**
 * @author Dorota Oleszczuk <dorota@programistka.me>
 */

var home = angular.module('home');

/**
* 
*
*
*/
function ForecastService($resource, $http) {

	function getWeather (JSON_CALLBACK, LAT, LON, UNIT) {
        $http.jsonp('https://api.forecast.io/forecast/d5c4f7fbc68f86a1658a5a74dfcd082f/' + LAT + ',' + LON + '?callback=JSON_CALLBACK&units=' + UNIT)
          .success(function(data){
            //console.log("data", data);
            JSON_CALLBACK(data);
          })
          .error(function(data, err){
            console.log('Error retrieving forecast', err, data);
          });
    }

    function getFakeWeather(){
    	return $resource('/scripts/app/nyforcast.json', {});
    }
      
    return {
        getWeather: getWeather,
        getFakeWeather : getFakeWeather
    };

}

home.factory('ForecastService', ['$resource', '$http', ForecastService]);