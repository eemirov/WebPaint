(function () {
	'use strict';

	angular
		.module('app')
		.factory('AuthenticationService', AuthenticationService);

	AuthenticationService.$inject = ['$http', '$rootScope'];
	function AuthenticationService($http, $rootScope) {
		var service = {};

		service.Login = Login;
		service.Logout = Logout;
		service.SetCredentials = SetCredentials;
		service.ClearCredentials = ClearCredentials;
		service.CheckRegistration = CheckRegistration;
		service.RegisterExternal = RegisterExternal;
		service.Register = Register;
		service.GetExternalLogins = GetExternalLogins;

		return service;

		function Login(username, password, callback, errorCallback) {
			$http.post("/Token", "username=" + encodeURIComponent(username)
				+ "&password=" + encodeURIComponent(password)
				+ "&grant_type=password"
			).then(
				function success(response) {
					callback(response.data);
				},
				function error(response) {
					errorCallback(response.data);
			});
		}

		function Logout(callback) {
			$http.post("/api/Account/Logout", '').then(
				function success(response) {
					callback(response.data);
				},
				function error(response) {
					callback(response.data);
				});
		}

		function SetCredentials(username, token) {
			$rootScope.globals = {
				currentUser: {
					username: username,
					access_token: token,
					defaultColor: getRandomColor() 
				}
			};

			// set default auth header for http requests
			$http.defaults.headers.common['Authorization'] = 'Bearer ' + token;

			sessionStorage.setItem("globals", JSON.stringify($rootScope.globals));
		}

		function ClearCredentials() {
			$rootScope.globals = {};
			sessionStorage.removeItem('globals');
			$http.defaults.headers.common.Authorization = 'Bearer';
		}

		function CheckRegistration(token, callback, errorCallback) {
			var request = {
				method: 'get',
				url: '/api/Account/UserInfo',
				headers: {
					'Authorization': 'Bearer ' + token
				}
			}

			$http(request).then(
				function success(response) {
					callback(response.data);
				},
				function error() {
					errorCallback(response.data);
				}
			);
		}

		function RegisterExternal(token, callback, errorCallback) {
			var request = {
				method: 'post',
				url: '/api/Account/RegisterExternal',
				headers: {
					'Authorization': 'Bearer ' + token
				},
				data: {}
			}

			$http(request).then(
				function success(response) {
					callback(response.data);
				},
				function error() {
					errorCallback(response.data);
				}
			);
		}

		function Register(userName, password, confirmPassword, callback, errorCallback) {
			var userData = {
				Email: userName,
				Password: password,
				ConfirmPassword: confirmPassword
			};

			$http.post("/api/Account/Register", userData
			).then(
				function success(response) {
					callback(response.data);
				},
				function error(response) {
					errorCallback(response.data);
			});
		}

		function GetExternalLogins(callback) {
			$http.get("/api/Account/ExternalLogins?returnUrl=/&generateState=true")
				.then(function(response) {
					callback(response.data);
				});
		}

		function getRandomColor() {
			function c() {
				var hex = Math.floor(Math.random() * 256).toString(16);
				return ("0" + String(hex)).substr(-2); // pad with zero
			}
			return "#" + c() + c() + c();
		}
	}
})();