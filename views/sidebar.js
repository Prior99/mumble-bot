import $ from "jquery";

/**
 * Initialize sidebar menu.
 * @return {undefined}
 */
const initMenu = function() {
	$("#menutoggle").click((e) => {
		e.preventDefault();
		if($("#wrapper").hasClass("left-toggled")) {
			$("#wrapper").removeClass("left-toggled");
		}
		else {
			$("#wrapper").addClass("left-toggled");
			$("#wrapper").removeClass("right-toggled");
		}
	});
	$("#widgetstoggle").click((e) => {
		e.preventDefault();
		if($("#wrapper").hasClass("right-toggled")) {
			$("#wrapper").removeClass("right-toggled");
		}
		else {
			$("#wrapper").addClass("right-toggled");
			$("#wrapper").removeClass("left-toggled");
		}
	});
}

$(document).ready(() => initMenu());
