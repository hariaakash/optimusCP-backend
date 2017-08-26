angular.module("optimusApp", ['ui.router', 'oc.lazyLoad'])
	.filter('range', function () {
		return function (input, total) {
			total = parseInt(total);
			for (var i = 0; i < total; i++)
				input.push(i);
			return input;
		};
	})
	.config(function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/home');
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/home.js');
    				}]
				}
			})
			.state("dashboard.manage", {
				url: "/manage/:serverId",
				templateUrl: "pages/manage.html",
				controller: "manageCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Manage',
							files: ['./ctrls/manage.js', './plugins/highcharts/highstock.js', './plugins/blockUI/jquery.blockUI.min.js', './plugins/cron-gen/cron-gen.min.js', './plugins/angular-clipboard/angular-clipboard.min.js']
						})
    				}]
				}
			})
			.state("dashboard.terminal", {
				url: "/terminal/:serverId/",
				templateUrl: "pages/terminal.html",
				controller: "terminalCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/terminal.js');
    				}]
				}
			})
			.state("dashboard.cron", {
				url: "/cron/:serverId/",
				templateUrl: "pages/cron.html",
				controller: "cronCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Cron',
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/startupScript.js');
    				}]
				}
			})
			.state("dashboard.metrics", {
				url: "/metrics/:serverId/",
				templateUrl: "pages/metrics.html",
				controller: "metricsCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Metrics',
							files: ['./ctrls/metrics.js', './plugins/highcharts/highstock.js', './plugins/blockUI/jquery.blockUI.min.js', './plugins/cron-gen/cron-gen.min.js', './plugins/angular-clipboard/angular-clipboard.min.js']
						})
    				}]
				}
			})
			.state("dashboard.team", {
				url: "/team",
				templateUrl: "pages/team.html",
				controller: "teamCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/team.js');
    				}]
				}
			})
			.state("dashboard.viewTeam", {
				url: "/team/:teamId",
				templateUrl: "pages/viewTeam.html",
				controller: "viewTeamCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Manage',
							files: ['./ctrls/viewTeam.js']
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'changePasswordAccount',
							files: ['./ctrls/changePasswordAccount.js']
						})
    				}]
				}
			})
			.state("dashboard.support", {
				url: "/support",
				templateUrl: "pages/support.html",
				controller: "supportCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Register',
							files: ['./ctrls/register.js', './css/login-register.css']
						})
					}]
				}
			})
			.state("verifyEmail", {
				url: "/verifyEmail?email&key",
				templateUrl: "pages/verifyEmail.html",
				controller: "verifyEmailCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/verifyEmail.js');
    				}]
				}
			})
			.state("sendEmailVerification", {
				url: "/sendEmailVerification",
				templateUrl: "pages/sendEmailVerification.html",
				controller: "sendEmailVerificationCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/sendEmailVerification.js');
    				}]
				}
			})
			.state("forgotPassword", {
				url: "/forgotPassword",
				templateUrl: "pages/forgotPassword.html",
				controller: "forgotPasswordCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/forgotPassword.js');
    				}]
				}
			})
			.state("changePassword", {
				url: "/changePassword?email&key",
				templateUrl: "pages/changePassword.html",
				controller: "changePasswordCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/changePassword.js');
    				}]
				}
			})
			.state("login", {
				url: "/login",
				templateUrl: "pages/login.html",
				controller: "loginCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Login',
							files: ['./ctrls/login.js', './css/login-register.css']
						})
					}]
				}
			})
			.state("embed", {
				url: "/embed/:serverId/:chart",
				templateUrl: "pages/embed.html",
				controller: "embedCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Embed',
							files: ['./ctrls/embed.js', './plugins/highcharts/highstock.js']
						})
    				}]
				}
			});
	});


// Global Controller
angular.module('optimusApp')
	.controller('globalCtrl', function ($scope, $rootScope, $location, $http, $state, $ocLazyLoad) {
		//		$rootScope.apiUrl = 'https://optimus-hariaakash.rhcloud.com/';
		$rootScope.apiUrl = 'http://localhost:3000/';
		$ocLazyLoad.load(['./plugins/sweetalert2/sweetalert2.min.js', './plugins/sweetalert2/sweetalert2.min.css', './plugins/toast/toast.min.js', './plugins/toast/toast.min.css'])
		$rootScope.checkAuth = function () {
			if (Cookies.get('authKey')) {
				$rootScope.authKey = Cookies.get('authKey');
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'user',
						params: {
							authKey: $rootScope.authKey
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.homeData = res.data.data;
							console.log($rootScope.homeData)
							if (!$rootScope.homeData.info.set)
								$state.go('dashboard.account.editProfile')
						} else {
							$rootScope.logout();
							swal({
								title: 'Failed',
								text: res.data.msg,
								type: 'error',
								timer: 2000,
								showConfirmButton: true
							});
						}
					}, function (res) {
						$('#btnLoad').button('reset');
						swal("Fail", "Some error occurred, try again.", "error");
					});
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
		$rootScope.logout = function () {
			Cookies.remove('authKey');
			$state.go('login');
		};
		$rootScope.openModal = function (x) {
			$('#' + x).modal('show');
		};
		$rootScope.toast = function (heading, text, status) {
			$.toast({
				heading: heading,
				text: text,
				position: 'top-right',
				loaderBg: '#ff6849',
				icon: status,
				hideAfter: 5000,
				stack: 6
			});
		};
	});
