angular.module('optimusApp')
	.controller('homeCtrl', function ($rootScope, $scope, $location, $http, $window, $timeout) {
		$rootScope.checkAuth();
		$scope.currentPage = 1;
		$scope.pageSize = 10;
	});
