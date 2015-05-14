/*!
 * Start Bootstrap - Simple Sidebar HTML Template (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */


function initMenu() {
	$("#menutoggle").click(function(e) {
		e.preventDefault();
		console.log("PENIS");
		$("#wrapper").toggleClass("toggled");
		///$('#menu ul').hide();
	});
	$('#menu ul').hide();
	$('#menu ul').children('.current').parent().show();
	//$('#menu ul:first').show();
	$('#menu li a').click(function() {
		var checkElement = $(this).next();
		if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
			return false;
		}
		if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
			$('#menu ul:visible').slideUp('normal');
			checkElement.slideDown('normal');
			return false;
		}
	});
}

$(document).ready(function() {initMenu();});
