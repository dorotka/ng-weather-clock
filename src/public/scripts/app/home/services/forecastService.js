/**
 * @author Dorota Oleszczuk <dorota@programistka.me>
 */

var home = angular.module('home');

/**
* 
*
*
*/
function ForecastService($resource, call) {
    console.log("service");
    return {

        Conditions: $resource('https://api.forecast.io/forecast/d5c4f7fbc68f86a1658a5a74dfcd082f/:latitude,:longitude?units=[:settings]', {latitude : '@latitude', longitude : '@longitude', settings : '@settings'}), 
        MyConditions: $resource('/scripts/app/nyforcast.json', {})
    };
}

home.factory('ForecastService', ['$resource', ForecastService]);