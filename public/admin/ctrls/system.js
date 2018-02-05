angular.module('optimusApp')
    .controller('systemCtrl', function($rootScope, $scope, $http, $state) {
        $rootScope.checkAuth();
        $scope.getSystemInfo = function() {
            $http({
                    method: 'GET',
                    url: $rootScope.apiUrl + 'admin/system',
                    params: {
                        adminKey: $rootScope.adminKey
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $scope.systemData = res.data.data;
                    } else {
                        $rootScope.toast('Error', res.data.msg, 'error');
                        $state.go('dashboard.home');
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.getSystemInfo();
    });
