import d3 from "d3";
import $ from"jquery";

const legendColorRectSize = 18;
const legendWidth = 150;
const legendRowHeight = 20;
const legendXOffset = 24;
const legendYOffset = 9;
const transitionDurationSlow = 200;
const transitionDurationFast = 100;
const percentFactor = 100;

const dataPart = 0.8;
const innerMarginPart = 0.4;

const dataPartHover = 0.5;
const innerMarginPartHover = 0.9;

const width = $("#perUserPieChart").width();
const height = $("#perUserPieChart").height();
const radius = Math.min(width - legendWidth, height) / 2;
const color = d3.scale.category20c();

const arc = d3.svg.arc()
	.outerRadius(radius * dataPart)
	.innerRadius(radius * innerMarginPart);

const arcOver = d3.svg.arc()
	.innerRadius(radius * dataPartHover)
	.outerRadius(radius * innerMarginPartHover);

const pie = d3.layout.pie()
	.sort(null)
	.value((d) => d.amount);


const perUserPie = d3.select("#perUserPieChart")
	.append("g")
	.attr("transform", "translate(" + ((width - legendWidth) / 2) + "," + (height / 2) + ")");
d3.json("/api/stats/recordsperuser", (err, data) => {
	if(err) {
		throw err;
	}
	let total = 0;
	data.forEach((d) => total += d.amount);
	const textTop = perUserPie.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.attr("class", "textTop")
		.text("Gesamt")
		.attr("y", -10);
	const textBottom = perUserPie.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.attr("class", "textBottom")
		.text("" + total)
		.attr("y", 10);
	const dat = perUserPie.append("g")
		.attr("class", "dat");
	const g = dat.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc")
		.on("mouseover", function(d) {
			d3.select(this).select("path").transition()
				.duration(transitionDurationSlow)
				.attr("d", arcOver);
			textTop.text(d3.select(this).datum().data.user)
				.attr("y", -10);
			textBottom.text(parseInt((d3.select(this).datum().data.amount / total) * percentFactor) + "%")
				.attr("y", 10);
		})
		.on("mouseout", function(d) {
			d3.select(this).select("path").transition()
				.duration(transitionDurationFast)
				.attr("d", arc);
			textTop.text("Gesamt")
				.attr("y", -10);
			textBottom.text(total);
		});

	g.append("path")
		.attr("d", arc)
		.style("fill", (d) => color(d.data.user));
	const legendLeft = width - legendWidth;
	const legendTop = (height - (data.length * legendRowHeight)) / 2;
	const legend = d3.select("#perUserPieChart").append("svg")
		.attr("class", "legend")
		.attr("transform", "translate(" + legendLeft +"," + legendTop + ")")
		.selectAll("g")
		.data(data)
		.enter().append("g")
			.attr("transform", (d, i) => "translate(0," + (i * legendRowHeight) + ")");
	legend.append("rect")
		.attr("width", legendColorRectSize)
		.attr("height", legendColorRectSize)
		.style("fill", (d, i) => color(d.user));

	legend.append("text")
		.attr("x", legendXOffset)
		.attr("y", legendYOffset)
		.attr("dy", ".35em")
		.text((d) => d.user);
});
