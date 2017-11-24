angular.module('optimusApp')
	.controller('homeCtrl', function ($rootScope, $scope, $location, $http, $window, $timeout) {
		$rootScope.checkAuth();
		$scope.currentPage = 1;
		$scope.pageSize = 10;
		$scope.blockUser = function (x) {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/blockUser',
					data: {
						adminKey: $rootScope.adminKey,
						uId: x
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: true
						}).then(function () {
							$window.location.reload();
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
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
		$scope.unBlockUser = function (x) {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/unBlockUser',
					data: {
						adminKey: $rootScope.adminKey,
						uId: x
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: true
						}).then(function () {
							$window.location.reload();
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
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
	});
