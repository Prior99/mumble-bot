function render(req, res) {
	res.render('music/playlist', {
	});
}

module.exports = function() {
	return render;
};
