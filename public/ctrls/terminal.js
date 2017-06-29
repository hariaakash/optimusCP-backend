angular.module('optimusApp')
	.controller('terminalCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window) {
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
		$scope.items = [];
		$scope.commands = ['clear', 'ls', 'rm', 'cd', 'cmp', 'cp', 'df', 'mv', 'mkdir', 'rmdir', 'wget', 'hostname', 'reboot'];
		$scope.id = 0;
		$scope.send = function () {
			if ($scope.command == 'clear') {
				$scope.items.length = 0;
				$scope.command = '';
			} else {
				$('#btnLoad').button('loading');
				$http({
						method: 'POST',
						url: $rootScope.apiUrl + 'server/exec',
						data: {
							authKey: $rootScope.authKey,
							serverId: $scope.serverId,
							cmd: 5,
							command: $scope.command
						}
					})
					.then(function (res) {
						$('#btnLoad').button('reset');
						if (res.data.status == true) {
							$scope.id++;
							$scope.items.push({
								id: $scope.id,
								command: $scope.command,
								resp: res.data.result
							});
							$scope.command = '';
						} else {
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
			}
		};
		$scope.autofill = function (x) {
			$scope.command = x;
			$('#command').focus();
		};
	});
