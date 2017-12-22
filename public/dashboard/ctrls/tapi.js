angular.module('optimusApp')
    .controller('tapiCtrl', function($rootScope, $scope, $http, $stateParams, $state) {
        $rootScope.checkAuth();
        $rootScope.profile = false;
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $rootScope.teamId = $stateParams.teamId;
        $rootScope.getTeamInfo = function() {
            if ($rootScope.teamId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'team/' + $rootScope.teamId,
                        params: {
                            authKey: $rootScope.authKey
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $rootScope.teamData = res.data.data;
                            $http({
                                    method: 'GET',
                                    url: $rootScope.apiUrl + 'apiKey/' + $rootScope.teamId,
                                    params: {
                                        authKey: $rootScope.authKey
                                    }
                                })
                                .then(function(res) {
                                    if (res.data.status == true) {
                                        $rootScope.apiData = res.data.data;
                                    } else {
                                        $rootScope.toast('Failed', res.data.msg, "error");
                                        $state.go('dashboard.home');
                                    }
                                }, function(res) {
                                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                                });
                        } else {
                            $rootScope.toast('Failed', res.data.msg, "error");
                            $state.go('dashboard.home');
                        }
                    }, function(res) {
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            } else {
                $state.go('dashboard.home');
            }
        };
        $rootScope.getTeamInfo();
        $scope.addApiKey = function() {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'apiKey/create/' + $rootScope.teamId,
                data: {
                    authKey: $rootScope.authKey,
                    name: $scope.apiName
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
        $scope.delApiKey = function(apiKeyId) {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'apiKey/delete/' + $rootScope.teamId,
                data: {
                    authKey: $rootScope.authKey,
                    apiId: apiKeyId
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
        $scope.copySuccess = function() {
            $rootScope.toast("Success", "API Key copied to clipboard.", "info");
        };
        $scope.openLog = function(x) {
            $scope.logsData = x.logs;
            $('#viewLog').modal('show');
        };
    });
