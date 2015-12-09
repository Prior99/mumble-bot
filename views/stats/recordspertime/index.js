import d3 from "d3";
import $ from "jquery";

const transitionDuration = 100;
const margin = {
	top: 20,
	right: 20,
	bottom: 80,
	left: 50
};
const width = $("#perTimeChart").width() - margin.left - margin.right;
const height = $("#perTimeChart").height() - margin.top - margin.bottom;
const perTime = d3.select("#perTimeChart")
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
const x = d3.time.scale()
	.range([0, width]);

const y = d3.scale.linear()
	.range([height, 0]);

const xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

const yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

const formatTime = d3.time.format("%d.%m.%y");
d3.json("/api/stats/recordspertime", (err, data) => {
	const area = d3.svg.area()
		.x((d) => x(d.submitted))
		.y0(height)
		.y1((d) => y(d.amount));
	let tooltip;
	if(err) {
		throw err;
	}
	data.forEach((d) => d.submitted = new Date(d.submitted));
	x.domain(d3.extent(data, (d) => d.submitted));
	const minDate = d3.min(data, (d) => new Date(d.submitted));
	const maxDate = d3.max(data, (d) => new Date(d.submitted));
	const barWidth = width / d3.time.days(minDate, maxDate).length;
	y.domain([0, d3.max(data, (d) => d.amount)]);

	perTime.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	perTime.append("g")
		.attr("class", "y axis")
		.call(yAxis);
	const bar = perTime.selectAll(".bar")
		.data(data)
		.enter()
		.append("g")
			.attr("class", "dat");
	bar.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => x(d.submitted))
		.attr("width", barWidth)
		.attr("y", (d) => y(d.amount))
		.attr("height", (d) => height - y(d.amount))
		.style("fill", "#3182BD")
		/*.attr("r", 3)
		.attr("class", "areadot")
		.attr("cx", function(d) { return x(d.submitted); })
		.attr("cy", function(d) { return y(d.amount); })*/
		.on("mouseover", (d) => {
			d3.select(this).style("fill", "#FD8D3C");
			tooltip.transition()
				.duration(transitionDuration)
				.style("opacity", 1.0);
			tooltip.text(formatTime(d.submitted) + ": " + d.amount)
				.attr("x", x(d.submitted))
				.attr("text-anchor", x(d.submitted) < width / 2 ? "start" : "end")
				.attr("y", y(d.amount) - 5);
		})
		.on("mouseout", (d) => {
			d3.select(this).style("fill", "#3182BD");
			tooltip.transition()
				.duration(transitionDuration)
				.style("opacity", 0);
		});
	tooltip = perTime.append("text")
		.style("opacity", 0);
});
