/**
 * Provides a default view for a webpages which needs no special data.
 * @param {string} view - Name of the handlebars template to render.
 */
var ViewDefault = function(view) {
	return function(req, res) {
		res.render(view);
	}
};
module.exports = ViewDefault;
