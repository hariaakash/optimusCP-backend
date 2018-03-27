angular.module('optimusApp')
    .controller('tmanageCtrl', function($rootScope, $scope, $http, $stateParams, $state, $window, $interval) {
        $rootScope.checkAuth();
        $rootScope.profile = false;
        $scope.serverId = $stateParams.serverId;
        $rootScope.teamId = $stateParams.teamId;
        $scope.intervals = [{
                name: "5 m",
                val: 5 * 60 * 1000
            },
            {
                name: "10 m",
                val: 10 * 60 * 1000
            },
            {
                name: "30 m",
                val: 30 * 60 * 1000
            },
            {
                name: "1 h",
                val: 60 * 60 * 1000
            }
        ];
        $scope.getServerInfo = function() {
            if ($scope.serverId && $rootScope.teamId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'tserver/m-det/' + $rootScope.teamId,
                        params: {
                            authKey: $rootScope.authKey,
                            serverId: $scope.serverId
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $rootScope.serverData = res.data.data;
                            if (!$rootScope.serverData.monitorLogs.isReachable)
                                $('.blockUI').block({
                                    message: '<p style="margin:0;padding:8px;font-size:24px;">Your Server is DOWN ..</p>',
                                    css: {
                                        color: '#fff',
                                        border: '1px solid #fb9678',
                                        backgroundColor: '#fb9678'
                                    }
                                });
                            $scope.tick = function() {
                                $scope.time = parseInt(((new Date($rootScope.serverData.msgboard.date).getTime() + $rootScope.serverData.msgboard.time) - Date.now()) / 1000);
                                if ($scope.time == 0)
                                    $state.reload();
                            };
                            $scope.msgboardStatus = (Date.now() - new Date($rootScope.serverData.msgboard.date).getTime()) < $rootScope.serverData.msgboard.time ? true : false;
                            if ($scope.msgboardStatus) $interval($scope.tick, 1000);
                            $scope.embedCode = '<iframe src="https://optimuscp.io/dashboard/#!/tembed/' + $rootScope.serverData.id + '/1" width="400" height="300"></iframe>';
                            Highcharts.stockChart('container', {
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
        $scope.delServer = function() {
            if ($rootScope.homeData.teams[$rootScope.teamIndex].role == 1) {
                swal({
                        title: 'Are you sure to remove the server?',
                        text: "This action can't be reverted !!",
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, remove!'
                    })
                    .then((result) => {
                        if (result) {
                            $http({
                                method: 'POST',
                                url: $rootScope.apiUrl + 'tserver/m-remove/' + $rootScope.teamId,
                                data: {
                                    authKey: $rootScope.authKey,
                                    serverId: $scope.serverId
                                }
                            }).then(function(res) {
                                if (res.data.status == true) {
                                    $state.go('dashboard.team', {
                                        teamId: $rootScope.teamId
                                    });
                                    $rootScope.checkAuth(true);
                                    $rootScope.toast('Success', res.data.msg, "success");
                                } else {
                                    $rootScope.toast('Failed', res.data.msg, "error");
                                }
                            }, function(res) {
                                $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                            });
                        }
                    }).catch(swal.noop);
            } else {
                $rootScope.toast('Info', "You don't have permissions !", "info")
            }
        };
        $scope.exec = function(cmd) {
            $scope.data = {};
            $scope.submit = function() {
                $scope.data.authKey = $rootScope.authKey;
                $scope.data.serverId = $scope.serverId;
                $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'tserver/exec/' + $rootScope.teamId,
                    data: $scope.data
                }).then(function(res) {
                    if (res.data.status == true) {
                        $state.reload();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
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
                        preConfirm: function() {
                            return new Promise(function(resolve, reject) {
                                $scope.data.cmd = $scope.cmd;
                                resolve()
                                $scope.submit();
                            });
                        },
                        allowOutsideClick: false
                    }).catch(swal.noop);
                    break;
                case 2:
                    swal({
                        title: 'Enter new hostname',
                        input: 'text',
                        showCancelButton: true,
                        confirmButtonText: 'Confirm',
                        showLoaderOnConfirm: true,
                        preConfirm: function(req) {
                            return new Promise(function(resolve, reject) {
                                if (req) {
                                    $scope.data.hname = req;
                                    $scope.data.cmd = $scope.cmd;
                                    resolve()
                                    $scope.submit();
                                }
                            });
                        },
                        allowOutsideClick: false
                    }).catch(swal.noop);
                    break;
                default:
                    break;
            };
        };
        $scope.stack = function(stack) {
            $scope.data = {};
            $scope.submit = function() {
                $scope.data.authKey = $rootScope.authKey;
                $scope.data.serverId = $scope.serverId;
                $http({
                        method: 'POST',
                        url: $rootScope.apiUrl + 'tserver/stack/' + $rootScope.teamId,
                        data: $scope.data
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $state.reload();
                            $rootScope.toast('Success', res.data.msg, "success");
                        } else {
                            $rootScope.toast('Failed', res.data.msg, "error");
                        }
                    }, function(res) {
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            };
            $scope.stack = stack;
            if ($scope.stack == 1)
                $scope.title = 'LAMP';
            else if ($scope.stack == 2)
                $scope.title = 'MEAN';
            else if ($scope.stack == 3)
                $scope.title = 'Django';
            else if($scope.stack == 4)
                $scope.title = 'Ruby on Rails';
            else
                $scope.title = 'Tensorflow';
            swal({
                title: 'Proceed to install ' + $scope.title + ' ?',
                showCancelButton: true,
                confirmButtonText: 'Confirm',
                showLoaderOnConfirm: true,
                preConfirm: function() {
                    return new Promise(function(resolve, reject) {
                        $scope.data.stack = $scope.stack;
                        resolve()
                        $scope.submit();
                    });
                },
                allowOutsideClick: false
            }).catch(swal.noop);
        };
        $scope.changeName = function() {
            swal({
                title: 'Enter new name for this server',
                input: 'text',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                preConfirm: (req) => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve()
                        }, 2000)
                    })
                },
                allowOutsideClick: false
            }).then((req) => {
                $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'tserver/m-name/' + $rootScope.teamId,
                    data: {
                        authKey: $rootScope.authKey,
                        serverId: $scope.serverId,
                        name: req
                    }
                }).then(function(res) {
                    if (res.data.status == true) {
                        $state.reload();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
            }).catch(swal.noop);
        };
        $scope.enableAlert = function(x, val, interval) {
            if (val > 30 && val < 100) {
                $http({
                        method: 'POST',
                        url: $rootScope.apiUrl + 'tserver/enableAlert/' + $rootScope.teamId,
                        data: {
                            authKey: $rootScope.authKey,
                            serverId: $scope.serverId,
                            type: x,
                            interval: interval,
                            val: val
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $state.reload();
                            $rootScope.toast('Success', res.data.msg, "success");
                        } else {
                            $rootScope.toast('Failed', res.data.msg, "error");
                        }
                    }, function(res) {
                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                    });
            } else {
                $rootScope.toast('Failed', "Value should be between 30 & 100.", "error");
            }
        };
        $scope.disableAlert = function(x) {
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'tserver/disableAlert/' + $rootScope.teamId,
                    data: {
                        authKey: $rootScope.authKey,
                        serverId: $scope.serverId,
                        type: x
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $state.reload();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.copySuccess = function() {
            $rootScope.toast("Success", "Code copied to clipboard.", "info");
        };
    });
