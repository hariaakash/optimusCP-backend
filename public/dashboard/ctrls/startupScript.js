angular.module('optimusApp')
    .controller('startupScriptCtrl', function($rootScope, $scope, $http, $stateParams, $state) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
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
                        } else {
                            $rootScope.toast('Failed', res.data.msg, "error");
                            $state.go('dashboard.home');
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
        $scope.addStartupScript = function() {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'server/addStartupScript',
                data: {
                    authKey: $rootScope.authKey,
                    serverId: $scope.serverId,
                    cmd: $scope.ssCmd
                }
            }).then(function(res) {
                if (res.data.status == true) {
                    $rootScope.closeModal();
                    $state.reload();
                    $rootScope.toast('Success', res.data.msg, "success");
                } else {
                    $('#btnLoad').button('reset');
                    $rootScope.toast('Failed', res.data.msg, "error");
                }
            }, function(res) {
                $rootScope.toast('Failed', "Some error occurred, try again.", "error");
            });
        };
        $scope.delStartupScript = function(ssId) {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'server/delStartupScript',
                data: {
                    authKey: $rootScope.authKey,
                    serverId: $scope.serverId,
                    startupScriptId: ssId
                }
            }).then(function(res) {
                if (res.data.status == true) {
                    $rootScope.closeModal();
                    $state.reload();
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
