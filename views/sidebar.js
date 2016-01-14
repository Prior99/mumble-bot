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
	/*$(".menu ul").hide();
	$(".menu ul").children(".current").parent().show();
	//$("#menu ul:first").show();
	$(".menu li a").click(function() {
		const checkElement = $(this).next();
		if((checkElement.is("ul")) && (checkElement.is(":visible"))) {
			return false;
		}
		if((checkElement.is("ul")) && (!checkElement.is(":visible"))) {
			$("#menu ul:visible").slideUp("normal");
			checkElement.slideDown("normal");
			return false;
		}
	});*/
}

$(document).ready(() => initMenu());
