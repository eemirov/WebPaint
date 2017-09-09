(function () {
	'use strict';

	angular
		.module('app')
		.controller('LoginController', LoginController);

	LoginController.$inject = ['LocationService', 'AuthenticationService', 'FlashService'];
	function LoginController(LocationService, AuthenticationService, FlashService) {
		var vm = this;

		vm.login = login;
		vm.register = register;
		vm.loginWithFB = loginWithFB;

		(function initController() {
			// reset login status
			AuthenticationService.ClearCredentials();

			checkLocationHash();
		})();

		function login() {
			vm.dataLoading = true;
			AuthenticationService.Login(vm.username, vm.password,
				function (response) {
					AuthenticationService.SetCredentials(response.userName, response.access_token);
					LocationService.RedirectToHomeLocation();
				}, function(response) {
				FlashService.Error(response.error_description);
				vm.dataLoading = false;
			});
		};

		function register() {
			LocationService.RedirectToRegister();
		}

		function loginWithFB() {
			AuthenticationService.GetExternalLogins(function (response) {
				var fbLogin = undefined;
				console.log(response);
				for (var i = 0; i < response.length; i++) {
					console.log(response[i]);
					if (response[i].Name == "Facebook") {
						fbLogin = response[i];
					}
				}

				if (fbLogin) {
					LocationService.RedirectToLocation(fbLogin.Url);
				}
			});
		}

		function checkLocationHash() {
			if (location.hash) {
				var hash = location.hash.split('access_token=');
				if (hash.length >= 2) {
					var accessToken = hash[1].split('&')[0];
					if (accessToken) {
						AuthenticationService.CheckRegistration(accessToken, function success(response) {
							if (response.HasRegistered) {
								successLogin(response.UserName, accessToken);
							} else {
								AuthenticationService.RegisterExternal(accessToken,
									function success(response) {
										successLogin(response.UserName, accessToken);
									},
									function error() {
										FlashService.Error(response.Message);
									});
							}
						},
						function error(response) {
							FlashService.Error(response.Message);
						});
					}
				}
			}
		}

		function successLogin(userName, accessToken) {
			AuthenticationService.SetCredentials(userName, accessToken);
			LocationService.RedirectToHomeLocation();
		}
	}

})();
