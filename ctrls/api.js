angular.module('optimusApp')
	.controller('apiCtrl', function ($rootScope, $location, $http, $scope, $state, $window) {
		$rootScope.checkAuth();
		$scope.currentPage = 1;
		$scope.pageSize = 10;
		$scope.getApiInfo = function () {
			$http({
					method: 'GET',
					url: $rootScope.apiUrl + 'apiKey',
					params: {
						authKey: $rootScope.authKey
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						$rootScope.apiData = res.data.data;
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
		$scope.getApiInfo();
		$scope.addApiKey = function () {
			$('#btnLoad').button('loading');
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'apiKey/create',
				data: {
					authKey: $rootScope.authKey,
					name: $scope.apiName
				}
			}).then(function (res) {
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
		$scope.delApiKey = function (apiKeyId) {
			$('#btnLoad').button('loading');
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'apiKey/delete',
				data: {
					authKey: $rootScope.authKey,
					apiId: apiKeyId
				}
			}).then(function (res) {
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
		$scope.copySuccess = function () {
			$rootScope.toast("Success", "API Key copied to clipboard.", "info");
		};
		$scope.openLog = function (x) {
			$scope.logsData = x.logs;
			console.log($scope.logsData)
			$('#viewLog').modal('show');
		};
	});
