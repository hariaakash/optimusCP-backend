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
                            name: 'HomePage',
                            files: ['./ctrls/home.js', './plugins/ng-file-upload/ng-file-upload.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.manage", {
                url: "/manage/:serverId",
                templateUrl: "pages/manage.html",
                controller: "manageCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Server Manage',
                            files: ['./ctrls/manage.js', './plugins/highcharts/highstock.js', './plugins/blockUI/jquery.blockUI.min.js', './plugins/angular-clipboard/angular-clipboard.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.terminal", {
                url: "/terminal/:serverId/",
                templateUrl: "pages/terminal.html",
                controller: "terminalCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Server Terminal',
                            files: ['./ctrls/terminal.js']
                        })
                    }]
                }
            })
            .state("dashboard.fileManager", {
                url: "/fileManager/:serverId/",
                templateUrl: "pages/fileManager.html",
                controller: "fileManagerCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Server File Manager',
                            files: ['./ctrls/fileManager.js']
                        })
                    }]
                }
            })
            .state("dashboard.cron", {
                url: "/cron/:serverId/",
                templateUrl: "pages/cron.html",
                controller: "cronCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Server Cron',
                            files: ['./ctrls/cron.js', './plugins/cron-gen/cron-gen.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.startupScript", {
                url: "/startupScript/:serverId/",
                templateUrl: "pages/startupScript.html",
                controller: "startupScriptCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        name: 'Server StartupScript'
                        return $ocLazyLoad.load('./ctrls/startupScript.js');
                    }]
                }
            })
            .state("dashboard.metrics", {
                url: "/metrics/:serverId/",
                templateUrl: "pages/metrics.html",
                controller: "metricsCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Server Metrics',
                            files: ['./ctrls/metrics.js', './plugins/highcharts/highstock.js', './plugins/angular-clipboard/angular-clipboard.min.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.serverActivity", {
                url: "/serverActivity/:serverId/",
                templateUrl: "pages/serverActivity.html",
                controller: "serverActivityCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Server Activity',
                            files: ['./ctrls/serverActivity.js', './plugins/pagination/dirPagination.js']
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
            .state("dashboard.billing", {
                url: "/billing",
                templateUrl: "pages/billing.html",
                abstract: true
            })
            .state("dashboard.billing.addCredit", {
                url: "/addCredit",
                templateUrl: "pages/addCredit.html",
                controller: "addCreditCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Add Credit',
                            files: ['./ctrls/addCredit.js']
                        })
                    }]
                }
            })
            .state("dashboard.billing.history", {
                url: "/history",
                templateUrl: "pages/history.html",
                controller: "historyCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'History',
                            files: ['./ctrls/history.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.invoice", {
                url: "/invoice/:invoiceId",
                templateUrl: "pages/invoice.html",
                controller: "invoiceCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Invoice',
                            files: ['./ctrls/invoice.js', './plugins/jquery.PrintArea/jquery.PrintArea.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.billing.processPayment", {
                url: "/processPayment",
                templateUrl: "pages/processPayment.html",
                controller: "processPaymentCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Process Payment',
                            files: ['./ctrls/processPayment.js']
                        })
                    }]
                }
            })
            .state("dashboard.team", {
                url: "/team/:teamId/",
                templateUrl: "pages/team.html",
                controller: "teamCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team',
                            files: ['./ctrls/team.js', './plugins/ng-file-upload/ng-file-upload.min.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.tapi", {
                url: "/tapi/:teamId",
                templateUrl: "pages/tapi.html",
                controller: "tapiCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Api',
                            files: ['./ctrls/tapi.js', './plugins/angular-clipboard/angular-clipboard.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.tmanage", {
                url: "/tmanage/:teamId/:serverId",
                templateUrl: "pages/tmanage.html",
                controller: "tmanageCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Server Manage',
                            files: ['./ctrls/tmanage.js', './plugins/highcharts/highstock.js', './plugins/blockUI/jquery.blockUI.min.js', './plugins/angular-clipboard/angular-clipboard.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.tterminal", {
                url: "/tterminal/:teamId/:serverId/",
                templateUrl: "pages/tterminal.html",
                controller: "tterminalCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Server Terminal',
                            files: ['./ctrls/tterminal.js']
                        })
                    }]
                }
            }).state("dashboard.tfileManager", {
                url: "/tfileManager/:teamId/:serverId/",
                templateUrl: "pages/tfileManager.html",
                controller: "tfileManagerCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Server File Manager',
                            files: ['./ctrls/tfileManager.js']
                        })
                    }]
                }
            })
            .state("dashboard.tcron", {
                url: "/tcron/:teamId/:serverId/",
                templateUrl: "pages/tcron.html",
                controller: "tcronCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Server Cron',
                            files: ['./ctrls/tcron.js', './plugins/cron-gen/cron-gen.min.js']
                        })
                    }]
                }
            })
            .state("dashboard.tstartupScript", {
                url: "/tstartupScript/:teamId/:serverId/",
                templateUrl: "pages/tstartupScript.html",
                controller: "tstartupScriptCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        name: 'Team Server StartupScript'
                        return $ocLazyLoad.load('./ctrls/tstartupScript.js');
                    }]
                }
            })
            .state("dashboard.tmetrics", {
                url: "/tmetrics/:teamId/:serverId/",
                templateUrl: "pages/tmetrics.html",
                controller: "tmetricsCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Server Metrics',
                            files: ['./ctrls/tmetrics.js', './plugins/highcharts/highstock.js', './plugins/angular-clipboard/angular-clipboard.min.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            }).state("dashboard.tserverActivity", {
                url: "/tserverActivity/:teamId/:serverId/",
                templateUrl: "pages/tserverActivity.html",
                controller: "tserverActivityCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Server Activity',
                            files: ['./ctrls/tserverActivity.js', './plugins/pagination/dirPagination.js']
                        })
                    }]
                }
            })
            .state("dashboard.support", {
                url: "/support",
                templateUrl: "pages/support.html",
                controller: "supportCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Support',
                            files: ['./ctrls/support.js']
                        })
                    }]
                }
            })
            .state("dashboard.ticket", {
                url: "/ticket/:tId/",
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
            .state("dashboard.api", {
                url: "/api",
                templateUrl: "pages/api.html",
                controller: "apiCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Api',
                            files: ['./ctrls/api.js', './plugins/angular-clipboard/angular-clipboard.min.js']
                        })
                    }]
                }
            })
            .state("register", {
                url: "/register",
                templateUrl: "pages/register.html",
                controller: "registerCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Register',
                            files: ['./ctrls/register.js', './css/login-register.css']
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
            })
            .state("verifyEmail", {
                url: "/verifyEmail?email&key",
                templateUrl: "pages/verifyEmail.html",
                controller: "verifyEmailCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load('./ctrls/verifyEmail.js');
                    }]
                }
            })
            .state("sendEmailVerification", {
                url: "/sendEmailVerification",
                templateUrl: "pages/sendEmailVerification.html",
                controller: "sendEmailVerificationCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load('./ctrls/sendEmailVerification.js');
                    }]
                }
            })
            .state("forgotPassword", {
                url: "/forgotPassword",
                templateUrl: "pages/forgotPassword.html",
                controller: "forgotPasswordCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load('./ctrls/forgotPassword.js');
                    }]
                }
            })
            .state("changePassword", {
                url: "/changePassword?email&key",
                templateUrl: "pages/changePassword.html",
                controller: "changePasswordCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load('./ctrls/changePassword.js');
                    }]
                }
            })
            .state("embed", {
                url: "/embed/:serverId/:chart",
                templateUrl: "pages/embed.html",
                controller: "embedCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Embed',
                            files: ['./ctrls/embed.js', './plugins/highcharts/highstock.js']
                        })
                    }]
                }
            })
            .state("tembed", {
                url: "/tembed/:serverId/:chart",
                templateUrl: "pages/tembed.html",
                controller: "tembedCtrl",
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'Team Embed',
                            files: ['./ctrls/tembed.js', './plugins/highcharts/highstock.js']
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
        $ocLazyLoad.load(['./plugins/sweetalert2/sweetalert2.min.js', './plugins/sweetalert2/sweetalert2.min.css', './plugins/toast/toast.min.js', './plugins/toast/toast.min.css']);
        $rootScope.checkAuth = function(force) {
            if (Cookies.get('authKey')) {
                $rootScope.authKey = Cookies.get('authKey');
                if (!$rootScope.signStatus || force) {
                    $http({
                            method: 'GET',
                            url: $rootScope.apiUrl + 'user',
                            params: {
                                authKey: $rootScope.authKey
                            }
                        })
                        .then(function(res) {
                            if (res.data.status == true) {
                                $rootScope.homeData = res.data.data;
                                $rootScope.teamIndex = $rootScope.homeData.teams.findIndex(x => x._id == $rootScope.teamId);
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
                    if (!$rootScope.homeData.info.set) {
                        $state.go('dashboard.account.editProfile')
                    } else {
                        $rootScope.teamIndex = $rootScope.homeData.teams.findIndex(x => x._id == $rootScope.teamId);
                    }
                }
                var path = $location.path();
                if (path == '/login' || path == '/register' || path == '/verifyEmail')
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
        $rootScope.logout = function(x) {
            Cookies.remove('authKey');
            delete $rootScope.authKey;
            $rootScope.signStatus = false;
            if (x) $rootScope.toast('Success', 'Logged out !!', "info");
            $state.go('login');
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
                $rootScope.logout(false);
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
        $rootScope.createTeam = function(x) {
            $('#btnLoad').button('loading');
            $http({
                    method: 'POST',
                    url: $rootScope.apiUrl + 'team/create',
                    data: {
                        authKey: $rootScope.authKey,
                        tName: x
                    }
                })
                .then(function(res) {
                    if (res.data.status == true) {
                        $rootScope.closeModal();
                        $state.reload();
                        $rootScope.checkAuth(true);
                        $rootScope.toast('Success', res.data.msg, "success");
                    } else {
                        $('#btnLoad').button('reset');
                        $rootScope.toast('Failed', res.data.msg, "error");
                    }
                }, function(res) {
                    $rootScope.toast('Failed', "Some error occurred, try again.", "error");
                });
        };
        $rootScope.comingSoon = function () {
            $rootScope.toast('Alert', "This feature will be available soon.", "success");
        };
    });
