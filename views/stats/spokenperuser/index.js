import d3 from "d3";
import $ from "jquery";

const margin = {
	top: 20,
	right: 20,
	bottom: 80,
	left: 50
};

const spacing = .1;
const width = $("#chart").width() - margin.left - margin.right;
const height = $("#chart").height() - margin.top - margin.bottom;
const color = d3.scale.category20c();
const x = d3.scale.ordinal()
	.rangeRoundBands([0, width], spacing);
const y = d3.time.scale()
	.range([height, 0]);
const xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");
const chart = d3.select("#chart")
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const millisecondsPerHour = 3600000;
const twoDigits = 100;


d3.json("/api/stats/spokenperuser", (err, data) => {
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
	const amountOfTicks = Math.round((d3.max(data, (d) => new Date(d.amount).getTime()) / millisecondsPerHour) / 10);
	const yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(d3.time.hours, amountOfTicks)
		.tickFormat((d) => Math.round((d / millisecondsPerHour) * twoDigits) / twoDigits + "h");
	x.domain(data.map((d) => d.user));
	y.domain([0, d3.max(data, (d) => new Date(d.amount))]);
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
		.attr("x", (d) => x(d.user))
		.attr("width", x.rangeBand())
		.attr("y", (d) => y(new Date(d.amount)))
		.attr("height", (d) => height - y(new Date(d.amount)))
		.style("fill", (d) => color(d.user));
});
