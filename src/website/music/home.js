var bot;

function render(req, res) {
	res.render('home', {
		name : bot.options.name
	});
}

module.exports = function(b) {
	bot = b;
	return render;
};
