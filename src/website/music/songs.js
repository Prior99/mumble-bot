function render(req, res) {
	res.render('music/songs', {
	});
}

module.exports = function() {
	return render;
};
