angular.module('optimusApp')
	.controller('ticketCtrl', function ($rootScope, $scope, $http, $stateParams, $state) {
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
							$rootScope.toast('Error', res.data.msg, "error");
							$state.go('dashboard.home');
						}
					}, function (res) {
						$rootScope.toast('Failed', "Some error occurred, try again.", "error");
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
					$state.reload();
					$rootScope.checkAuth();
					$rootScope.toast('Success', res.data.msg, "success");
				} else {
					$('#btnLoad').button('reset');
						$rootScope.toast('Error', res.data.msg, "error");
				}
			}, function (res) {
				$rootScope.toast('Failed', "Some error occurred, try again.", "error");
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
					$state.reload();
					$rootScope.checkAuth();
					$rootScope.toast('Success', res.data.msg, "success");
				} else {
					$('#btnLoad').button('reset');
						$rootScope.toast('Error', res.data.msg, "error");
				}
			}, function (res) {
				$rootScope.toast('Failed', "Some error occurred, try again.", "error");
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
					$state.reload();
					$rootScope.checkAuth();
					$rootScope.toast('Success', res.data.msg, "success");
				} else {
					$('#btnLoad').button('reset');
						$rootScope.toast('Error', res.data.msg, "error");
				}
			}, function (res) {
				$rootScope.toast('Failed', "Some error occurred, try again.", "error");
			});
		};
	});
