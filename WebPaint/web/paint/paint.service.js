(function() {
	angular
		.module('app')
		.factory('PaintService', PaintService);

	PaintService.$inject = ['$rootScope', 'SVGPaintCommand'];
	function PaintService($rootScope, PaintCommand) {

		var service = {};

		service.FigureType = "line";
		service.Init = Init;
		service.ChangeType = ChangeType;
		service.OnFigureAdded = OnFigureAdded;
		service.Add = Add;
		service.Remove = Remove;
		service.LoadCanvas = LoadCanvas;

		return service;

		function Init(figureType, defaultColor) {
			service.FigureType = figureType;
			DefaultColor = defaultColor;

			PaintCommand.Init(service.FigureType, defaultColor, figureChanged);
		}

		function ChangeType(figureType) {
			PaintCommand.ChangeType(figureType);
		}

		function Add(data) {
			PaintCommand.AddElement(data);
		}

		function Remove(id) {
			PaintCommand.RemoveElement(id);
		}

		function LoadCanvas(data) {
			PaintCommand.ClearAll();

			for (var i = 0; i < data.lines.length; i++) {
				PaintCommand.AddElement(data.lines[i]);
			}

			for (var i = 0; i < data.rects.length; i++) {
				PaintCommand.AddElement(data.rects[i]);
			}

			for (var i = 0; i < data.ellipses.length; i++) {
				PaintCommand.AddElement(data.ellipses[i]);
			}
		}

		function OnFigureAdded(scope, callback) {
			var handler = $rootScope.$on('figure-changed-event', callback);
			scope.$on('$destroy', handler);
		}

		function figureChanged() {
			$rootScope.$emit('figure-changed-event', PaintCommand.FigureData);
		}
	}
})()