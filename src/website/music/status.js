var bot;

function render(req, res) {
	res.render('music/status');
}

module.exports = function(b) {
	bot = b;
	return render;
};
