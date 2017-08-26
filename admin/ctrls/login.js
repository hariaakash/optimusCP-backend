angular.module('optimusApp')
	.controller('loginCtrl', function ($scope, $rootScope, $http, $location, $state) {
		$rootScope.checkAuth();
		$scope.loginUser = function () {
			$('#btnLoad').button('loading');
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'admin/login',
				data: $scope.user
			}).then(function (res) {
				if (res.data.status == true) {
					$rootScope.adminKey = res.data.adminKey;
					console.log(res.data)
					Cookies.set('adminKey', $rootScope.adminKey);
					$location.path('/home');
					swal({
						title: 'Success',
						text: 'You have successfully Signed In !!',
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
		};
	});
