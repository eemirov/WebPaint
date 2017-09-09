(function() {
	'use strict';

	angular
		.module('app')
		.factory('LocationService', LocationService);

	LocationService.$inject = ['$location'];
	function LocationService($location) {
		var service = {};

		service.RedirectToLogin = RedirectToLogin;
		service.RedirectToRegister = RedirectToRegister;
		service.RedirectToHome = RedirectToHome;
		service.RedirectToHomeLocation = RedirectToHomeLocation;
		service.Location = Location;
		service.RedirectToLocation = RedirectToLocation;

		return service;

		function RedirectToLogin() {
			$location.path("/login");
		}

		function RedirectToRegister() {
			$location.path("/register");
		}

		function RedirectToHome() {
			$location.path("/");
		}

		function RedirectToHomeLocation() {
			window.location.href = "/web/";
		}

		function Location() {
			return $location.path();
		}

		function RedirectToLocation(url) {
			window.location.href = url;
		}
	}
})();