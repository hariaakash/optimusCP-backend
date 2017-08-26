angular.module('optimusApp')
	.controller('metricsCtrl', function ($rootScope, $scope, $http, $stateParams, $state, $window) {
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
							Highcharts.stockChart('container1', {
								title: {
									text: 'Name: ' + $rootScope.serverData.name + ', IP: ' + $rootScope.serverData.ip
								},
								legend: {
									layout: 'vertical',
									align: 'right',
									verticalAlign: 'middle'
								},
								legend: {
									enabled: true,
									itemStyle: {
										color: 'white',
										fontWeight: 'bold',
									}
								},
								subtitle: {
									text: 'Monitored by OptimusCP'
								},
								chart: {
									zoomType: 'x'
								},
								scrollbar: {
									enabled: false
								},
								rangeSelector: {
									buttons: [{
										type: 'hour',
										count: 1,
										text: '1H'
            						}, {
										type: 'day',
										count: 1,
										text: '1D'
            						}, {
										type: 'week',
										count: 1,
										text: '1W'
            						}, {
										type: 'month',
										count: 1,
										text: '1M'
            						}, {
										type: 'all',
										text: 'All'
            						}]
								},
								xAxis: {
									title: {
										text: 'RAM Usage'
									}
								},
								yAxis: {
									title: {
										text: 'Usage in %'
									},
									opposite: false,
									labels: {
										formatter: function () {
											return (this.value > 0 ? ' + ' : '') + this.value + '%';
										}
									},
									plotLines: [{
										value: 0,
										width: 2,
										color: 'silver'
            						}]
								},
								plotOptions: {
									series: {
										compare: 'percent',
										showInNavigator: true
									}
								},
								tooltip: {
									pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
									valueDecimals: 2,
									split: true
								},
								series: [{
									name: 'RAM',
									data: res.data.data.seriesOptions[0].data,
									tooltip: {
										valueDecimals: 2
									},
									compare: 'percent'
        						}],
								credits: {
									enabled: false
								},
								responsive: {
									rules: [{
										condition: {
											maxWidth: 500
										},
										chartOptions: {
											chart: {
												height: 300
											},
											navigator: {
												enabled: false
											}
										}
								}]
								}
							});
							Highcharts.stockChart('container2', {
								title: {
									text: 'Name: ' + $rootScope.serverData.name + ', IP: ' + $rootScope.serverData.ip
								},
								legend: {
									layout: 'vertical',
									align: 'right',
									verticalAlign: 'middle'
								},
								legend: {
									enabled: true,
									itemStyle: {
										color: 'white',
										fontWeight: 'bold',
									}
								},
								subtitle: {
									text: 'Monitored by OptimusCP'
								},
								chart: {
									zoomType: 'x'
								},
								scrollbar: {
									enabled: false
								},
								rangeSelector: {
									buttons: [{
										type: 'hour',
										count: 1,
										text: '1H'
            						}, {
										type: 'day',
										count: 1,
										text: '1D'
            						}, {
										type: 'week',
										count: 1,
										text: '1W'
            						}, {
										type: 'month',
										count: 1,
										text: '1M'
            						}, {
										type: 'all',
										text: 'All'
            						}]
								},
								xAxis: {
									title: {
										text: 'Storage Usage'
									}
								},
								yAxis: {
									title: {
										text: 'Usage in %'
									},
									opposite: false,
									labels: {
										formatter: function () {
											return (this.value > 0 ? ' + ' : '') + this.value + '%';
										}
									},
									plotLines: [{
										value: 0,
										width: 2,
										color: 'silver'
            						}]
								},
								plotOptions: {
									series: {
										compare: 'percent',
										showInNavigator: true
									}
								},
								tooltip: {
									pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
									valueDecimals: 2,
									split: true
								},
								series: [{
									name: 'Storage',
									data: res.data.data.seriesOptions[1].data,
									tooltip: {
										valueDecimals: 2
									},
									compare: 'percent'
        						}],
								credits: {
									enabled: false
								},
								responsive: {
									rules: [{
										condition: {
											maxWidth: 500
										},
										chartOptions: {
											chart: {
												height: 300
											},
											navigator: {
												enabled: false
											}
										}
								}]
								}
							});
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
		$scope.copyEmbedModal = function (x) {
			$('#copyEmbed').modal('show');
			$scope.chart = x;
			$scope.embedCode = '<iframe src="http://localhost/a/#!/embed/' + $rootScope.serverData.id + '/' + $scope.chart + '" width="400" height="300"></iframe>';
		};
		$scope.copySuccess = function () {
			swal("Success", "Code copied to clipboard.", "success");
		};
	});
