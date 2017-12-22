angular.module('optimusApp')
    .controller('serverActivityCtrl', function($rootScope, $scope, $http, $stateParams, $state, $window) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $scope.currentPage = 1;
        $scope.pageSize = 20;
        $scope.serverId = $stateParams.serverId;
        $scope.getServerInfo = function() {
            if ($scope.serverId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'server/m-det',
                        params: {
                            authKey: $rootScope.authKey,
                            serverId: $scope.serverId
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $rootScope.serverData = res.data.data;
                            $http({
                                    method: 'GET',
                                    url: $rootScope.apiUrl + 'server/activity',
                                    params: {
                                        authKey: $rootScope.authKey,
                                        serverId: $scope.serverId
                                    }
                                })
                                .then(function(res) {
                                    if (res.data.status == true) {
                                        $scope.activityData = res.data.data;
                                    } else {
                                        $state.go('dashboard.home');
                                        $rootScope.toast('Failed', res.data.msg, "error");
                                    }
                                }, function(res) {
                                    $('#btnLoad').button('reset');
                                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                                });
                        } else {
                            $state.go('dashboard.home');
                            $rootScope.toast('Failed', res.data.msg, "error");
                        }
                    }, function(res) {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            } else {
                $state.go('dashboard.home');
            }
        };
        $scope.getServerInfo();
    });
