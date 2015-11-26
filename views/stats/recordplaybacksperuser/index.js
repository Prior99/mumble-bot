(function() {
	var d3 = require("d3");
	var $ = require("jquery");

	var margin = {
		top: 20,
		right: 20,
		bottom: 80,
		left: 100
	};
	var width = $("#chart").width() - margin.left - margin.right;
	var height = $("#chart").height() - margin.top - margin.bottom;
	var color = d3.scale.category20c();
	var x = d3.scale.linear()
		.range([0, width]);
	var y = d3.scale.ordinal()
		.rangeRoundBands([0, height], .1);
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(10);
	var chart = d3.select("#chart")
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.json('/api/stats/recordplaybacksperuser', function(err, data) {
		data = data.sort(function(a, b) {
			return a.user < b.user ? -1 : a.user > b.user ? 1 : a.user >= b.user ? 0 : NaN;
		});
		if(err) {
			throw err;
		}
		y.domain(data.map(function(d) {
			return d.user;
		}));
		x.domain([0, d3.max(data, function(d) {
			return d.playbacks;
		})]);
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("transform", "rotate(-65)");

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
			.attr("y", function(d) {
				return y(d.user);
			})
			.attr("height", y.rangeBand())
			.attr("x", function(d) {
				return 0;
			})
			.attr("width", function(d) {
				return x(d.playbacks);
			})
			.style("fill", function(d) {
				return color(d.user);
			});
		bar.append("text")
			.attr("text-anchor", "middle")
			.attr("transform", function(d) {
				return "translate(" + (x(d.playbacks) + 10) + ", " + (y(d.user) + y.rangeBand() / 2) + "), rotate(90)";
			})
			.text(function(d) {
				return d.playbacks;
			})
			.style("fill", "black");
	});
})();
