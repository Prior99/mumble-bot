(function() {
	var d3 = require("d3");
	var $ = require("jquery");

	var width = $("#chart").width();
	var height = $("#chart").height();
	var maxRadius = Math.min(width, height) / 2;
	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return 1;
		});
	var chartPie = d3.select("#chart")
		.append("g")
		.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
	d3.json('/api/stats/spokenperweekday', function(err, data) {
		if(err) {
			throw err;
		}
		var maxDate = d3.max(data, function(d) {
			return new Date(d.amount);
		}).getTime();
		for(var i = 0; i < 7; i++) {
			data[i].num = i;
			data[i].amount = new Date(data[i].amount).getTime();
		}
		var d = chartPie.append("g")
			.attr("class", "dat");
		var g = d.selectAll(".arc")
			.data(pie(data))
			.enter().append("g")
			.attr("class", "arc");

		g.append("path")
			.attr("d", d3.svg.arc()
				.outerRadius(function(d, i) {
					return (d.data.amount/maxDate) * maxRadius * 0.6 + maxRadius * 0.3;
				})
				.innerRadius(maxRadius * 0.3))
			.style("fill", "#3182BD");
		g.append("text")
			.attr("transform", function(d, i) {
				d.innerRadius = 0.2 * maxRadius;
				d.outerRadius = 0.3 * maxRadius;
				return "translate(" + d3.svg.arc().centroid(d) + "), rotate(" + (360 * (d.data.num / 7) + (360 / 7) / 2) + ")";
			})
			.style("fill", "black")
			.attr("text-anchor", "middle")
			.text(function(d, i) {
				return d.data.day;
			});
		g.append("text")
			.attr("transform", function(d, i) {
				d.innerRadius = (d.data.amount/maxDate) * maxRadius * 0.6 + maxRadius * 0.3;
				d.outerRadius = (d.data.amount/maxDate + 0.1) * maxRadius * 0.6 + maxRadius * 0.3;
				d.innerRadius = Math.max(d.innerRadius, maxRadius * 0.3);
				d.outerRadius = Math.max(d.outerRadius, maxRadius * 0.4);
				return "translate(" + d3.svg.arc().centroid(d) + "), rotate(" + (360 * (d.data.num / 7) + (360 / 7) / 2) + ")";
			})
			.style("fill", "#FD8D3C")
			.style("font", "12px sans-serif")
			.style("font-weight", "bold")
			.attr("text-anchor", "middle")
			.text(function(d, i) {
				return Math.round((d.data.amount / (1000 * 60 * 60)) * 10) / 10 + "h";
			})
			.attr("class", "radius-value");
	});
})();
