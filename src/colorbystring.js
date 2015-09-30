var RNG = require('rng-js');
var Color = require('onecolor');

module.exports = function(string) {
	var rng = new RNG(string);
	var hue = rng.uniform();
	var saturation = rng.uniform() / 3 + 0.6666;
	var brightness = rng.uniform() / 2;
	var color = Color("#FFFFFF").hue(hue).saturation(saturation).lightness(brightness).hex();
	return color;
};
