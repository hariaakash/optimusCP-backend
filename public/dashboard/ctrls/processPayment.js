angular.module('optimusApp')
    .controller('processPaymentCtrl', function($rootScope, $location, $http, $scope, $state) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $scope.processData = function() {
            var data = $location.search();
            console.log(data)
            if (data) {
                if (data.payment_id && data.payment_request_id) {
                    $http({
                            method: 'GET',
                            url: $rootScope.apiUrl + 'payment/instamojo',
                            params: {
                                authKey: $rootScope.authKey,
                                pid: data.payment_id,
                                prid: data.payment_request_id,
                                handler: 'instamojo'
                            }
                        })
                        .then(function(res) {
                            if (res.data.status == true) {
                                $state.go('dashboard.invoice', {
                                    invoiceId: res.data.data
                                });
                            } else {
                                $rootScope.toast('Failed', res.data.msg, "error");
                                $state.go('dashboard.billing.history');
                            }
                        }, function(res) {
                            $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                            $state.go('dashboard.billing.history');
                        });
                } else {
                    $state.go('dashboard.billing.history');
                }
            } else {
                $state.go('dashboard.billing.history');
            }
        };
        $scope.processData();
    });
