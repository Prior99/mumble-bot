(function() {
	var d3 = require("d3");
	var $ = require("jquery");

	var margin = {
		top: 20,
		right: 20,
		bottom: 80,
		left: 50
	};
	var width = $("#perUserBarChart").width() - margin.left - margin.right;
	var height = $("#perUserBarChart").height() - margin.top - margin.bottom;
	var color = d3.scale.category20c();
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);
	var y = d3.scale.linear()
		.range([height, 0]);
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10);
	var perUserBar = d3.select("#perUserBarChart")
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.json('/api/record/stats/peruser', function(err, data) {
		if(err) {
			throw err;
		}
		x.domain(data.map(function(d) {
			return d.user;
		}));
		y.domain([0, d3.max(data, function(d) {
			return d.amount;
		})]);
		perUserBar.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("transform", "rotate(-65)");

		perUserBar.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text");

		var bar = perUserBar.selectAll(".bar")
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
				return y(d.amount);
			})
			.attr("height", function(d) {
				return height - y(d.amount);
			})
			.style("fill", function(d) {
				return color(d.user);
			});
		bar.append("text")
			.attr("y", function(d) { return y(d.amount) + 12; })
			.attr("x", function(d) {
				return x(d.user) + x.rangeBand() / 2;
			})
			.text(function(d) {
				return d.amount;
			});
	});
})();
