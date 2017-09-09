(function () {
	'use strict';

	angular
		.module('app', ['ngRoute'])
		.config(config)
		.run(run);

	config.$inject = ['$routeProvider'];
	function config($routeProvider) {
		$routeProvider
			.when('/', {
				controller: 'HomeController',
				templateUrl: 'home/home.view.html',
				controllerAs: 'vm'
			})

			.when('/login', {
				controller: 'LoginController',
				templateUrl: 'login/login.view.html',
				controllerAs: 'vm'
			})

			.when('/register', {
				controller: 'RegisterController',
				templateUrl: 'register/register.view.html',
				controllerAs: 'vm'
			})

			.otherwise({ redirectTo: '/login' });
	}

	run.$inject = ['$rootScope', '$http', 'LocationService'];
	function run($rootScope, $http, LocationService) {
		// keep user logged in after page refresh
		$rootScope.globals = JSON.parse(sessionStorage.getItem('globals')) || {};

		if ($rootScope.globals.currentUser) {
			$http.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.globals.currentUser.access_token;
		}

		$rootScope.$on('$locationChangeStart', function (event, next, current) {
			// redirect to login page if not logged in and trying to access a restricted page
			var restrictedPage = $.inArray(LocationService.Location(), ['/login', '/register']) === -1;
			var loggedIn = $rootScope.globals.currentUser;

			if (restrictedPage && !loggedIn) {
				LocationService.RedirectToLogin();
			}
		});
	}

})();