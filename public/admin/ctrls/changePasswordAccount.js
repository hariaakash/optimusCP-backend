angular.module('optimusApp')
    .controller('changePasswordAccountCtrl', function($rootScope, $http, $scope, $state) {
        $rootScope.checkAuth();
        $rootScope.changePasswordAccount = function() {
            if ($scope.pass1 == $scope.pass2) {
                $scope.newPassword = $scope.pass1;
                $('#btnLoad').button('loading');
                $http({
                        method: 'POST',
                        url: $rootScope.apiUrl + 'admin/changePasswordAccount',
                        data: {
                            adminKey: $rootScope.adminKey,
                            oldPassword: $scope.oldPassword,
                            newPassword: $scope.newPassword
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $state.go('dashboard.home');
                            $rootScope.toast('Success', res.data.msg, 'success');
                        } else {
                            $('#btnLoad').button('reset');
                            $rootScope.toast('Error', res.data.msg, 'error');
                        }
                    }, function(res) {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            } else {
                $rootScope.toast('Error', "New password doesn't match", 'error');
            }
        };
    });
