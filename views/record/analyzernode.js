import AudioAnalyzer from "../../src/audioanalyzer";

window._analyzerNodesDoNotGarbageCollect = [];

export default function(context, canvas, audioBuffer) {
	const samples = audioBuffer.length;
	const samplesPerPixel = parseInt(samples / canvas.width);
	const scriptNode = context.createScriptProcessor(4096, 1, 1);
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
	window._analyzerNodesDoNotGarbageCollect.push(scriptNode);
	return scriptNode;
};
