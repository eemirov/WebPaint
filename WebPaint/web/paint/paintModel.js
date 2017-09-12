(function() {
		angular.module("app")
		.directive("paintModel", paintModel);
		paintModel.$inject = ['PaintService'];
		function paintModel(PaintService) {
			return {
				scope: { changed: "&paintChanged", paintHistory: "=?"},
				link: function (scope, element, attrs) {

					var figureType = attrs["paintModel"];
					var defaultColor = attrs["defaultColor"];

					attrs.$observe("paintModel", function(newAttr) {
						PaintService.ChangeType(newAttr);
					});

					attrs.$observe("paintAddData", function (value) {
						if (value)
							PaintService.Add(JSON.parse(value));
					});

					attrs.$observe("paintCanvasData", function (value) {
						if (value)
							PaintService.LoadCanvas(JSON.parse(value));
					});

					attrs.$observe("paintRemoveId", function (value) {
						PaintService.Remove(value);
					});

					PaintService.Init(figureType, defaultColor);

					PaintService.OnFigureAdded(scope, function(event, data) {
						scope.changed({ "data": data });
					});
				}
			};
		};
	}
)();