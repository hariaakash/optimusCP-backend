angular.module('optimusApp')
	.controller('changePasswordCtrl', function ($scope, $rootScope, $location, $http, $stateParams) {
		$rootScope.checkAuth();
		$scope.data = {
			email: $stateParams.email,
			key: $stateParams.key
		};
		$scope.changePassword = function () {
			$scope.data.password = $scope.pass1;
			if ($scope.data.key && $scope.data.email && $scope.data.password) {
				$http({
						method: 'POST',
						url: $rootScope.apiUrl + 'user/changePassword',
						data: $scope.data
					})
					.then(function (res) {
						if (res.data.status) {
							$location.search({});
							$location.path('/login');
							swal({
								title: 'Success',
								text: res.data.msg,
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
						$rootScope.toast('Failed', "Some error occurred, try again.", "error");
					});
			} else {
				$location.search({});
				$location.path('/error');
			}
		};
	});
