(function() {

	var d3 = require("d3");
	var $ = require("jquery");

	var margin = {
		top: 20,
		right: 20,
		bottom: 80,
		left: 50
	};
	var width = $("#perTimeChart").width() - margin.left - margin.right;
	var height = $("#perTimeChart").height() - margin.top - margin.bottom;
	var perTime = d3.select("#perTimeChart")
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var x = d3.time.scale()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var formatTime = d3.time.format("%d.%m.%y");
	d3.json("/api/stats/recordspertime", function(err, data) {

		var area = d3.svg.area()
			.x(function(d) { return x(d.submitted); })
			.y0(height)
			.y1(function(d) { return y(d.amount); });
		var tooltip;
		if(err) {
			throw err;
		}
		data.forEach(function(d) {
			d.submitted = new Date(d.submitted);
		});
		x.domain(d3.extent(data, function(d) {
			return d.submitted;
		}));
		var barWidth = width / d3.time.days(d3.min(data, function(d) {
			return new Date(d.submitted)
		}), d3.max(data, function(d) {
			return new Date(d.submitted)
		})).length;
		y.domain([0, d3.max(data, function(d) {
			return d.amount;
		})]);
		/*perTime.append("path")
			.datum(data)
			.attr("class", "area")
			.attr("d", area);*/

		perTime.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		perTime.append("g")
			.attr("class", "y axis")
			.call(yAxis);
		var bar = perTime.selectAll(".bar")
			.data(data)
			.enter()
			.append("g")
				.attr("class", "dat");
		bar.append("rect")
			.attr("class", "bar")
			.attr("x", function(d) {
				return x(d.submitted);
			})
			.attr("width", barWidth)
			.attr("y", function(d) {
				return y(d.amount);
			})
			.attr("height", function(d) {
				return height - y(d.amount);
			})
			.style("fill", "#3182BD")
			/*.attr("r", 3)
			.attr("class", "areadot")
			.attr("cx", function(d) { return x(d.submitted); })
			.attr("cy", function(d) { return y(d.amount); })*/
			.on("mouseover", function(d) {
				d3.select(this).style("fill", "#FD8D3C");
				tooltip.transition()
					.duration(100)
					.style("opacity", 1.0);
				tooltip.text(formatTime(d.submitted) + ": "  + d.amount)
					.attr("x", x(d.submitted))
					.attr("text-anchor", x(d.submitted) < width / 2 ? "start" : "end")
					.attr("y", y(d.amount) - 5);
			})
			.on("mouseout", function(d) {
				d3.select(this).style("fill", "#3182BD");
				tooltip.transition()
					.duration(100)
					.style("opacity", 0);
			});
		tooltip = perTime.append("text")
			.style("opacity", 0);
	});
})();
