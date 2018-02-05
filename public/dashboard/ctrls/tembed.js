angular.module('optimusApp')
    .controller('tembedCtrl', function($rootScope, $scope, $http, $stateParams, $state, $window) {
        $scope.serverId = $stateParams.serverId;
        $scope.chart = $stateParams.chart;
        $scope.getServerInfo = function() {
            if ($scope.serverId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'tserver/embed',
                        params: {
                            serverId: $scope.serverId
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $scope.serverData = res.data.data;
                            Highcharts.stockChart('container1', {
                                title: {
                                    text: 'IP: ' + $scope.serverData.ip
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
                                    text: 'Monitored by OptimusCP.io'
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
                                    }],
                                    selected: 0
                                },
                                xAxis: {
                                    title: {
                                        text: 'RAM & Storage Usage'
                                    }
                                },
                                yAxis: {
                                    title: {
                                        text: 'Usage in %'
                                    },
                                    opposite: false,
                                    labels: {
                                        formatter: function() {
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
                                series: res.data.data.seriesOptions,
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
                                    text: 'IP: ' + $scope.serverData.ip
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
                                    text: 'Monitored by OptimusCP.io'
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
                                        formatter: function() {
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
                            Highcharts.stockChart('container3', {
                                title: {
                                    text: 'IP: ' + $scope.serverData.ip
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
                                    text: 'Monitored by OptimusCP.io'
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
                                        formatter: function() {
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
                            Highcharts.stockChart('container4', {
                                title: {
                                    text: 'IP: ' + $scope.serverData.ip
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
                                    text: 'Monitored by OptimusCP.io'
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
                                        text: 'CPU Usage'
                                    }
                                },
                                yAxis: {
                                    title: {
                                        text: 'Usage in %'
                                    },
                                    opposite: false,
                                    labels: {
                                        formatter: function() {
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
                                    name: 'CPU',
                                    data: res.data.data.seriesOptions[2].data,
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
                            $rootScope.toast('Failed', res.data.msg, "error");
                            $state.go('dashboard.home');
                        }
                    }, function(res) {
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            } else {
                $state.go('dashboard.home');
            }
        };
        $scope.getServerInfo();
    });
