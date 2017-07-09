angular.module("optimusApp", ['ui.router', 'oc.lazyLoad'])
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
							files: ['./ctrls/manage.js', './plugins/highcharts/highstock.js']
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
			.state("dashboard.account", {
				url: "/account",
				templateUrl: "pages/account.html",
				controller: "accountCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/account.js');
    				}]
				}
			})
			.state("register", {
				url: "/register",
				templateUrl: "pages/register.html",
				controller: "registerCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/register.js');
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
						return $ocLazyLoad.load('./ctrls/login.js');
    				}]
				}
			});
	});


// Global Controller
angular.module('optimusApp')
	.controller('globalCtrl', function ($scope, $rootScope, $location, $http, $state) {
		//		$rootScope.apiUrl = 'https://optimus-hariaakash.rhcloud.com/';
		$rootScope.apiUrl = 'http://localhost:3000/';
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
	});
