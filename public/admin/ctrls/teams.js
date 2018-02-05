angular.module('optimusApp')
    .controller('teamsCtrl', function($rootScope, $scope, $http, $state) {
        $rootScope.checkAuth();
        if (!$rootScope.teamsCurrentPage)
            $rootScope.teamsCurrentPage = 1;
        $scope.pageSize = 10;
        $scope.getTeamsInfo = function(x) {
            $http({
                    method: 'GET',
                    url: $rootScope.apiUrl + 'admin/teams',
                    params: {
                        adminKey: $rootScope.adminKey
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.teamsData = res.data.data;
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.getTeamsInfo();
        $scope.blockTeam = function(x) {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/blockTeam',
                    data: {
                        adminKey: $rootScope.adminKey,
                        tId: x
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
        $scope.unBlockTeam = function(x) {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/unBlockTeam',
                    data: {
                        adminKey: $rootScope.adminKey,
                        tId: x
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
        $scope.updatePage = function(x) {
            $rootScope.teamsCurrentPage = x;
        };
    });
