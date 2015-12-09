import d3 from "d3";
import $ from "jquery";

const spacing = .1;
const milliSecondsPerDay = 86400000;
const twoDigit = 100;
const hoursPerTwoDays = 48;
const margin = {
	top: 20,
	right: 20,
	bottom: 80,
	left: 100
};
const width = $("#chart").width() - margin.left - margin.right;
const height = $("#chart").height() - margin.top - margin.bottom;
const color = d3.scale.category20c();
const x = d3.time.scale()
	.range([0, width]);
const y = d3.scale.ordinal()
	.rangeRoundBands([0, height], spacing);
const yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

const xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.ticks(d3.time.hours, hoursPerTwoDays)
	.tickFormat((d) => Math.round((d / milliSecondsPerDay) * twoDigit) / twoDigit + "d");
const chart = d3.select("#chart")
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("/api/stats/onlineperuser", (err, data) => {
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
	x.domain([0, d3.max(data, (d) => new Date(d.amount))]);
	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

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
		.attr("width", (d) => x(new Date(d.amount)))
		.style("fill", (d) => color(d.user));
	const xOffset = x(new Date(d.amount)) + 10;
	const yOffset = y(d.user) + y.rangeBand() / 2;
	const days = Math.round((new Date(d.amount).getTime() / milliSecondsPerDay) * 10) / 10;
	bar.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", (d) => "translate(" + xOffset + ", " + yOffset + "), rotate(90)")
		.text((d) => days + "d")
		.style("fill", "black");
});
