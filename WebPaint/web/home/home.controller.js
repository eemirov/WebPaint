(function () {
	'use strict';

	angular
		.module('app')
		.controller('HomeController', HomeController);

	HomeController.$inject = ['$rootScope', '$scope', 'LocationService', 'AuthenticationService', 'ShareService', 'FlashService'];
	function HomeController($rootScope, $scope, LocationService, AuthenticationService, ShareService, FlashService) {
		var vm = this;

		vm.logout = logout;
		vm.figureClick = figureClick;
		vm.exportDataSvg = exportDataSvg;
		vm.paintChanged = paintChanged;
		vm.undoClick = undoClick;
		vm.shareClick = shareClick;

		vm.figureType = "line";
		vm.defaultColor = $rootScope.globals.currentUser.defaultColor;
		vm.paintData = undefined;
		vm.paintCanvasData = undefined;
		vm.removedItemId = "";

		vm.historyStack = [];

		var hub = $.connection.paintHub;
		hub.client.addFigure = canvasChanged;
		hub.client.getCanvas = getCanvas;
		hub.client.updateCanvas = updateCanvas;
		hub.client.undoItem = undoItem;

		$.connection.hub.start().done(function () { console.log("connected"); });

		function canvasChanged(data) {
			$scope.$apply(function () { vm.paintData = data; });
		}

		function getCanvas(userConnectionId) {
			hub.server.sendCanvasData(userConnectionId, exportDataSvg());
		}

		function updateCanvas(data) {
			$scope.$apply(function () { vm.paintCanvasData = data; });
		}

		function undoItem(id) {
			$scope.$apply(function () { vm.removedItemId = id; });
		}

		function logout() {
			AuthenticationService.Logout(function success() {
				AuthenticationService.ClearCredentials();
				LocationService.RedirectToLogin();
			});
		}

		function figureClick(e, type) {
			e.preventDefault();
			vm.figureType = type;
		}

		function exportDataSvg() {
			var svg = d3.select("svg");
			var lines = svg.selectAll("line").data();
			var ellipses = svg.selectAll("ellipse").data();
			var rects = svg.selectAll("rect").data();

			return JSON.stringify({ "lines": lines, "ellipses": ellipses, "rects": rects });
		}

		function paintChanged(data) {
			hub.server.addChange(JSON.stringify(data));
		}

		function undoClick() {
			var itemId = vm.historyStack.pop();
			hub.server.undoItem(itemId);
		}

		function shareClick() {
			ShareService.ShareToFacebook(d3.select(".canvas").html(), function error(response) {
				FlashService.Error("Could not share canvas.");
			});
		}
	}

})();
