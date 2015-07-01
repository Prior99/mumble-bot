var MULTIPLICATOR_PROXIMITY = 0.1;

function rd(arr) {
	var r = Math.random();
	return arr[parseInt(r*arr.length)];
}

var instrument = function(strings, words) {
	var regex = /\{\{(.*?)\}\}/;
	var res;
	var string = rd(strings);
	while((res = regex.exec(string)) !== null) {
		var group = res[0];
		var key = res[1];
		var index = res.index;
		if(words[key] !== undefined) {
			var val = rd(words[key]);
			if(words.multiplicators !== undefined &&
				Math.random() < MULTIPLICATOR_PROXIMITY) {
				var multi = rd(words.multiplicators);
				val = multi + " " + val;
			}
			string = string.substr(0, index) + val +
			string.substr(index + group.length, string.length);
		}
		else {
			return 'UNDEFINED TEMPLATE: ' + group;
		}
	}
	return string;
};

module.exports = instrument;
