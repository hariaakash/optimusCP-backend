angular.module('optimusApp')
    .controller('changePasswordAccountCtrl', function($rootScope, $location, $http, $scope, $timeout) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $rootScope.changePasswordAccount = function() {
            if ($scope.pass1 == $scope.pass2) {
                $scope.newPassword = $scope.pass1;
                $('#btnLoad').button('loading');
                $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'user/changePasswordAccount',
                    data: {
                        authKey: $rootScope.authKey,
                        oldPassword: $scope.oldPassword,
                        newPassword: $scope.newPassword
                    }
                }).then(function(res) {
                    if (res.data.status == true) {
                        $location.path('/home');
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $('#btnLoad').button('reset');
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
            } else {
                $rootScope.toast('Failed', "Password's doesn't match", "error", 10000);
            }
        };
    });
