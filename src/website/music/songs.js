var bot;

function render(req, res) {
	res.render('music/songs');
}

module.exports = function(b) {
	bot = b;
	return render;
};
