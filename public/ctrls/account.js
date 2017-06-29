angular.module('optimusApp')
	.controller('accountCtrl', function ($rootScope, $location, $http) {
		$rootScope.checkAuth();
	});
