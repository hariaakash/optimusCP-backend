angular.module('optimusApp')
    .controller('editProfileCtrl', function($rootScope, $http, $scope, $state) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $rootScope.editProfile = function() {
            $('#btnLoad').button('loading');
            $scope.user.authKey = $rootScope.authKey;
            $http({
                method: 'POST',
                url: $rootScope.apiUrl + 'user/editProfile',
                data: $scope.user
            }).then(function(res) {
                if (res.data.status == true) {
                    $state.reload();
                    $rootScope.checkAuth(true);
                    $state.go('dashboard.home');
                    $rootScope.toast('Success', res.data.msg, "success");
                } else {
                    $('#btnLoad').button('reset');
                    $rootScope.toast('Failed', res.data.msg, "error");
                }
            }, function(res) {
                $('#btnLoad').button('reset');
                $rootScope.toast('Failed', "Some error occurred, try again.", "error");
            });
        };
    });
