angular.module('optimusApp')
	.controller('verifyEmailCtrl', function ($scope, $rootScope, $location, $http, $stateParams) {
		$rootScope.checkAuth();
		$scope.data = {
			email: decodeURIComponent($stateParams.email),
			key: $stateParams.key
		};
		$scope.verifyEmail = function () {
			if ($scope.data.key && $scope.data.email) {
				$http({
						method: 'POST',
						url: $rootScope.apiUrl + 'user/verifyEmail',
						data: $scope.data
					})
					.then(function (res) {
						if (res.data.status) {
							$location.search({});
							$location.path('/login');
							swal({
								title: 'Success',
								text: 'Email verified successfully !!',
								type: 'success',
								showConfirmButton: true
							});
						} else {
							swal({
								title: 'Failed',
								text: res.data.msg,
								type: 'error',
								showConfirmButton: true
							});
						}
					}, function () {
						swal("Fail", "Some error occurred, try again.", "error");
					});
			} else {
				$location.search({});
				$location.path('/error');
			}
		};
	});
