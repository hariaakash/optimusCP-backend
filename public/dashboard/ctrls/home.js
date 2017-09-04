angular.module('optimusApp')
	.controller('homeCtrl', function ($rootScope, $scope, $location, $http, $window, $timeout, Upload) {
		$rootScope.checkAuth();
		$scope.addServer = function () {
			$('#btnLoad').button('loading');
			$scope.data = {
				authKey: $rootScope.authKey,
				ip: $scope.addServerForm.ip,
				port: $scope.addServerForm.port,
				uname: $scope.addServerForm.uname,
				name: $scope.addServerForm.name,
				authType: $scope.addServerForm.authType
			};
			if ($scope.addServerForm.authType == 1) {
				$scope.data.password = $scope.addServerForm.password;
				$http({
						method: 'POST',
						url: $rootScope.apiUrl + 'server/m-add',
						data: $scope.data
					})
					.then(function (res) {
						if (res.data.status == true) {
							swal({
									title: 'Success',
									text: res.data.msg,
									type: 'success',
									showConfirmButton: true
								})
								.then(function () {
									$window.location.reload();
								});
						} else {
							$('#btnLoad').button('reset');
							swal({
								title: 'Failed',
								text: res.data.msg,
								type: 'error',
								showConfirmButton: true
							});
						}
					}, function (res) {
						$('#btnLoad').button('reset');
						swal("Fail", "Some error occurred, try again.", "error");
					});
			} else
				Upload.upload({
					method: 'POST',
					url: $rootScope.apiUrl + 'server/uploadPrivateKey',
					data: {
						file: $scope.addServerForm.password
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						$scope.data.file = res.data.file;
						$http({
								method: 'POST',
								url: $rootScope.apiUrl + 'server/m-add',
								data: $scope.data
							})
							.then(function (res) {
								if (res.data.status == true) {
									swal({
											title: 'Success',
											text: res.data.msg,
											type: 'success',
											showConfirmButton: true
										})
										.then(function () {
											$window.location.reload();
										});
								} else {
									$('#btnLoad').button('reset');
									swal({
										title: 'Failed',
										text: res.data.msg,
										type: 'error',
										showConfirmButton: true
									});
								}
							}, function (res) {
								$('#btnLoad').button('reset');
								swal("Fail", "Some error occurred, try again.", "error");
							});
					} else {
						$('#btnLoad').button('reset');
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							showConfirmButton: true
						});
					}
				}, function (res) {
					$('#btnLoad').button('reset');
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
	});
