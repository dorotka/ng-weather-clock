var test = angular.module('test');

function TestCtrl($scope) {
    $scope.testing = 'test';
    console.log("testing", $scope.testing);
}

test.controller('TestCtrl', ['$scope', TestCtrl]);
