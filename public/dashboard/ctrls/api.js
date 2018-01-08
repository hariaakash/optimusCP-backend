angular.module('optimusApp')
    .controller('apiCtrl', function($rootScope, $location, $http, $scope, $state, $window) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.getApiInfo = function() {
            $http({
                    method: 'GET',
                    url: $rootScope.apiUrl + 'apiKey',
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
        };
        $scope.getApiInfo();
        $scope.addApiKey = function() {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'apiKey/create',
                data: {
                    authKey: $rootScope.authKey,
                    name: $scope.apiName
                }
            }).then(function(res) {
                if (res.data.status == true) {
                    $rootScope.closeModal();
                    $state.reload();
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
        $scope.delApiKey = function(apiKeyId) {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'apiKey/delete',
                data: {
                    authKey: $rootScope.authKey,
                    apiId: apiKeyId
                }
            }).then(function(res) {
                if (res.data.status == true) {
                    $rootScope.closeModal();
                    $state.reload();
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
        $scope.copySuccess = function() {
            $rootScope.toast("Success", "API Key copied to clipboard.", "info");
        };
        $scope.openLog = function(x) {
            $scope.logsData = x.logs;
            $('#viewLog').modal('show');
        };
    });
