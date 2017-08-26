angular.module('optimusApp')
	.controller('changePasswordAccountCtrl', function ($rootScope, $location, $http, $scope, $timeout) {
		$rootScope.checkAuth();
		$rootScope.changePasswordAccount = function () {
			if ($scope.pass1 == $scope.pass2) {
				$scope.newPassword = $scope.pass1;
				$('#btnLoad').button('loading');
				$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/changePasswordAccount',
					data: {
						adminKey: $rootScope.adminKey,
						oldPassword: $scope.oldPassword,
						newPassword: $scope.newPassword
					}
				}).then(function (res) {
					if (res.data.status == true) {
						$location.path('/home');
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: true
						});
					} else {
						$('#btnLoad').button('reset');
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							timer: 2000,
							showConfirmButton: true
						});
					}
				}, function (res) {
					$('#btnLoad').button('reset');
					swal("Fail", "Some error occurred, try again.", "error");
				});
			} else {
				swal("Fail", "New password doesn't match", "error");
			}
		};
	});
