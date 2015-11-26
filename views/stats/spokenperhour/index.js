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
	var perUserPie = d3.select("#chart")
		.append("g")
		.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
	d3.json('/api/stats/spokenperhour', function(err, data) {
		var dat = [];
		for(var i = 0; i < 24; i++) {
			dat.push({
				hour : i,
				amount : 0
			});
		}
		data.forEach(function(d) {
			dat[d.hour].amount = new Date(d.amount).getTime();
		});
		if(err) {
			throw err;
		}
		var maxDate = d3.max(data, function(d) {
			return new Date(d.amount);
		}).getTime();
		var d = perUserPie.append("g")
			.attr("class", "dat");
		var g = d.selectAll(".arc")
			.data(pie(dat))
			.enter().append("g")
			.attr("class", "arc");

		g.append("path")
			.attr("d", d3.svg.arc()
				.outerRadius(function(d, i) {
					return (dat[i].amount/maxDate) * maxRadius * 0.6 + maxRadius * 0.3;
				})
				.innerRadius(maxRadius * 0.3))
			.style("fill", "#3182BD");
		g.append("text")
			.attr("transform", function(d, i) {
				d.innerRadius = 0.2 * maxRadius;
				d.outerRadius = 0.3 * maxRadius;
				return "translate(" + d3.svg.arc().centroid(d) + "), rotate(" + (360 * (dat[i].hour / 24) + (360 / 24) / 2) + ")";
			})
			.style("fill", "black")
			.attr("text-anchor", "middle")
			.text(function(d, i) {
				var l = d.data.hour < 10 ? "0" + dat[i].hour : dat[i].hour;
				return l;
			});
		g.append("text")
			.attr("transform", function(d, i) {
				d.innerRadius = (dat[i].amount/maxDate) * maxRadius * 0.6 + maxRadius * 0.3;
				d.outerRadius = (dat[i].amount/maxDate + 0.1) * maxRadius * 0.6 + maxRadius * 0.3;
				d.innerRadius = Math.max(d.innerRadius, maxRadius * 0.3);
				d.outerRadius = Math.max(d.outerRadius, maxRadius * 0.4);
				return "translate(" + d3.svg.arc().centroid(d) + "), rotate(" + (360 * (dat[i].hour / 24) + (360 / 24) / 2) + ")";
			})
			.style("fill", "#FD8D3C")
			.style("font", "12px sans-serif")
			.style("font-weight", "bold")
			.attr("text-anchor", "middle")
			.text(function(d, i) {
				return Math.round((dat[i].amount / (1000 * 60 * 60)) * 10) / 10 + "h";
			})
			.attr("class", "radius-value");
	});
})();
