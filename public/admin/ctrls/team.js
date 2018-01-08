angular.module('optimusApp')
	.controller('teamCtrl', function ($rootScope, $scope, $http, $stateParams, $state) {
		$rootScope.checkAuth();
		$rootScope.tId = $stateParams.tId;
		$scope.getTeamInfo = function () {
			if ($rootScope.tId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'admin/team/' + $rootScope.tId,
						params: {
							adminKey: $rootScope.adminKey
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.teamData = res.data.data;
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
		$scope.getTeamInfo();
        $scope.blockTeam = function() {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/blockTeam',
                    data: {
                        adminKey: $rootScope.adminKey,
                        tId: $rootScope.tId
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $state.reload();
                        $rootScope.checkAuth();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.unBlockTeam = function() {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/unBlockTeam',
                    data: {
                        adminKey: $rootScope.adminKey,
                        tId: $rootScope.tId
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $state.reload();
                        $rootScope.checkAuth();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
	});
