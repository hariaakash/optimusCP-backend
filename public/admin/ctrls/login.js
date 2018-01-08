angular.module('optimusApp')
    .controller('loginCtrl', function($scope, $rootScope, $http, $state) {
        $rootScope.checkAuth();
        $scope.loginUser = function() {
            $('#btnLoad').button('loading');
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'admin/login',
                data: $scope.user
            }).then(function(res) {
                if (res.data.status == true) {
                    $rootScope.adminKey = res.data.adminKey;
                    Cookies.set('adminKey', $rootScope.adminKey);
                    $rootScope.checkAuth(true);
                    $rootScope.toast('Success', res.data.msg, "success");
                } else {
                    $('#btnLoad').button('reset');
                    $rootScope.toast('Error', res.data.msg, "error");
                }
            }, function(res) {
                $('#btnLoad').button('reset');
                $rootScope.toast('Failed', "Some error occurred, try again.", "error");
            });
        };
    });
