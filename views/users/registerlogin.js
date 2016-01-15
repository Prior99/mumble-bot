import $ from "jquery";
import "bootstrap";

$('#tabscontainer a').click((e) => {
	e.preventDefault();
	$(e.currentTarget).tab('show');
})
