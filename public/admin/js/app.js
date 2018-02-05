angular.module("optimusApp", ['angular-loading-bar', 'ui.router', 'oc.lazyLoad'])
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.spinnerTemplate = '<div class="preloader"><img class="icon" src="../img/logo.png" style="width: 64px; height: 64px;"></div>';
    }])
    .filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i = 0; i < total; i++)
                input.push(i);
            return input;
        };
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state("dashboard", {
                url: "",
                templateUrl: "pages/dashboard.html",
                abstract: true
            })
            .state("dashboard.home", {
                url: "/home",
                templateUrl: "pages/home.html",
                controller: "homeCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Home',
                            files: ['./ctrls/home.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.user", {
                url: "/user/:uId",
                templateUrl: "pages/user.html",
                controller: "userCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'User',
                            files: ['./ctrls/user.js']
                        })
                    }]
                }
            })
            .state("dashboard.userPayment", {
                url: "/userPayment/:uId",
                templateUrl: "pages/userPayment.html",
                controller: "userPaymentCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'User Payment',
                            files: ['./ctrls/userPayment.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.userInvoice", {
                url: "/userInvoice/:uId/:iId",
                templateUrl: "pages/userInvoice.html",
                controller: "userInvoiceCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'User Invoice',
                            files: ['./ctrls/userInvoice.js', './plugins/jquery.PrintArea/jquery.PrintArea.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.userActivity", {
                url: "/userActivity/:uId",
                templateUrl: "pages/userActivity.html",
                controller: "userActivityCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'User Activity',
                            files: ['./ctrls/userActivity.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.ticket", {
                url: "/ticket/:uId/:tId/",
                templateUrl: "pages/ticket.html",
                controller: "ticketCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Ticket',
                            files: ['./ctrls/ticket.js']
                        })
                    }]
                }
            })
            .state("dashboard.account", {
                url: "/account",
                templateUrl: "pages/account.html",
                abstract: true
            })
            .state("dashboard.account.editProfile", {
                url: "/editProfile",
                templateUrl: "pages/editProfile.html",
                controller: "editProfileCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'EditProfile',
                            files: ['./ctrls/editProfile.js', './plugins/angular-country-state/angular-country-state.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.account.changePasswordAccount", {
                url: "/changePasswordAccount",
                templateUrl: "pages/changePasswordAccount.html",
                controller: "changePasswordAccountCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'changePasswordAccount',
                            files: ['./ctrls/changePasswordAccount.js']
                        })
                    }]
                }
            })
            .state("dashboard.account.activity", {
                url: "/activity",
                templateUrl: "pages/activity.html",
                controller: "activityCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Activity',
                            files: ['./ctrls/activity.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.staff", {
                url: "/staff",
                templateUrl: "pages/staff.html",
                controller: "staffCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Staff',
                            files: ['./ctrls/staff.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.teams", {
                url: "/teams",
                templateUrl: "pages/teams.html",
                controller: "teamsCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Teams',
                            files: ['./ctrls/teams.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.team", {
                url: "/team/:tId",
                templateUrl: "pages/team.html",
                controller: "teamCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team',
                            files: ['./ctrls/team.js']
                        })
                    }]
                }
            })
            .state("dashboard.teamActivity", {
                url: "/teamActivity/:tId",
                templateUrl: "pages/teamActivity.html",
                controller: "teamActivityCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Activity',
                            files: ['./ctrls/teamActivity.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.system", {
                url: "/system",
                templateUrl: "pages/system.html",
                controller: "systemCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'System',
                            files: ['./ctrls/system.js']
                        })
                    }]
                }
            })
            .state("login", {
                url: "/login",
                templateUrl: "pages/login.html",
                controller: "loginCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Login',
                            files: ['./ctrls/login.js', './css/login-register.css']
                        })
                    }]
                }
            });
    });


// Global Controller
angular.module('optimusApp')
    .controller('globalCtrl', function($scope, $rootScope, $location, $http, $state, $ocLazyLoad) {
        // $rootScope.apiUrl = 'http://localhost:3000/webapi/';
        $rootScope.apiUrl = 'https://optimuscp.io/webapi/';
        $ocLazyLoad.load(['./plugins/sweetalert2/sweetalert2.min.js', './plugins/sweetalert2/sweetalert2.min.css', './plugins/toast/toast.min.js', './plugins/toast/toast.min.css'])
        $rootScope.homeData = {};
        $rootScope.checkAuth = function(force) {
            if (Cookies.get('adminKey')) {
                $rootScope.adminKey = Cookies.get('adminKey');
                if (!$rootScope.signStatus || force) {
                    $http({
                            method: 'GET',
                            url: $rootScope.apiUrl + 'admin',
                            params: {
                                adminKey: $rootScope.adminKey
                            }
                        })
                        .then(function(res) {
                            if (res.data.status == true) {
                                $rootScope.homeData = res.data.data;
                                $rootScope.user = $rootScope.homeData.info;
                                if (!$rootScope.homeData.info.set)
                                    $state.go('dashboard.account.editProfile')
                            } else {
                                $rootScope.logout();
                                $rootScope.toast('Error', res.data.msg, 'error');
                            }
                        }, function(res) {
                            $('#btnLoad').button('reset');
                            $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                        });
                } else if ($rootScope.homeData) {
                    if (!$rootScope.homeData.info.set)
                        $state.go('dashboard.account.editProfile')
                }
                var path = $location.path();
                if (path == '/login')
                    $state.go('dashboard.home');
                $rootScope.signStatus = true;
            } else {
                $rootScope.authKey = '';
                $rootScope.signStatus = false;
                var path = $location.path();
                if (path == '/home' || path == '')
                    $state.go('login');
            }
        };
        $rootScope.logout = function() {
            Cookies.remove('adminKey');
            $http({
                    method: 'GET',
                    url: $rootScope.apiUrl + 'admin/logout',
                    params: {
                        adminKey: $rootScope.adminKey
                    }
                })
                .then(function(res) {
                    delete $rootScope.adminKey;
                    delete $rootScope.homeData;
                    $rootScope.signStatus = false;
                    $rootScope.toast('Success', 'Logged out !!', "info");
                    $state.go('login');
                }, function(res) {
                    $state.go('login');
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $rootScope.openModal = function(x) {
            $('#' + x).modal('show');
        };
        $rootScope.closeModal = function(x) {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
        };
        $rootScope.toast = function(heading, text, status, hideAfter = 10000) {
            // info, warning, error, success
            if (hideAfter == 0) hideAfter = false;
            if (text == 'Account not found !!') {
                text = 'Session ended!!';
                $rootScope.logout();
            }
            $.toast({
                heading: heading,
                text: text,
                position: 'bottom-right',
                loaderBg: '#ff6849',
                icon: status,
                hideAfter: hideAfter,
                stack: 1
            });
        };
    });
