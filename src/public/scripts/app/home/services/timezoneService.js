'use strict'
/**
 * @author Dorota Oleszczuk <dorota@programistka.me>
 */

var home = angular.module('home');

/**
* Timezone service
* using geonames library
* http://www.geonames.org/
*/

function TimezoneService($resource, $http) {

	function getTimezone (JSON_CALLBACK, lat, lng) {
        $http.get('http://api.geonames.org/timezoneJSON?lat=' + lat + '&lng=' + lng + '&username=dorotka')
          .success(function(data){
            JSON_CALLBACK(data);
          })
          .error(function(data, err){
            console.log('Error retrieving timezone data', err, data);
          });
    }

      
    return {
        getTimezone: getTimezone
    };

}

home.factory('TimezoneService', ['$resource', '$http', TimezoneService]);
