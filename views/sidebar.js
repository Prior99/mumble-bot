import $ from "jquery";

/**
 * Initialize sidebar menu.
 * @return {undefined}
 */
const initMenu = function() {
	$("#menutoggle").click((e) => {
		e.preventDefault();
		$("#wrapper").toggleClass("toggled");
	});
	$("#menu ul").hide();
	$("#menu ul").children(".current").parent().show();
	//$("#menu ul:first").show();
	$("#menu li a").click(function() {
		const checkElement = $(this).next();
		if((checkElement.is("ul")) && (checkElement.is(":visible"))) {
			return false;
		}
		if((checkElement.is("ul")) && (!checkElement.is(":visible"))) {
			$("#menu ul:visible").slideUp("normal");
			checkElement.slideDown("normal");
			return false;
		}
	});
}

$(document).ready(() => initMenu());
