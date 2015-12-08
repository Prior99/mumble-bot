import d3 from "d3";
import $ from "jquery";

const spacing = .1;
const margin = {
	top: 20,
	right: 20,
	bottom: 80,
	left: 100
};
const width = $("#chart").width() - margin.left - margin.right;
const height = $("#chart").height() - margin.top - margin.bottom;
const color = d3.scale.category20c();
const x = d3.scale.linear()
	.range([0, width]);
const y = d3.scale.ordinal()
	.rangeRoundBands([0, height], spacing);
const yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

const xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.ticks(10);
const chart = d3.select("#chart")
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("/api/stats/recordplaybacksperuser", (err, data) => {
	data = data.sort((a, b) => {
		if(a.user < b.user) {
			return -1;
		}
		else if(a.user > b.user) {
			return 1;
		}
		else {
			return 0;
		}
	});
	if(err) {
		throw err;
	}
	y.domain(data.map((d) => d.user));
	x.domain([0, d3.max(data, (d) => d.playbacks)]);
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

	const bar = chart.selectAll(".bar")
		.data(data)
		.enter()
		.append("g")
			.attr("class", "dat");
	bar.append("rect")
		.attr("class", "bar")
		.attr("y", (d) => y(d.user))
		.attr("height", y.rangeBand())
		.attr("x", (d) => 0)
		.attr("width", (d) => x(d.playbacks))
		.style("fill", (d) => color(d.user));
	const xOffset = x(d.playbacks) + 10;
	const yOffset = y(d.user) + y.rangeBand() / 2;
	bar.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", (d) => "translate(" + xOffset + ", " + yOffset + "), rotate(90)")
		.text((d) => d.playbacks)
		.style("fill", "black");
});
