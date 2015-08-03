'use strict';

var myApp = angular.module('myApp', [
    'ngRoute',
    'ngResource',
    'ngAnimate',
    'home',
    'test'
]);
// .config(['$sceDelegateProvider',
//     function($sceDelegateProvider) {

//         // $sceDelegateProvider.resourceUrlWhitelist(
//         //     [
//         //         'http://sample.sample.com/**',
//         //         'self','http://*.sample.com/**'
//         //     ]
//         // );

        
//     }
// ])

myApp.config(function($routeProvider, $locationProvider){
    
    $routeProvider
    .when('/', {
        templateUrl : '/scripts/app/partials/templates/home.tpl.html', 
        controller : 'HomeCtrl'
    })

    .when('/test', {
        templateUrl : '/scripts/app/partials/templates/test.tpl.html', 
        controller : 'TestCtrl'
    })

    .otherwise({ 
        redirectTo: '/'
    });

     // use the HTML5 History API
    $locationProvider.html5Mode(true);

});
