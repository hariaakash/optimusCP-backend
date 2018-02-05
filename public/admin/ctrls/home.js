angular.module('optimusApp')
    .controller('homeCtrl', function($rootScope, $scope, $http, $state) {
        $rootScope.checkAuth();
        if (!$rootScope.homeCurrentPage)
            $rootScope.homeCurrentPage = 1;
        $scope.pageSize = 10;
        $scope.blockUser = function(x) {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/blockUser',
                    data: {
                        adminKey: $rootScope.adminKey,
                        uId: x
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.checkAuth(true);
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.unBlockUser = function(x) {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/unBlockUser',
                    data: {
                        adminKey: $rootScope.adminKey,
                        uId: x
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.checkAuth(true);
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.updatePage = function (x) {
            $rootScope.homeCurrentPage = x;
        };
    });
