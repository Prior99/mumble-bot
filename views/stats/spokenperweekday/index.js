(function() {
	var d3 = require("d3");
	var $ = require("jquery");

	var margin = {
		top: 20,
		right: 20,
		bottom: 80,
		left: 50
	};
	var width = $("#chart").width() - margin.left - margin.right;
	var height = $("#chart").height() - margin.top - margin.bottom;
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);
	var y = d3.time.scale()
		.range([height, 0]);
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(d3.time.hours, 2)
		.tickFormat(function(d) {
			return Math.round((d / (1000 * 60 * 60)) * 100) / 100;
		});
	var chart = d3.select("#chart")
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.json('/api/stats/spokenperweekday', function(err, data) {
		if(err) {
			throw err;
		}
		x.domain(data.map(function(d) {
			return d.day;
		}));
		y.domain([0, d3.max(data, function(d) {
			return new Date(d.amount);
		})]);
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text");

		var bar = chart.selectAll(".bar")
			.data(data)
			.enter()
			.append("g")
				.attr("class", "dat");
		bar.append("rect")
			.attr("class", "bar")
			.attr("x", function(d) {
				return x(d.day);
			})
			.attr("width", x.rangeBand())
			.attr("y", function(d) {
				return y(new Date(d.amount));
			})
			.attr("height", function(d) {
				return height - y(new Date(d.amount));
			})
			.style("fill", "#FD8D3C");
	});
})();
