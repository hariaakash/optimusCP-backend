angular.module('optimusApp')
    .controller('invoiceCtrl', function($rootScope, $location, $http, $scope, $state, $stateParams) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $scope.invoiceId = $stateParams.invoiceId;
        $scope.getInvoiceData = function() {
            if ($scope.invoiceId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'payment/invoice',
                        params: {
                            authKey: $rootScope.authKey,
                            iId: $scope.invoiceId
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $scope.invoiceData = res.data.data;
                            console.log($scope.invoiceData)
                        } else {
                            $rootScope.toast('Failed', res.data.msg, "error");
                            $state.go('dashboard.home');
                        }
                    }, function(res) {
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            } else {
                $rootScope.toast('Failed', 'Invoice not found.', "error");
                $state.go('dashboard.billing.history');
            }
        };
        $scope.getInvoiceData();
        $scope.printInvoice = function() {
            var mode = 'iframe'; //popup
            var close = mode == "popup";
            var options = {
                mode: mode,
                popClose: close
            };
            $("div.printableArea").printArea(options);
        };
    });
