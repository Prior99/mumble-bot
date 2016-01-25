import AudioAnalyzer from "../../src/audioanalyzer";

window._analyzerNodesDoNotGarbageCollect = [];

/**
 * Creates a new script processor node for the HTML 5 Web audio API which utilizes
 * the audioanalyzer to draw a neat image.
 * @param {AudioContext} context - HTML5 web audio context to use.
 * @param {Canvas} canvas - Canvas region to draw image onto.
 * @param {AudioBuffer} audioBuffer - HTML5 web audio buffer containing the media to draw.
 * @return {AudioNode} - The created script processor.
 */
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
