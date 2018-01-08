angular.module('optimusApp')
	.controller('userCtrl', function ($rootScope, $scope, $http, $stateParams, $state) {
		$rootScope.checkAuth();
		$rootScope.uId = $stateParams.uId;
		$scope.getUserInfo = function () {
			if ($rootScope.uId) {
				$http({
						method: 'POST',
						url: $rootScope.apiUrl + 'admin/user/' + $rootScope.uId,
						data: {
							adminKey: $rootScope.adminKey
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.userData = res.data.data;
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
		$scope.getUserInfo();
        $scope.blockUser = function() {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/blockUser',
                    data: {
                        adminKey: $rootScope.adminKey,
                        uId: $rootScope.uId
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
        $scope.unBlockUser = function() {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/unBlockUser',
                    data: {
                        adminKey: $rootScope.adminKey,
                        uId: $rootScope.uId
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
		$scope.createTicket = function () {
			$('#btnLoad').button('loading');
			$scope.newTicket.adminKey = $rootScope.adminKey;
			$scope.newTicket.uId = $rootScope.uId;
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/tickets/create',
					data: $scope.newTicket
				})
				.then(function (res) {
					if (res.data.status == true) {
                        $state.reload();
                        $rootScope.checkAuth();
                        $rootScope.toast('Success', res.data.msg, "success");
					} else {
						$('#btnLoad').button('reset');
							$rootScope.toast('Error', res.data.msg, "error");
					}
				}, function (res) {
					$rootScope.toast('Failed', "Some error occurred, try again.", "error");
				});
		};
	});
