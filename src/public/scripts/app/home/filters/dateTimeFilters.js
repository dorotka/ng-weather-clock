/**
 * @author Dorota Oleszczuk <dorota@programistka.me>
 */

var home = angular.module('home');

/**
* 
*
*
*/

function dayOfWeekFilter() {

	return function(input){
		if(input == 0) return 'Sunday';
		if(input == 1) return 'Monday';
		if(input == 2) return 'Tuesday';
		if(input == 3) return 'Wednesday';
		if(input == 4) return 'Thursday';
		if(input == 5) return 'Friday';
		if(input == 6) return 'Saturday';

    	return input;
	};
}

home.filter('dayOfWeekFilter', [ dayOfWeekFilter]);