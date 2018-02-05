angular.module('optimusApp')
    .controller('userInvoiceCtrl', function($rootScope, $location, $http, $scope, $state, $stateParams) {
        $rootScope.checkAuth();
        $rootScope.profile = true;
        $rootScope.uId = $stateParams.uId;
        $scope.iId = $stateParams.iId;
        $scope.getInvoiceData = function() {
            if ($rootScope.uId && $scope.iId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'admin/userInvoice/' + $rootScope.uId,
                        params: {
                            adminKey: $rootScope.adminKey,
                            iId: $scope.iId
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $scope.invoiceData = res.data.data;
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
