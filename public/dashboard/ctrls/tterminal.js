angular.module('optimusApp')
    .controller('tterminalCtrl', function($rootScope, $scope, $http, $stateParams, $state, $window, $sce) {
        $rootScope.checkAuth();
        $rootScope.profile = false;
        $scope.serverId = $stateParams.serverId;
        $rootScope.teamId = $stateParams.teamId;
        $scope.getServerInfo = function() {
            if ($scope.serverId && $rootScope.teamId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'tserver/m-det/' + $rootScope.teamId,
                        params: {
                            authKey: $rootScope.authKey,
                            serverId: $scope.serverId
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $rootScope.serverData = res.data.data;
                            $scope.url = $sce.trustAsResourceUrl('https://terminal.optimuscp.io/ssh/host/' + $rootScope.serverData.ip + '?port=' + $rootScope.serverData.port + '&authKey=' + $rootScope.authKey + '&uname=optimusCP&serverId=' + $rootScope.serverData.id);
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
    });
