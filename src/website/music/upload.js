function render(req, res) {
	res.render('music/upload', {
	});
}

module.exports = function() {
	return render;
};
