angular.module('optimusApp')
	.controller('sendEmailVerificationCtrl', function ($scope, $location, $http, $rootScope) {
		$rootScope.checkAuth();
		$scope.sendEmailVerification = function () {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'user/sendEmailVerification',
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
