import d3 from "d3";
import $ from "jquery";

const margin = {
	top: 20,
	right: 20,
	bottom: 80,
	left: 50
};

const spacing = .1;
const yTextOffset = 12;

const width = $("#perUserBarChart").width() - margin.left - margin.right;
const height = $("#perUserBarChart").height() - margin.top - margin.bottom;
const color = d3.scale.category20c();
const x = d3.scale.ordinal()
	.rangeRoundBands([0, width], spacing);
const y = d3.scale.linear()
	.range([height, 0]);
const xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

const yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(10);
const perUserBar = d3.select("#perUserBarChart")
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("/api/stats/recordsperuser", (err, data) => {
	if(err) {
		throw err;
	}
	x.domain(data.map((d) => d.user));
	y.domain([0, d3.max(data, (d) => d.amount)]);
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

	const bar = perUserBar.selectAll(".bar")
		.data(data)
		.enter()
		.append("g")
			.attr("class", "dat");
	bar.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => x(d.user))
		.attr("width", x.rangeBand())
		.attr("y", (d) => y(d.amount))
		.attr("height", (d) => height - y(d.amount))
		.style("fill", (d) => color(d.user));
	bar.append("text")
		.attr("y", (d) => y(d.amount) + yTextOffset)
		.attr("x", (d) => x(d.user) + x.rangeBand() / 2)
		.text((d) => d.amount);
});
