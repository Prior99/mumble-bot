(function() {
	var d3 = require("d3");
	var $ = require("jquery");

	var width = $("#perUserPieChart").width();
	var height = $("#perUserPieChart").height();
	var radius = Math.min(width - 150, height) / 2;
	var color = d3.scale.category20c();

	var arc = d3.svg.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius * 0.4);

	var arcOver = d3.svg.arc()
		.innerRadius(radius * 0.5)
		.outerRadius(radius * 0.9);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return d.amount;
		});

	var perUserPie = d3.select("#perUserPieChart")
		.append("g")
		.attr("transform", "translate(" + ((width - 150) / 2) + "," + (height / 2) + ")");
	d3.json('/api/stats/recordsperuser', function(err, data) {
		if(err) {
			throw err;
		}
		var total = 0;
		data.forEach(function(d) {
			total += d.amount;
		});
		var textTop = perUserPie.append("text")
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.attr("class", "textTop")
			.text("Gesamt")
			.attr("y", -10);
		var textBottom = perUserPie.append("text")
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.attr("class", "textBottom")
			.text("" + total)
			.attr("y", 10);
		var dat = perUserPie.append("g")
			.attr("class", "dat");
		var g = dat.selectAll(".arc")
			.data(pie(data))
			.enter().append("g")
			.attr("class", "arc")
			.on("mouseover", function(d) {
				d3.select(this).select("path").transition()
					.duration(200)
					.attr("d", arcOver);
				textTop.text(d3.select(this).datum().data.user)
					.attr("y", -10);
				textBottom.text(parseInt((d3.select(this).datum().data.amount / total) * 100) + "%")
					.attr("y", 10);
			})
			.on("mouseout", function(d) {
				d3.select(this).select("path").transition()
					.duration(100)
					.attr("d", arc);
				textTop.text("Gesamt")
					.attr("y", -10);
				textBottom.text(total);
			});

		g.append("path")
			.attr("d", arc)
			.style("fill", function(d) {
				return color(d.data.user);
			});
		var legend = d3.select("#perUserPieChart").append("svg")
			.attr("class", "legend")
			.attr("transform", "translate(" + (width - 150) +"," + ((height - (data.length * 20)) / 2) + ")")
			.selectAll("g")
			.data(data)
			.enter().append("g")
				.attr("transform", function(d, i) {
					return "translate(0," + (i * 20) + ")";
				});
		legend.append("rect")
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", function(d, i) {
				return color(d.user);
			});

		legend.append("text")
			.attr("x", 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.text(function(d) {
				return d.user;
			});
	});
})();
