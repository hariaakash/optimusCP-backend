angular.module('optimusApp')
	.controller('userPaymentCtrl', function ($rootScope, $scope, $http, $stateParams, $state) {
		$rootScope.checkAuth();
        $scope.currentPage = 1;
        $scope.pageSize = 10;
		$rootScope.uId = $stateParams.uId;
		$scope.getUserPaymentInfo = function () {
			if ($rootScope.uId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'admin/userPayment/' + $rootScope.uId,
						params: {
							adminKey: $rootScope.adminKey
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.userPaymentData = res.data.data;
						} else {
							$rootScope.toast('Error', res.data.msg, "error");
							$state.go('dashboard.home');
						}
					}, function (res) {
						$('#btnLoad').button('reset');
						$rootScope.toast('Failed', "Some error occurred, try again.", "error");
					});
			} else {
				$state.go('dashboard.home');
			}
		};
		$scope.getUserPaymentInfo();
	});
