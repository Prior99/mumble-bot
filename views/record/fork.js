import $ from "jquery";
import spawnNotification from "../notification";
import AudioAnalyzer from "../../src/audioanalyzer";
import Get from "../get";

const BUFFER_SIZE = 4096;

const jqCanvas = $("#fork-canvas");
const canvas = jqCanvas[0];
const width = canvas.width = jqCanvas.width();
const height = canvas.height = jqCanvas.height();
const ctx = canvas.getContext("2d");

const recordId = Get()["id"];

const context = new (window.AudioContext || window.webkitAudioContext)();

const loadAudio = function(record) {
	const samples = Math.ceil(context.sampleRate * record.duration);
	const samplesPerPixel = parseInt(samples / width);
	const list = [];
	const audio = new Audio("/api/record/download?id=" + recordId);
	const source = context.createMediaElementSource(audio);
	const scriptNode = context.createScriptProcessor(BUFFER_SIZE, 1, 1);
	const analyzer = new AudioAnalyzer(samplesPerPixel);
	scriptNode.onaudioprocess = (evt) => {
		if(evt.inputBuffer.length > 0) {
			const inputBuffer = evt.inputBuffer.getChannelData(0);
			const outputBuffer = evt.outputBuffer.getChannelData(0);
			analyzer.analyze(inputBuffer);
			analyzer.draw(canvas);
			for(let i = 0; i < inputBuffer.length; i++) {
				outputBuffer[i] = inputBuffer[i];
			}
		}
	};
	source.connect(scriptNode);
	scriptNode.connect(context.destination);
	audio.play();
	window.doNotGarbageCollectMe = scriptNode; // Workaround for garbagecollector.
};

$.ajax("/api/record/get?id=" + recordId)
.done((res) => loadAudio(res.record))
.error(() => spawnNotification("error", "Konnte Metadaten nicht laden."));
