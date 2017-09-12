(function () {
	'use strict';

	angular
		.module('app')
		.controller('HomeController', HomeController);

	HomeController.$inject = ['$rootScope', '$scope', 'LocationService', 'AuthenticationService',
		'ShareService', 'FlashService', 'PaintHistoryService'];
	function HomeController($rootScope, $scope, LocationService, AuthenticationService, ShareService, FlashService, PaintHistoryService) {
		var vm = this;

		vm.logout = logout;
		vm.figureClick = figureClick;
		vm.exportDataSvg = exportDataSvg;
		vm.paintChanged = paintChanged;
		vm.undoClick = undoClick;
		vm.shareClick = shareClick;
		vm.hasHistory = false;

		vm.figureType = "line";
		vm.defaultColor = $rootScope.globals.currentUser.defaultColor;
		vm.paintAddData = undefined;
		vm.paintCanvasData = undefined;
		vm.removedItemId = "";

		var hub;
		initHub();

		function initHub() {
			hub = $.connection.paintHub;

			hub.client.addItem = addItem;
			hub.client.removeItem = removeItem;
			hub.client.getCanvas = getCanvas;
			hub.client.updateCanvas = updateCanvas;

			$.connection.hub.start();
		}

		function addItem(data) {
			$scope.$apply(function () { vm.paintAddData = data; });
		}

		function removeItem(id) {
			$scope.$apply(function () { vm.removedItemId = id; });
		}

		function getCanvas(userConnectionId) {
			hub.server.sendCanvasData(userConnectionId, exportDataSvg());
		}

		function updateCanvas(data) {
			$scope.$apply(function () { vm.paintCanvasData = data; });
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
			PaintHistoryService.Add(data);
			vm.hasHistory = PaintHistoryService.Count > 0;
			$scope.$apply();

			hub.server.itemChanged(JSON.stringify(data));
		}

		function undoClick() {
			var item = PaintHistoryService.Get();
			vm.hasHistory = PaintHistoryService.Count > 0;

			if(item != undefined)
				hub.server.itemRemoved(item.id);
		}

		function shareClick() {
			ShareService.ShareToFacebook(d3.select(".canvas").html(), function error(response) {
				FlashService.Error("Could not share canvas.");
			});
		}
	}

})();
