angular.module('optimusApp')
	.controller('ticketCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window) {
		$rootScope.checkAuth();
		$scope.tId = $stateParams.tId;
		$scope.getTicketInfo = function () {
			if ($scope.tId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'user/tickets/' + $scope.tId,
						params: {
							authKey: $rootScope.authKey
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
				url: $rootScope.apiUrl + 'user/tickets/msg',
				data: {
					authKey: $rootScope.authKey,
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
				url: $rootScope.apiUrl + 'user/tickets/close',
				data: {
					authKey: $rootScope.authKey,
					tId: $scope.tId
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
				url: $rootScope.apiUrl + 'user/tickets/reopen',
				data: {
					authKey: $rootScope.authKey,
					tId: $scope.tId
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
