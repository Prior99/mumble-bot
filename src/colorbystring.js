var RNG = require('rng-js');
var Color = require('onecolor');

module.exports = function(string) {
	var rng = new RNG(string);
	var hue = rng.uniform();
	var saturation = 1;
	var brightness = 0.4;
	var color = Color("#FFFFFF").hue(hue).saturation(saturation).lightness(brightness).hex();
	return color;
};
