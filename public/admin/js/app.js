angular.module("optimusApp", ['angular-loading-bar', 'ui.router', 'oc.lazyLoad'])
	.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
		cfpLoadingBarProvider.spinnerTemplate = '<div class="preloader"><img class="icon" src="./images/logo.png" style="width: 64px; height: 64px;"></div>';
  	}])
	.filter('range', function () {
		return function (input, total) {
			total = parseInt(total);
			for (var i = 0; i < total; i++)
				input.push(i);
			return input;
		};
	})
	.config(function ($stateProvider, $urlRouterProvider) {
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
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
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'User',
							files: ['./ctrls/user.js']
						})
    				}]
				}
			})
			.state("dashboard.ticket", {
				url: "/ticket/:uId/:tId/",
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
			.state("dashboard.admin", {
				url: "/admin",
				templateUrl: "pages/admin.html",
				controller: "adminCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Admin',
							files: ['./ctrls/admin.js', './plugins/pagination/dirPagination.js']
						})
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
			});
	});


// Global Controller
angular.module('optimusApp')
	.controller('globalCtrl', function ($scope, $rootScope, $location, $http, $state, $ocLazyLoad) {
		//		$rootScope.apiUrl = 'http://localhost:3000/';
		$rootScope.apiUrl = 'https://optimuscp.io/webapi/';
		$ocLazyLoad.load(['./plugins/sweetalert2/sweetalert2.min.js', './plugins/sweetalert2/sweetalert2.min.css', './plugins/toast/toast.min.js', './plugins/toast/toast.min.css'])
		$rootScope.homeData = {};
		$rootScope.checkAuth = function () {
			if (Cookies.get('adminKey')) {
				$rootScope.adminKey = Cookies.get('adminKey');
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'admin',
						params: {
							adminKey: $rootScope.adminKey
						}
					})
					.then(function (res) {
						console.log(res.data)
						if (res.data.status == true) {
							$rootScope.homeData = res.data.data;
							console.log($rootScope.homeData);
							$rootScope.user = $rootScope.homeData.info;
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
		$rootScope.logout = function () {
			Cookies.remove('adminKey');
			$http({
					method: 'GET',
					url: $rootScope.apiUrl + 'admin/logout',
					params: {
						adminKey: $rootScope.adminKey
					}
				})
				.then(function (res) {
					$state.go('login');
					$rootScope.adminKey = '';
				}, function (res) {
					$state.go('login');
					swal("Fail", "Some error occurred, try again.", "error");
				});
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
