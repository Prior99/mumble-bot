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
	var color = d3.scale.category20c();
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);
	var y = d3.time.scale()
		.range([height, 0]);
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var chart = d3.select("#chart")
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.json('/api/stats/spokenperuser', function(err, data) {
		data = data.sort(function(a, b) {
			return a.user < b.user ? -1 : a.user > b.user ? 1 : a.user >= b.user ? 0 : NaN;
		});
		if(err) {
			throw err;
		}

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(d3.time.hours, Math.round((d3.max(data, function(d) {
				return new Date(d.amount);
			}).getTime() / (1000 * 60 * 60)) / 10))
			.tickFormat(function(d) {
				return Math.round((d / (1000 * 60 * 60)) * 100) / 100 + "h";
			});
		x.domain(data.map(function(d) {
			return d.user;
		}));
		y.domain([0, d3.max(data, function(d) {
			return new Date(d.amount);
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
			.attr("x", function(d) {
				return x(d.user);
			})
			.attr("width", x.rangeBand())
			.attr("y", function(d) {
				return y(new Date(d.amount));
			})
			.attr("height", function(d) {
				return height - y(new Date(d.amount));
			})
			.style("fill", function(d) {
				return color(d.user);
			});
	});
})();
