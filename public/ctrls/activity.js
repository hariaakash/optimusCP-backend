angular.module('optimusApp')
	.controller('activityCtrl', function ($rootScope, $location, $http, $scope, $timeout, $state) {
		$rootScope.checkAuth();
		$scope.currentPage = 1;
		$scope.pageSize = 10;
		$scope.getActivityInfo = function () {
			$http({
					method: 'GET',
					url: $rootScope.apiUrl + 'user/activity',
					params: {
						authKey: $rootScope.authKey
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						$rootScope.activityData = res.data.data;
						console.log($rootScope.activityData)
					} else {
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							timer: 2000,
							showConfirmButton: true
						});
						$state.go('dashboard.home');
					}
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
		$scope.getActivityInfo();
	});
