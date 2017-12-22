angular.module('optimusApp')
    .controller('activityCtrl', function($rootScope, $location, $http, $scope, $timeout, $state) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.getActivityInfo = function() {
            $http({
                    method: 'GET',
                    url: $rootScope.apiUrl + 'user/activity',
                    params: {
                        authKey: $rootScope.authKey
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.activityData = res.data.data;
                    } else {
                        $rootScope.toast('Failed', res.data.msg, "error");
                        $state.go('dashboard.home');
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.getActivityInfo();
    });
