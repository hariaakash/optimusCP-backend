angular.module('optimusApp')
	.controller('forgotPasswordCtrl', function ($scope, $location, $http, $rootScope) {
		$rootScope.checkAuth();
		$scope.sendEmailVerification = function () {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'user/forgotPassword',
					data: $scope.data
				})
				.then(function (res) {
					if (res.data.status) {
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
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
	});
