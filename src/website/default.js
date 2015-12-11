/**
 * A view renderer which can be used with express.
 * @callback ViewRenderer
 * @see the documentation of express.
 * @param {object} req - The request object.
 * @param {object} res - The response to send.
 * @return {undefined}
 */

/**
 * Provides a default view for a webpages which needs no special data.
 * @param {string} view - Name of the handlebars template to render.
 * @return {ViewRenderer} - A renderer rendering the default view without any additional data.
 */
const ViewDefault = function(view) {
	return function(req, res) {
		res.render(view);
	}
};
export default ViewDefault;
