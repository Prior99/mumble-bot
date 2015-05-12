var bot;

function render(req, res) {
	res.render('music/playlist');
}

module.exports = function(b) {
	bot = b;
	return render;
};
