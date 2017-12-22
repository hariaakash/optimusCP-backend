angular.module('optimusApp')
    .controller('supportCtrl', function($rootScope, $scope, $http, $state, $window) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $scope.getSupportTickets = function() {
            $http({
                    method: 'GET',
                    url: $rootScope.apiUrl + 'user/tickets',
                    params: {
                        authKey: $rootScope.authKey
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $scope.supportTickets = res.data.data;
                    } else {
                        $rootScope.toast('Failed', res.data.msg, "error");
                        $state.go('dashboard.home');
                    }
                }, function(res) {
                    $('#btnLoad').button('reset');
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.getSupportTickets();
        $scope.createTicket = function() {
            $('#btnLoad').button('loading');
            $scope.newTicket.authKey = $rootScope.authKey;
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'user/tickets/create',
                data: $scope.newTicket
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
    });
