angular.module('optimusApp')
    .controller('staffCtrl', function($rootScope, $scope, $http, $stateParams, $state, $window) {
        $rootScope.checkAuth();
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.type = ['support', 'admin'];
        $scope.getServerInfo = function() {
            $http({
                    method: 'GET',
                    url: $rootScope.apiUrl + 'admin/view',
                    params: {
                        adminKey: $rootScope.adminKey
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.adminData = res.data.data;
                    } else {
                        $rootScope.toast('Error', res.data.msg, "error");
                        $state.go('dashboard.home');
                    }
                }, function(res) {
                    $('#btnLoad').button('reset');
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.getServerInfo();
        $scope.addUser = function() {
            $('#btnLoad').button('loading');
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/addUser',
                    data: {
                        adminKey: $rootScope.adminKey,
                        email: $scope.addUserForm.email,
                        role: $scope.addUserForm.role
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.closeModal();
                        $state.reload();
                        $rootScope.checkAuth();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Error', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.blockUser = function(x) {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/blockStaff',
                    data: {
                        adminKey: $rootScope.adminKey,
                        sId: x
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $state.reload();
                        $rootScope.checkAuth();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Error', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.unBlockUser = function(x) {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/unBlockStaff',
                    data: {
                        adminKey: $rootScope.adminKey,
                        sId: x
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $state.reload();
                        $rootScope.checkAuth();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Error', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.delUser = function(x) {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'admin/delStaff',
                    data: {
                        adminKey: $rootScope.adminKey,
                        sId: x
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $state.reload();
                        $rootScope.checkAuth();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Error', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.openLog = function(x) {
            $scope.logsData = x;
            $scope.logsData.logs = $scope.logsData.logs.reverse();
            $('#viewLog').modal('show');
        };
    });
