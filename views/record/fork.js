import $ from "jquery";
import spawnNotification from "../notification";
import Get from "../get";
import AnalyzerNode from "./analyzernode";

const BUFFER_SIZE = 4096;

const jqCanvas = $("#fork-canvas");
const canvas = jqCanvas[0];
const width = canvas.width = jqCanvas.width();
const height = canvas.height = jqCanvas.height();
const ctx = canvas.getContext("2d");

const recordId = Get()["id"];
let audio;
const context = new (window.AudioContext || window.webkitAudioContext)();

let dragStart, slideTarget;
const sliderBegin = $(".slider-begin");
const sliderEnd = $(".slider-end");
let position = {
	begin : 0.1,
	end : 0.9
};

const relativeTime = function(rel) {
	const time = rel * audio.duration;
	return time.toFixed(1) + "s";
}

const updateSliderPositions = function() {
	if(position.begin > 1) { position.begin = 1; }
	if(position.begin < 0) { position.begin = 0; }
	if(position.end > 1) { position.end = 1; }
	if(position.end < 0) { position.end = 0; }
	if(position.begin > position.end) { [position.end, position.begin] = [position.begin, position.end]; }
	sliderBegin.css({
		left : (position.begin * width) + "px"
	})
	.find(".head").html(relativeTime(position.begin));
	sliderEnd.css({
		left : (position.end * width) + "px"
	})
	.find(".head").html(relativeTime(position.end));
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

$("#play").click((evt) => {
	/*if($(evt.currentTarget).hasClass("disabled")) {
		return;
	}*/
	const begin = position.begin * audio.duration;
	const end = position.end * audio.duration;
	const source = context.createBufferSource();
	source.buffer = audio;
	source.onended = () => $("#play").removeClass("disabled");
	source.connect(context.destination);
	source.start(0, begin, end - begin);
	$("#play").addClass("disabled");
});

const loadAudio = function(buffer) {
	context.decodeAudioData(request.response, (audioBuffer) => {
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
	const source = context.createBufferSource();
	const analyzerNode = AnalyzerNode(context, canvas, audioBuffer);
	audio = audioBuffer;
	source.buffer = audioBuffer;
	source.connect(analyzerNode);
	analyzerNode.connect(context.destination);
	source.onended = () => {
		console.log("Onended");
		$("#play").removeClass("disabled");
	};
	source.start(0);
	drawScale();
	updateSliderPositions();
};

const request = new XMLHttpRequest();
request.open("GET", "/api/record/download?id=" + recordId, true);
request.responseType = "arraybuffer";
request.onload = () => loadAudio(request.response);
request.onerror = () => spawnNotification("error", "Konnte Audio nicht laden.");
request.send();
