angular.module('optimusApp')
	.controller('teamActivityCtrl', function ($rootScope, $scope, $http, $stateParams, $state) {
		$rootScope.checkAuth();
        $scope.currentPage = 1;
        $scope.pageSize = 10;
		$rootScope.tId = $stateParams.tId;
		$scope.getTeamActivityInfo = function () {
			if ($rootScope.tId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'admin/teamActivity/' + $rootScope.tId,
						params: {
							adminKey: $rootScope.adminKey
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.teamActivityData = res.data.data;
						} else {
							$rootScope.toast('Error', res.data.msg, "error");
							$state.go('dashboard.home');
						}
					}, function (res) {
						$('#btnLoad').button('reset');
						$rootScope.toast('Failed', "Some error occurred, try again.", "error");
					});
			} else {
				$state.go('dashboard.home');
			}
		};
		$scope.getTeamActivityInfo();
	});
