(function () {
	'use strict';

	angular
		.module('app')
		.controller('RegisterController', RegisterController);

	RegisterController.$inject = ['LocationService', 'AuthenticationService', 'FlashService'];
	function RegisterController(LocationService, AuthenticationService, FlashService) {
		var vm = this;

		vm.register = register;

		function register() {
			vm.dataLoading = true;
			AuthenticationService.Register(vm.username, vm.password, vm.confirmpassword,
				function (response) {
						FlashService.Success('Registration successful', true);
						AuthenticationService.Login(vm.username, vm.password,
							function (response) {
								AuthenticationService.SetCredentials(response.userName, response.access_token);
								LocationService.RedirectToHomeLocation();
							});
				},
				function (response) {
					FlashService.Error(response.ModelState[""][0]);
					vm.dataLoading = false;
				});
		}
	}

})();
