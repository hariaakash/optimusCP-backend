angular.module('optimusApp')
    .controller('verifyEmailCtrl', function($scope, $rootScope, $location, $state, $http, $stateParams) {
        $rootScope.checkAuth();
        $scope.data = {
            email: decodeURIComponent($stateParams.email),
            key: $stateParams.key
        };
        $scope.verifyEmail = function() {
            if ($scope.data.key && $scope.data.email) {
                $http({
                        method: 'POST',
                        url: $rootScope.apiUrl + 'user/verifyEmail',
                        data: $scope.data
                    })
                    .then(function(res) {
                        if (res.data.status) {
                            $location.search({});
                            $location.path('/login');
                            $rootScope.toast('Success', res.data.msg, "success");
                        } else {
                            $rootScope.toast('Failed', res.data.msg, "error");
                        }
                    }, function() {
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            } else {
                $location.search({});
                $location.path('/error');
            }
        };
    });
