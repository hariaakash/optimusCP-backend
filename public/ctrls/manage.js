angular.module('optimusApp')
	.controller('manageCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window) {
		$rootScope.checkAuth();
		$scope.serverId = $stateParams.serverId;
		$scope.getServerInfo = function () {
			if ($scope.serverId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'server/m-det',
						params: {
							authKey: $rootScope.authKey,
							serverId: $scope.serverId
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.serverData = res.data.data;
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
		$scope.delServer = function () {
			swal({
				title: 'Enter "DELETE" to remove this server',
				input: 'text',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				showLoaderOnConfirm: true,
				preConfirm: function (req) {
					return new Promise(function (resolve, reject) {
						if (req === 'DELETE' || req === 'delete') {
							$http({
								method: 'POST',
								url: $rootScope.apiUrl + 'server/m-remove',
								data: {
									authKey: $rootScope.authKey,
									serverId: $scope.serverId
								}
							}).then(function (res) {
								if (res.data.status == true) {
									swal({
										title: 'Success',
										text: res.data.msg,
										type: 'success',
										showConfirmButton: true
									}).then(function () {
										$state.go('dashboard.home');
									});
								} else {
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
						} else {
							reject('You should enter "DELETE".')
						}
					});
				},
				allowOutsideClick: false
			});
		};
		$scope.exec = function (cmd) {
			$scope.data = {};
			$scope.submit = function () {
				$scope.data.authKey = $rootScope.authKey;
				$scope.data.serverId = $scope.serverId;
				$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'server/exec',
					data: $scope.data
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
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							showConfirmButton: true
						});
					}
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
				});
			};
			$scope.cmd = cmd;
			switch ($scope.cmd) {
				case 1:
				case 3:
					$scope.title = $scope.cmd == 1 ? 'Proceed to restart ?' : 'Proceed to update ?';
					swal({
						title: $scope.title,
						showCancelButton: true,
						confirmButtonText: 'Confirm',
						showLoaderOnConfirm: true,
						preConfirm: function () {
							return new Promise(function (resolve, reject) {
								$scope.data.cmd = $scope.cmd;
								$scope.submit();
							});
						},
						allowOutsideClick: false
					});
					break;
				case 2:
					swal({
						title: 'Enter new hostname',
						input: 'text',
						showCancelButton: true,
						confirmButtonText: 'Confirm',
						showLoaderOnConfirm: true,
						preConfirm: function (req) {
							return new Promise(function (resolve, reject) {
								if (req) {
									$scope.data.hname = req;
									$scope.data.cmd = $scope.cmd;
									$scope.submit();
								}
							});
						},
						allowOutsideClick: false
					});
					break;
				case 4:
					swal({
						title: 'Enter new password',
						input: 'password',
						showCancelButton: true,
						confirmButtonText: 'Confirm',
						showLoaderOnConfirm: true,
						preConfirm: function (req) {
							return new Promise(function (resolve, reject) {
								if (req.length >= 8) {
									$scope.data.password = req;
									$scope.data.cmd = $scope.cmd;
									$scope.submit();
								} else {
									reject('Password should be atleast of length 8');
								}
							});
						},
						allowOutsideClick: false
					});
					break;
				case 6:
					swal({
						title: 'Proceed to install LAMP Stack ?',
						showCancelButton: true,
						confirmButtonText: 'Confirm',
						showLoaderOnConfirm: true,
						preConfirm: function () {
							return new Promise(function (resolve, reject) {
								$scope.data.cmd = $scope.cmd;
								$scope.submit();
							});
						},
						allowOutsideClick: false
					});
					break;
				default:
					break;
			};
		};
		$scope.changeName = function () {
			swal({
				title: 'Enter new name for this server',
				input: 'text',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				showLoaderOnConfirm: true,
				preConfirm: function (req) {
					return new Promise(function (resolve, reject) {
						if (req) {
							$http({
								method: 'POST',
								url: $rootScope.apiUrl + 'server/m-name',
								data: {
									authKey: $rootScope.authKey,
									serverId: $scope.serverId,
									name: req
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
						} else {
							reject('You should enter "DELETE".')
						}
					});
				},
				allowOutsideClick: false
			});
		};
	});
