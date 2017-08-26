angular.module('optimusApp')
	.controller('startupScriptCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window) {
		$rootScope.checkAuth();
		$scope.serverId = $stateParams.serverId;
		$scope.getServerInfo = function () {
			if ($scope.serverId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'server/m-det',
						params: {
							authKey: $rootScope.authKey,
							serverId: $scope.serverId
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.serverData = res.data.data;
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
			} else {
				$state.go('dashboard.home');
			}
		};
		$scope.getServerInfo();
		$scope.addStartupScript = function () {
			$('#btnLoad').button('loading');
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'server/addStartupScript',
				data: {
					authKey: $rootScope.authKey,
					serverId: $scope.serverId,
					cmd: $scope.ssCmd
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
		$scope.delStartupScript = function (ssId) {
			$('#btnLoad').button('loading');
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'server/delStartupScript',
				data: {
					authKey: $rootScope.authKey,
					serverId: $scope.serverId,
					startupScriptId: ssId
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
	});
