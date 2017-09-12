(function() {
	'use strict';

	angular
		.module('app')
		.factory('ShareService', ShareService);
	ShareService.$inject = ['$http'];
	function ShareService($http) {
		var service = {};

		service.ShareToFacebook = ShareToFacebook;

		return service;

		function ShareToFacebook(svgHtml, errorCallback) {
			$http.post("/api/Share/StoreSVG", { html: svgHtml })
				.then(function success(response) {
					openSharePopup(response.data.Url);
				},
				function error() {
					errorCallback(response.data);
				});
		}

		function openSharePopup(url) {
			var width = 400;
			var height = 300;
			var leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
			var topPosition = (window.screen.height / 2) - ((height / 2) + 50);
			var windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no";
			var t = document.title;
			window.open('https://www.facebook.com/sharer/sharer.php?&display=popup&ref=plugin&src=share_button&u=' + encodeURIComponent(url) + '&t=' + encodeURIComponent(t), 'sharer', windowFeatures);
			return false;;
		}
	}
})();