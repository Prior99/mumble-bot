import $ from "jquery";
import spawnNotification from "../notification";
import AudioAnalyzer from "../../src/audioanalyzer";
import Get from "../get";

const recordId = Get()["id"];
const context = new (window.AudioContext || window.webkitAudioContext)(); // Create the audio context.
const jqCanvas = $("#fork-canvas");
const canvas = jqCanvas[0];
const ctx = canvas.getContext("2d");
const width = canvas.width = jqCanvas.width();
const height = canvas.height = jqCanvas.height();
let audioBuffer;
let analyzer;

const scriptNode = context.createScriptProcessor(4096, 1, 1);
scriptNode.onaudioprocess = (evt) => {
	const inputBuffer = evt.inputBuffer.getChannelData(0);
	const outputBuffer = evt.outputBuffer.getChannelData(0);
	analyzer.analyze(inputBuffer);
	canvas.getContext("2d").clearRect(0, 0, width, height);
	analyzer.finish(canvas);
	for(let i = 0; i < inputBuffer.length; i++) {
		outputBuffer[i] = inputBuffer[i];
	}
};

const audioDecoded = (buffer) => {
	audioBuffer = buffer;
	let samplesPerPixel = parseInt(buffer.length / width);
	analyzer = new AudioAnalyzer(samplesPerPixel);
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(scriptNode);
	scriptNode.connect(context.destination);
	source.onended = () => analyzer.finish(canvas);
	source.start(0);
};

const loadAudio = (data) => {
	context.decodeAudioData(data, (buffer) => {
		if(!buffer) {
			spawnNotification("error", "Fehler beim Decodieren der Aufnahme.")
		}
		else {
			audioDecoded(buffer);
		}
	});
};

const request = new XMLHttpRequest();
request.open("GET", "/api/record/download?id=" + recordId, true);
request.responseType = "arraybuffer";
request.onload = () => loadAudio(request.response);
request.onerror = () => spawnNotification("error", "Konnte Aufnahme nicht laden.");
request.send();
