angular.module('optimusApp')
    .controller('activityCtrl', function($rootScope, $http, $scope, $state) {
        $rootScope.checkAuth();
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.getActivityInfo = function() {
            $http({
                    method: 'GET',
                    url: $rootScope.apiUrl + 'admin/activity',
                    params: {
                        adminKey: $rootScope.adminKey
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.activityData = res.data.data;
                    } else {
                        $rootScope.toast('Error', res.data.msg, 'error');
                        $state.go('dashboard.home');
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.getActivityInfo();
    });
