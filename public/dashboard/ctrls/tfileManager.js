angular.module('optimusApp')
    .controller('tfileManagerCtrl', function($rootScope, $scope, $http, $stateParams, $state, $window, $sce) {
        $rootScope.checkAuth();
        $rootScope.profile = false;
        $scope.serverId = $stateParams.serverId;
        $rootScope.teamId = $stateParams.teamId;
        $scope.getServerInfo = function() {
            if ($scope.serverId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'tserver/m-det/' + $scope.teamId,
                        params: {
                            authKey: $rootScope.authKey,
                            serverId: $scope.serverId
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $rootScope.serverData = res.data.data;
                            $scope.url = $sce.trustAsResourceUrl('https://sftp.optimuscp.io/?ftpserver=' + $rootScope.serverData.ip + '&ftpserverport=' + $rootScope.serverData.port + '&username=optimusCP&authKey=' + $rootScope.authKey + '&serverId=' + $rootScope.serverData.id + '&state=browse&state2=main&protocol=FTP-SSH');
                            document.addEventListener('contextmenu', e => e.preventDefault());
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
