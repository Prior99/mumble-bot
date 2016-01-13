import d3 from "d3";
import $ from "jquery";

const width = $("#chart").width();
const height = $("#chart").height();
const maxRadius = Math.min(width, height) / 2;
const pie = d3.layout.pie()
	.sort(null)
	.value((d) => 1);
const perUserPie = d3.select("#chart")
	.append("g")
	.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

const hoursPerDay = 24;
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

d3.json("/api/stats/spokenperhour", (err, data) => {
	const dat = [];
	for(let i = 0; i < hoursPerDay; i++) {
		dat.push({
			hour : i,
			amount : 0
		});
	}
	data.forEach((d) => dat[d.hour].amount = new Date(d.amount).getTime());
	if(err) {
		throw err;
	}
	const maxDate = d3.max(data, (d) => new Date(d.amount).getTime());
	const d = perUserPie.append("g")
		.attr("class", "dat");
	const g = d.selectAll(".arc")
		.data(pie(dat))
		.enter().append("g")
		.attr("class", "arc");

	g.append("path")
		.attr("d", d3.svg.arc()
			.outerRadius((d, i) => (dat[i].amount/maxDate) * dataSizeInPixel + marginSizeInPixel)
			.innerRadius(marginSizeInPixel))
		.style("fill", "#3182BD");
	g.append("text")
		.attr("transform", (d, i) => {
			const angle = maxDegree * (dat[i].hour / hoursPerDay) + (maxDegree / hoursPerDay) / 2;
			d.innerRadius = textMarginSize * maxRadius;
			d.outerRadius = marginSize * maxRadius;
			return "translate(" + d3.svg.arc().centroid(d) + "), rotate(" + angle + ")";
		})
		.style("fill", "black")
		.attr("text-anchor", "middle")
		.text((d, i) => d.data.hour < 10 ? "0" + dat[i].hour : dat[i].hour);
	g.append("text")
		.attr("transform", (d, i) => {
			const angle = maxDegree * (dat[i].hour / hoursPerDay) + (maxDegree / hoursPerDay) / 2;
			d.innerRadius = (dat[i].amount/maxDate) * dataSizeInPixel + marginSizeInPixel;
			d.outerRadius = (dat[i].amount/maxDate + outerTextPaddingSize) * dataSizeInPixel + marginSizeInPixel;
			d.innerRadius = Math.max(d.innerRadius, maxRadius * marginSize);
			d.outerRadius = Math.max(d.outerRadius, maxRadius * outerTextMarginSize);
			return "translate(" + d3.svg.arc().centroid(d) + "), rotate(" + angle + ")";
		})
		.style("fill", "#FD8D3C")
		.style("font", "12px sans-serif")
		.style("font-weight", "bold")
		.attr("text-anchor", "middle")
		.text((d, i) => Math.round((dat[i].amount / millisecondsPerHour) * 10) / 10 + "h")
		.attr("class", "radius-value");
});
