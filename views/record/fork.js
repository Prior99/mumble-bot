import $ from "jquery";
import spawnNotification from "../notification";
import Get from "../get";
import AnalyzerNode from "./analyzernode";
import Handlebars from "handlebars";
import Moment from "moment";

Handlebars.registerHelper("formatDate", (date) => Moment(date).format("DD.MM.YY"));
Handlebars.registerHelper("formatTime", (date) => Moment(date).format("HH:mm"));
Handlebars.registerHelper("fixed2", (number) => number.toFixed(2));
const RecordInfoTemplate = Handlebars.compile($("#record-template").html());

const BUFFER_SIZE = 4096;

const jqCanvas = $("#fork-canvas");
const canvas = jqCanvas[0];
let width;
let height;
const ctx = canvas.getContext("2d");

const recordId = Get()["id"];
let audio;
const context = new (window.AudioContext || window.webkitAudioContext)();

let dragStart, slideTarget;

const sliderBegin = $(".slider-begin");
const sliderEnd = $(".slider-end");
const sliderIndicator = $(".slider-indicator");
const boxLeft = $(".box-left");
const boxRight = $(".box-right");

let position = {
	begin : 0.1,
	end : 0.9,
	indicator: 0.0
};

const createSliderScriptNode = function() {
	const scriptNode = context.createScriptProcessor(1024, 1, 1);
	scriptNode.onaudioprocess = (evt) => {
		const inputBuffer = evt.inputBuffer.getChannelData(0);
		const outputBuffer = evt.outputBuffer.getChannelData(0);
		position.indicator += evt.inputBuffer.duration / audio.duration;
		updateSliderPositions();
		for(let i = 0; i < inputBuffer.length; i++) {
			outputBuffer[i] = inputBuffer[i];
		}
	};
	window.fixGarbageCollectionBug = scriptNode;
	return scriptNode;
};

const relativeTime = function(rel) {
	const time = rel * audio.duration;
	return time.toFixed(1) + "s";
};

const updateSliderPositions = function() {
	if(position.begin > 1) { position.begin = 1; }
	if(position.begin < 0) { position.begin = 0; }
	if(position.end > 1) { position.end = 1; }
	if(position.end < 0) { position.end = 0; }
	if(position.begin > position.end) { [position.end, position.begin] = [position.begin, position.end]; }
	const leftSliderCSSPosition = (position.begin * width);
	const rightSliderCSSPosition = (position.end * width);
	sliderBegin.css({
		left : leftSliderCSSPosition + "px"
	})
	.find(".head").html(relativeTime(position.begin));
	sliderEnd.css({
		left : rightSliderCSSPosition + "px"
	})
	.find(".head").html(relativeTime(position.end));
	sliderIndicator.css({
		left : (position.indicator * width) + "px"
	});
	boxLeft.css({
		left : "0px",
		width : leftSliderCSSPosition + "px"
	});
	boxRight.css({
		left : rightSliderCSSPosition + "px",
		width : (width - rightSliderCSSPosition) + "px"
	});

};


sliderBegin.on("mousedown", (evt) => {
	evt.preventDefault();
	evt.stopPropagation();
	dragStart = evt.clientX;
	slideTarget = "begin";
});
sliderEnd.on("mousedown", (evt) => {
	evt.preventDefault();
	evt.stopPropagation();
	dragStart = evt.clientX;
	slideTarget = "end";
});

$(document).on("mouseup", (evt) => {
	slideTarget = null;
});

$(document).on("mousemove", (evt) => {
	if(!audio) {
		return;
	}
	const diff = evt.clientX - dragStart;
	const relativeDiff = diff / width;
	if(slideTarget === "begin") {
		position.begin += relativeDiff;
	}
	else if(slideTarget === "end") {
		position.end += relativeDiff;
	}
	dragStart = evt.clientX;
	updateSliderPositions();
});

const playback = function(start, end, nodes) {
	if(typeof start === "undefined") {
		start = 0;
	}
	if(typeof end === "undefined") {
		end = audio.duration;
	}
	if(!nodes) {
		nodes = [];
	}
	position.indicator = start / audio.duration;
	const source = context.createBufferSource();
	source.buffer = audio;
	setTimeout(() => {
		$("#play").removeClass("disabled");
		position.indicator = 0;
		for(const node of nodes) {
			node.disconnect();
		}
		source.stop();
	}, (end - start) * 1000);
	const indicatorUpdateNode = createSliderScriptNode();
	nodes.push(indicatorUpdateNode);
	let lastNode = source;
	for(const node of nodes) {
		lastNode.connect(node);
		lastNode = node;
	}
	lastNode.connect(context.destination);
	source.start(0, start, end - start);
	$("#play").addClass("disabled");
}

$("#play").click((evt) => {
	evt.preventDefault();
	evt.stopPropagation();
	if($(evt.currentTarget).hasClass("disabled")) {
		return;
	}
	const begin = position.begin * audio.duration;
	const end = position.end * audio.duration;
	playback(begin, end);
});

const loadAudio = function(buffer) {
	context.decodeAudioData(buffer, (audioBuffer) => {
		if(audioBuffer) {
			drawAudio(audioBuffer);
		}
		else {
			spawnNotification("error", "Konnte Audio nicht dekodieren.");
		}
	});
};

const drawScale = function() {
	const grayHeight = 40;
	const ticks = audio.duration / 100;

	const jqScaleCanvas = $("#timeline-canvas");
	const scaleCanvas = jqScaleCanvas[0];
	const scaleCtx = scaleCanvas.getContext("2d");
	// Set height of canvas fitting css dimensions
	scaleCanvas.width = jqScaleCanvas.width();
	scaleCanvas.height = jqScaleCanvas.height();
	// Fill top rect
	scaleCtx.fillStyle = "#555"
	scaleCtx.fillRect(0, 0, scaleCanvas.width, grayHeight);
	// Configure font on context
	scaleCtx.strokeStyle = scaleCtx.fillStyle = "white";
	scaleCtx.font = (grayHeight / 2 - 2) + "px Helvetica";
	scaleCtx.textAlign = "center";

	const pixelsPerSecond = scaleCanvas.width / audio.duration;
	for(let i = 0; i < 100; i++) {
		let y;
		const x = i * ticks * pixelsPerSecond;
		if(i % 10 === 0) { // Every 10 ticks draw a major tick
			scaleCtx.lineWidth = 2;
			y = grayHeight / 2;
			if(i != 0 && i != 100) {
				const text = i * ticks;
				scaleCtx.fillText(text.toFixed(1) + "s", x, grayHeight / 2 - 4);
			}
		}
		else {
			y = (grayHeight / 4) * 3;
			scaleCtx.lineWidth = 1;
		}
		// Draw top line
		scaleCtx.beginPath();
		scaleCtx.strokeStyle = "white";
		scaleCtx.moveTo(x, y);
		scaleCtx.lineTo(x, grayHeight);
		scaleCtx.stroke();
		// Draw bottom line
		scaleCtx.strokeStyle = "#DDD";
		scaleCtx.lineTo(x, scaleCanvas.height);
		scaleCtx.stroke();
	}
};

const drawAudio = function(audioBuffer) {
	const analyzerNode = AnalyzerNode(context, canvas, audioBuffer);
	audio = audioBuffer;
	playback(0, audio.duration, [analyzerNode]);
	drawScale();
	updateSliderPositions();
};


$.ajax("/api/record/get?id=" + recordId)
.done((res) => {
	$("#record-info").html(RecordInfoTemplate({
		record : res.record
	}));
	$("#description").html("[Edited] " + res.record.quote);
	width = canvas.width = jqCanvas.width();
	height = canvas.height = jqCanvas.height();
	const request = new XMLHttpRequest();
	request.open("GET", "/api/record/download?id=" + recordId, true);
	request.responseType = "arraybuffer";
	request.onload = () => loadAudio(request.response);
	request.onerror = () => spawnNotification("error", "Konnte Audio nicht laden.");
	request.send();
});
