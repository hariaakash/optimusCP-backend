angular.module('optimusApp')
	.controller('supportCtrl', function ($rootScope, $scope, $http, $state, $window) {
		$rootScope.checkAuth();
		$scope.getSupportTickets = function () {
			$http({
					method: 'GET',
					url: $rootScope.apiUrl + 'user/tickets',
					params: {
						authKey: $rootScope.authKey
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						$scope.supportTickets = res.data.data;
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
		};
		$scope.getSupportTickets();
		$scope.createTicket = function () {
			$('#btnLoad').button('loading');
			$scope.newTicket.authKey = $rootScope.authKey;
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'user/tickets/create',
				data: $scope.newTicket
			}).then(function (res) {
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
