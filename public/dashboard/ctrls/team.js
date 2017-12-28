angular.module('optimusApp')
    .controller('teamCtrl', function($rootScope, $scope, $http, $stateParams, $state) {
        $rootScope.checkAuth();
        $rootScope.profile = false;
        $rootScope.teamId = $stateParams.teamId;
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.type = ['admin', 'user'];
        $rootScope.getTeamInfo = function() {
            if ($rootScope.teamId) {
                $http({
                        method: 'GET',
                        url: $rootScope.apiUrl + 'team/' + $rootScope.teamId,
                        params: {
                            authKey: $rootScope.authKey
                        }
                    })
                    .then(function(res) {
                        if (res.data.status == true) {
                            $rootScope.teamData = res.data.data;
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
        $rootScope.getTeamInfo();
        $scope.openAddMemberModal = function() {
            if ($rootScope.teamData.conf.block == false) {
                if ($rootScope.teamData.role == 1) {
                    $rootScope.openModal('addMember');
                } else {
                    $rootScope.toast('Info', "You don't have permissions !", "info")
                }
            } else {
                $rootScope.toast('Failed', "Your team is blocked", "error")
            }
        };
        $scope.openAddServerModal = function() {
            if ($rootScope.teamData.role == 1) {
                $rootScope.openModal('addServer');
            } else {
                $rootScope.toast('Info', "You don't have permissions !", "info")
            }
        };
        $scope.addMember = function() {
            $('#btnLoad').button('loading');
            $scope.role = $scope.addMemberForm.role == 'admin' ? 1 : 2;
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'team/addMember/' + $rootScope.teamId,
                    data: {
                        authKey: $rootScope.authKey,
                        email: $scope.addMemberForm.email,
                        role: $scope.role
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.closeModal();
                        $state.reload();
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $scope.delMember = function(x) {
            if (x.email != $rootScope.homeData.email) {
                if (x.role != 1) {
                    swal({
                        title: 'Are you sure?',
                        text: "Proceed to remove user " + x.email,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, remove!'
                    }).then((result) => {
                        if (result) {
                            $http({
                                    method: 'POST',
                                    url: $rootScope.apiUrl + 'team/delMember/' + $rootScope.teamId,
                                    data: {
                                        authKey: $rootScope.authKey,
                                        uId: x._id
                                    }
                                })
                                .then(function(res) {
                                    if (res.data.status == true) {
                                        $rootScope.closeModal();
                                        $state.reload();
                                        $rootScope.toast('Success', res.data.msg, "success");
                                    } else {
                                        $('#btnLoad').button('reset');
                                        $rootScope.toast('Failed', res.data.msg, "error");
                                    }
                                }, function(res) {
                                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                                });
                        }
                    });
                } else {
                    $rootScope.toast('Info', 'You cannot remove a member who is admin !!', "info")
                }
            } else {
                $rootScope.toast('Info', "You cannot remove yourself !", "info");
            }
        };
        $scope.delTeam = function() {
            if ($scope.teamData.role == 1) {
                swal({
                        title: 'Are you sure to delete the team?',
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
                                    url: $rootScope.apiUrl + 'team/delete/' + $rootScope.teamId,
                                    data: {
                                        authKey: $rootScope.authKey
                                    }
                                })
                                .then(function(res) {
                                    if (res.data.status == true) {
                                        $rootScope.closeModal();
                                        $state.go('dashboard.home');
                                        $rootScope.checkAuth(true)
                                        $rootScope.toast('Success', res.data.msg, "success");
                                    } else {
                                        $('#btnLoad').button('reset');
                                        $rootScope.toast('Failed', res.data.msg, "error");
                                    }
                                }, function(res) {
                                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                                });
                        }
                    });
            } else {
                $rootScope.toast('Info', "You don't have permissions !", "info")
            }
        };
        $scope.addServer = function() {
            if ($scope.teamData.role == 1) {
                $('#btnLoad2').button('loading');
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
                            url: $rootScope.apiUrl + 'tserver/m-add/' + $rootScope.teamId,
                            data: $scope.data
                        })
                        .then(function(res) {
                            if (res.data.status == true) {
                                $rootScope.closeModal();
                                $state.reload();
                                $rootScope.toast('Success', res.data.msg, "success");
                            } else {
                                $('#btnLoad2').button('reset');
                                $rootScope.toast('Failed', res.data.msg, "error");
                            }
                        }, function(res) {
                            $('#btnLoad2').button('reset');
                            $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                        });
                } else {
                    Upload.upload({
                            method: 'POST',
                            url: $rootScope.apiUrl + 'tserver/uploadPrivateKey',
                            data: {
                                file: $scope.addServerForm.password
                            }
                        })
                        .then(function(res) {
                            if (res.data.status == true) {
                                $scope.data.file = res.data.file;
                                $http({
                                        method: 'POST',
                                        url: $rootScope.apiUrl + 'tserver/m-add',
                                        data: $scope.data
                                    })
                                    .then(function(res) {
                                        if (res.data.status == true) {
                                            $rootScope.closeModal();
                                            $state.reload();
                                            $rootScope.toast('Success', res.data.msg, "success");
                                        } else {
                                            $('#btnLoad2').button('reset');
                                            $rootScope.toast('Failed', res.data.msg, "error");
                                        }
                                    }, function(res) {
                                        $('#btnLoad2').button('reset');
                                        $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                                    });
                            } else {
                                $('#btnLoad2').button('reset');
                                $rootScope.toast('Failed', res.data.msg, "error");
                            }
                        }, function(res) {
                            $('#btnLoad2').button('reset');
                            $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                        });
                }
            } else {
                $rootScope.toast('Info', "You don't have permissions !", "info")
            }
        };
    });
