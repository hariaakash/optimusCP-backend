angular.module('optimusApp')
	.controller('userCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window) {
		$rootScope.checkAuth();
		$rootScope.uId = $stateParams.uId;
		$scope.getServerInfo = function () {
			if ($rootScope.uId) {
				$http({
						method: 'POST',
						url: $rootScope.apiUrl + 'admin/user/' + $rootScope.uId,
						data: {
							adminKey: $rootScope.adminKey
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.userData = res.data.data;
							console.log($rootScope.userData)
						} else {
							swal({
								title: 'Failed',
								text: res.data.msg,
								type: 'error',
								timer: 2000,
								showConfirmButton: true
							});
							$state.go('dashboard.home');
						}
					}, function (res) {
						$('#btnLoad').button('reset');
						swal("Fail", "Some error occurred, try again.", "error");
					});
			} else {
				$state.go('dashboard.home');
			}
		};
		$scope.getServerInfo();
		$scope.createTicket = function () {
			$('#btnLoad').button('loading');
			$scope.newTicket.adminKey = $rootScope.adminKey;
			$scope.newTicket.uId = $rootScope.uId;
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/tickets/create',
					data: $scope.newTicket
				})
				.then(function (res) {
					if (res.data.status == true) {
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: true
						}).then(function () {
							$window.location.reload();
						});
					} else {
						$('#btnLoad').button('reset');
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							timer: 2000,
							showConfirmButton: true
						});
					}
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
	});
