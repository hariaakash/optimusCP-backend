angular.module('optimusApp')
    .controller('editProfileCtrl', function($rootScope, $http, $scope, $state) {
        $rootScope.checkAuth();
        $rootScope.editProfile = function() {
            $('#btnLoad').button('loading');
            $scope.user.adminKey = $rootScope.adminKey;
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'admin/editProfile',
                data: $scope.user
            }).then(function(res) {
                if (res.data.status == true) {
                    $state.reload();
                    $rootScope.checkAuth(true);
                    $state.go('dashboard.home');
                    $rootScope.toast('Success', res.data.msg, "success");
                } else {
                    $('#btnLoad').button('reset');
                    $rootScope.toast('Error', res.data.msg, 'error');
                }
            }, function(res) {
                $('#btnLoad').button('reset');
                $rootScope.toast('Failed', "Some error occurred, try again.", "error");
            });
        };
    });
