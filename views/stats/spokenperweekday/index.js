import d3 from "d3";
import $ from "jquery";

const width = $("#chart").width();
const height = $("#chart").height();
const maxRadius = Math.min(width, height) / 2;

const dataSize = 0.6;
const marginSize = 0.3;
const textMarginSize = 0.2;
const daysPerWeek = 7;
const maxDegree = 360;
const millisecondsPerHour = 3600000;
const outerTextMarginSize = 0.4;
const outerTextPaddingSize = 0.1;

const dataSizeInPixel = maxRadius * dataSize;
const marginSizeInPixel = maxRadius * marginSize;

const pie = d3.layout.pie()
	.sort(null)
	.value((d) => 1);
const chartPie = d3.select("#chart")
	.append("g")
	.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
d3.json("/api/stats/spokenperweekday", (err, data) => {
	if(err) {
		throw err;
	}
	const maxDate = d3.max(data, (d) => new Date(d.amount)).getTime();
	for(let i = 0; i < 7; i++) {
		data[i].num = i;
		data[i].amount = new Date(data[i].amount).getTime();
	}
	const d = chartPie.append("g")
		.attr("class", "dat");
	const g = d.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc");

	g.append("path")
		.attr("d", d3.svg.arc()
			.outerRadius((d, i) => (d.data.amount/maxDate) * dataSizeInPixel + marginSizeInPixel)
			.innerRadius(maxRadius * marginSize))
		.style("fill", "#3182BD");
	g.append("text")
		.attr("transform", (d, i) => {
			const angle = maxDegree * (d.data.num / daysPerWeek) + (maxDegree / daysPerWeek) / 2;
			d.innerRadius = textMarginSize * maxRadius;
			d.outerRadius = marginSizeInPixel;
			return "translate(" + d3.svg.arc().centroid(d) + "), rotate(" + angle + ")";
		})
		.style("fill", "black")
		.attr("text-anchor", "middle")
		.text((d, i) => d.data.day);
	g.append("text")
		.attr("transform", (d, i) => {
			const angle = maxDegree * (d.data.num / daysPerWeek) + (maxDegree / daysPerWeek) / 2;
			d.innerRadius = (d.data.amount/maxDate) * dataSizeInPixel + marginSizeInPixel;
			d.outerRadius = (d.data.amount/maxDate + outerTextPaddingSize) * dataSizeInPixel + marginSizeInPixel;
			d.innerRadius = Math.max(d.innerRadius, marginSizeInPixel);
			d.outerRadius = Math.max(d.outerRadius, maxRadius * outerTextMarginSize);
			return "translate(" + d3.svg.arc().centroid(d) + "), rotate(" + angle + ")";
		})
		.style("fill", "#FD8D3C")
		.style("font", "12px sans-serif")
		.style("font-weight", "bold")
		.attr("text-anchor", "middle")
		.text((d, i) => Math.round((d.data.amount / millisecondsPerHour) * 10) / 10 + "h")
		.attr("class", "radius-value");
});
