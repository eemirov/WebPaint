(function() {
		angular.module("app")
			.directive("paintModel", paintModel);
		function paintModel() {
			return {
				scope: { changed: "&paintChanged", paintHistory: "=?"},
				link: function (scope, element, attrs) {
					var historyStack = [];

					var figureType = attrs["paintModel"];
					var defaultColor = attrs["defaultColor"];
					var changedData = {};

					attrs.$observe("paintModel", function(newAttr) {
						figureType = newAttr;
					});

					attrs.$observe("paintData", function (value) {
						if (value)
							updateCanvas(JSON.parse(value));
					});

					attrs.$observe("paintCanvasData", function (value) {
						if (value)
							loadFromData(JSON.parse(value));
					});

					attrs.$observe("paintRemoveId", function (value) {
						removeItem(value);
					});

					var svg = d3.select("svg")
						.call(d3.drag()
							.container(function () { return this; })
							.subject(function () { var p = [d3.event.x, d3.event.y]; return [p, p]; })
							.on("start", dragStarted)
							.on("end", dragEnded));

					function dragStarted() {
						switch (figureType) {
							case "line":
								drawLine();
								break;
							case "rect":
								drawRect();
								break;
							case "ellipse":
								drawEllipse();
								break;
						}
					}

					function dragEnded() {
						scope.changed({ "data": changedData });
						addToStackHistory(changedData.id);
					}

					function drawLine() {
						var active = svg.append("line"),
							x1 = d3.event.x,
							y1 = d3.event.y;

						addLine(active, x1, y1, x1, y1, defaultColor);

						d3.event.on("drag", function () {
							var x2 = d3.event.x,
								y2 = d3.event.y;

							changedData = addLine(active, x1, y1, x2, y2, defaultColor, generateUUID());
						});
					}

					function drawRect() {
						var active = svg.append("rect"),
							x = d3.event.x,
							y = d3.event.y;

						addRect(active, x, y, 0, 0, defaultColor);

						d3.event.on("drag", function () {
							var x1 = d3.event.x,
								y1 = d3.event.y;
							var width = x1 - x;
							var height = y1 - y;

							if (width > 0 && height > 0) {
								changedData = addRect(active, x, y, width, height, defaultColor, generateUUID());
							}
							
						});
					}

					function drawEllipse() {
						var active = svg.append("ellipse"),
							x = d3.event.x,
							y = d3.event.y;

						d3.event.on("drag", function () {
							var x1 = d3.event.x,
								y1 = d3.event.y;
							var width = x1 - x;
							var height = y1 - y;

							if (width > 0 && height > 0) {
								changedData = addEllipse(active, x + width / 2, y + height / 2, width / 2, height / 2, defaultColor, generateUUID());
							}
						});
					}

					function addLine(element, x1, y1, x2, y2, color, id) {
						var dataLine = [{ "type": "line", "x1": x1, "y1": y1, "x2": x2, "y2": y2, "color": color, "id" : id }];
						element.data(dataLine)
							.attr("x1", function (d) { return d.x1 })
							.attr("y1", function (d) { return d.y1 })
							.attr("x2", function (d) { return d.x2 })
							.attr("y2", function (d) { return d.y2 })
							.attr("stroke", function (d) { return d.color })
							.attr("id", function(d){ return d.id});
						return dataLine[0];
					}

					function addRect(element, x, y, width, height, color, id) {
						var dataRect = [{ "type": "rect", "x": x, "y": y, "width": width, "height": height, "color": color, "id": id }];
						element.data(dataRect)
							.attr("x", function (d) { return d.x })
							.attr("y", function (d) { return d.y })
							.attr("width", function (d) { return d.width })
							.attr("height", function (d) { return d.height })
							.attr("stroke", function (d) { return d.color })
							.attr("id", function (d) { return d.id });
						return dataRect[0];
					}

					function addEllipse(element, cx, cy, rx, ry, color, id) {
						var dataEllipse = [{ "type": "ellipse", "cx": cx, "cy": cy, "rx": rx, "ry": ry, "color": color, "id": id }];
						element.data(dataEllipse)
							.attr("cx", function (d) { return d.cx })
							.attr("cy", function (d) { return d.cy })
							.attr("rx", function (d) { return d.rx })
							.attr("ry", function (d) { return d.ry })
							.attr("stroke", function (d) { return d.color })
							.attr("id", function (d) { return d.id });
						return dataEllipse[0];
					}

					function updateCanvas(data) {
						switch (data.type) {
							case "line":
								var line = svg.append("line");
								addLine(line, data.x1, data.y1, data.x2, data.y2, data.color, data.id);
								break;
							case "rect":
								var rect = svg.append("rect");
								addRect(rect, data.x, data.y, data.width, data.height, data.color, data.id);
								break;
							case "ellipse":
								var ellipse = svg.append("ellipse");
								addEllipse(ellipse, data.cx, data.cy, data.rx, data.ry, data.color, data.id);
								break;
						}
					}

					function loadFromData(svgData) {
						svg.selectAll("*").remove();
						var data;
						for (var i = 0; i < svgData.lines.length; i++) {
							data = svgData.lines[i];
							var line = svg.append("line");
							addLine(line, data.x1, data.y1, data.x2, data.y2, data.color, data.id);
						}

						for (var i = 0; i < svgData.rects.length; i++) {
							data = svgData.rects[i];
							var rect = svg.append("rect");
							addRect(rect, data.x, data.y, data.width, data.height, data.color, data.id);
						}

						for (var i = 0; i < svgData.ellipses.length; i++) {
							data = svgData.ellipses[i];
							var ellipse = svg.append("ellipse");
							addEllipse(ellipse, data.cx, data.cy, data.rx, data.ry, data.color, data.id);
						}
					}

					function addToStackHistory(id) {
						historyStack.push(id);
						if (historyStack.length > 5) {
							historyStack.shift();
						}

						scope.paintHistory = historyStack;
						scope.$apply();
					}

					function removeItem(id) {
						var svg = d3.select("svg");
						svg.selectAll("[id='" + id + "']").remove();
					}

					function generateUUID() {
						var d = new Date().getTime();
						if (window.performance && typeof window.performance.now === "function") {
							d += performance.now();; //use high-precision timer if available
						}
						var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
							var r = (d + Math.random() * 16) % 16 | 0;
							d = Math.floor(d / 16);
							return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
						});
						return uuid;
					};
				}
			};
		};
	}
)();