angular.module('optimusApp')
    .controller('addCreditCtrl', function($rootScope, $window, $http, $scope, $timeout) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $scope.redirectStatus = false;
        $rootScope.addCredit = function(x) {
            if (x >= 5) {
                $('#btnLoad').button('loading');
                $http({
                        method: 'POST',
                        url: $rootScope.apiUrl + 'payment',
                        data: {
                            authKey: $rootScope.authKey,
                            amount: x
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $scope.redirect(res.data.url);
                        } else {
                            $('#btnLoad').button('reset');
                            $rootScope.toast('Failed', res.data.msg, "error");
                        }
                    }, function(res) {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            } else {
                $rootScope.toast('Info', "Minimum credit added should be atleast $5", "info")
            }
        };
        $scope.redirect = function(url) {
        $scope.redirectStatus = true;
            $timeout(function() {
                $window.location.href = url;
            }, 3000);
        };
    });
