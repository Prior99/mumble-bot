module.exports = function(view) {
	return function(req, res) {
		res.render(view, {
			layout : "registerlogin"
		});
	}
};
