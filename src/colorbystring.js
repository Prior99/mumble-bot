const RNG = require("rng-js");
const Color = require("onecolor");

module.exports = function(string) {
	const rng = new RNG(string);
	const hue = rng.uniform();
	const saturation = 1;
	const brightness = 0.4;
	const color = Color("#FFFFFF").hue(hue).saturation(saturation).lightness(brightness).hex();
	return color;
};
