(function() {
	angular.module("app")
		.factory("PaintHistoryService", PaintHistoryService);

	function PaintHistoryService() {
		var service = {};
		var historyStack = [];

		service.Add = Add;
		service.Get = Get;
		service.Count = 0;

		return service;

		function Add(data) {
			historyStack.push(data);
			if (historyStack.length > 5) {
				historyStack.shift();
			}
			service.Count = historyStack.length;
		}

		function Get() {
			var d = historyStack.pop();
			service.Count = historyStack.length;

			return d;
		}
	}
})()