angular.module('optimusApp')
	.controller('teamCtrl', function ($rootScope, $location, $http, $scope, $state, $window) {
		$rootScope.checkAuth();
		$scope.getTeamInfo = function () {
			$http({
					method: 'GET',
					url: $rootScope.apiUrl + 'team',
					params: {
						authKey: $rootScope.authKey
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						$rootScope.teamData = res.data.data;
						console.log($rootScope.teamData)
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
		};
		$scope.getTeamInfo();
		$scope.createTeam = function () {
			$('#btnLoad').button('loading');
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'team/create',
					data: {
						authKey: $rootScope.authKey,
						tName: $scope.tName
					}
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
