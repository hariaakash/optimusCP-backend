angular.module('optimusApp')
	.controller('ticketCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window) {
		$rootScope.checkAuth();
		$scope.tId = $stateParams.tId;
		$rootScope.uId = $stateParams.uId;
		$scope.getTicketInfo = function () {
			if ($scope.tId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'admin/tickets/' + $scope.tId,
						params: {
							adminKey: $rootScope.adminKey,
							uId: $rootScope.uId
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.ticketData = res.data.data;
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
						swal("Fail", "Some error occurred, try again.", "error");
					});
			} else {
				$state.go('dashboard.home');
			}
		};
		$scope.getTicketInfo();
		$scope.ticketReply = function () {
			$('#btnLoad').button('loading');
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'admin/tickets/msg',
				data: {
					adminKey: $rootScope.adminKey,
					uId: $rootScope.uId,
					tId: $scope.tId,
					msg: $scope.newReply
				}
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
		$scope.closeTicket = function () {
			$('#btnLoad').button('loading');
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'admin/tickets/close',
				data: {
					adminKey: $rootScope.adminKey,
					uId: $rootScope.uId,
					tId: $scope.tId,
				}
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
		$scope.reOpenTicket = function () {
			$('#btnLoad').button('loading');
			$http({
				method: 'POST',
				url: $rootScope.apiUrl + 'admin/tickets/reopen',
				data: {
					adminKey: $rootScope.adminKey,
					uId: $rootScope.uId,
					tId: $scope.tId,
				}
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
