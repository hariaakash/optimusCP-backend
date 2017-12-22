angular.module('optimusApp')
    .controller('forgotPasswordCtrl', function($scope, $state, $http, $rootScope) {
        $rootScope.checkAuth();
        $scope.sendEmailVerification = function() {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'user/forgotPassword',
                    data: $scope.data
                })
                .then(function(res) {
                    if (res.data.status) {
                        $state.go('login');
                        $rootScope.toast('Success', res.data.msg, "success", 0);
                    } else {
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function() {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
    });
