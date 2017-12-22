angular.module('optimusApp')
    .controller('registerCtrl', function($scope, $rootScope, $state, $http) {
        $rootScope.checkAuth();
        $scope.registerUser = function() {
            $('#btnLoad').button('loading');
            if ($scope.user.pass1 == $scope.user.pass2) {
                $scope.data = {
                    email: $scope.user.email,
                    password: $scope.user.pass1
                };
                $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'user/register',
                    data: $scope.data
                }).then(function(res) {
                    if (res.data.status == true) {
                        $state.go('login');
                        $rootScope.toast('Success', res.data.msg, "success", 0);
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $('#btnLoad').button('reset');
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
            } else {
                $('#btnLoad').button('reset');
                $rootScope.toast('Failed', "Password's are not same, try again.", "error", 0);
            }
        };
    });
