angular.module('optimusApp')
	.controller('adminCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window) {
		$rootScope.checkAuth();
		$scope.currentPage = 1;
		$scope.pageSize = 10;
		$scope.type = ['support', 'admin'];
		$scope.getServerInfo = function () {
			$http({
					method: 'GET',
					url: $rootScope.apiUrl + 'admin/view',
					params: {
						adminKey: $rootScope.adminKey
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						$rootScope.adminData = res.data.data;
						console.log($rootScope.adminData)
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
					$('#btnLoad').button('reset');
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
		$scope.getServerInfo();
		$scope.addUser = function () {
			$('#btnLoad').button('loading');
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/addUser',
					data: {
						adminKey: $rootScope.adminKey,
						email: $scope.addUserForm.email,
						role: $scope.addUserForm.role
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
		$scope.blockUser = function (x) {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/blockStaff',
					data: {
						adminKey: $rootScope.adminKey,
						sId: x
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
		$scope.delUser = function (x) {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/delStaff',
					data: {
						adminKey: $rootScope.adminKey,
						sId: x
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
					url: $rootScope.apiUrl + 'admin/unBlockStaff',
					data: {
						adminKey: $rootScope.adminKey,
						sId: x
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
		$scope.openLog = function (x) {
			$scope.logsData = x;
			$scope.logsData.logs = $scope.logsData.logs.reverse();
			$('#viewLog').modal('show');
		};
	});
