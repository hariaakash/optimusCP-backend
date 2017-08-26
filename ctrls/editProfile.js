angular.module('optimusApp')
	.controller('editProfileCtrl', function ($rootScope, $location, $http, $scope, $timeout, $window) {
		$rootScope.checkAuth();
		$rootScope.editProfile = function () {
			$('#btnLoad').button('loading');
			$scope.user.authKey = $rootScope.authKey;
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'user/editProfile',
				data: $scope.user
			}).then(function (res) {
				if (res.data.status == true) {
					swal({
						title: 'Success',
						text: res.data.msg,
						type: 'success',
						showConfirmButton: false
					});
					$timeout(function () {
						$window.location.reload();
					}, 2000);
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
		};
	});
