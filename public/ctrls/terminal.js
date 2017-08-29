angular.module('optimusApp')
	.controller('terminalCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window, $sce) {
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
							$scope.url = $sce.trustAsResourceUrl('https://web.optimuscp.io/ssh/host/' + $rootScope.serverData.ip + '?port=' + $rootScope.serverData.port + '&uname=optimusCP&pass=' + $rootScope.serverData.id);
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
	});
