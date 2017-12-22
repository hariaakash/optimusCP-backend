angular.module('optimusApp')
    .controller('ticketCtrl', function($rootScope, $scope, $http, $stateParams, $state, $window) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $scope.tId = $stateParams.tId;
        $scope.getTicketInfo = function() {
            if ($scope.tId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'user/tickets/' + $scope.tId,
                        params: {
                            authKey: $rootScope.authKey
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $rootScope.ticketData = res.data.data;
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
        $scope.getTicketInfo();
        $scope.ticketReply = function() {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'user/tickets/msg',
                data: {
                    authKey: $rootScope.authKey,
                    tId: $scope.tId,
                    msg: $scope.newReply
                }
            }).then(function(res) {
                if (res.data.status == true) {
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
        $scope.closeTicket = function() {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'user/tickets/close',
                data: {
                    authKey: $rootScope.authKey,
                    tId: $scope.tId
                }
            }).then(function(res) {
                if (res.data.status == true) {
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
        $scope.reOpenTicket = function() {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'user/tickets/reopen',
                data: {
                    authKey: $rootScope.authKey,
                    tId: $scope.tId
                }
            }).then(function(res) {
                if (res.data.status == true) {
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
    });
