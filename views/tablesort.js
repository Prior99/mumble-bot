var $ = global.jQuery = require("jquery");
require("tablesorter/dist/js/jquery.tablesorter.js");
require("tablesorter/dist/js/jquery.tablesorter.widgets.js");

$.tablesorter.themes.custom = {
	table        : 'table table-striped',
	caption      : 'caption',
	icons        : '', // add "icon-white" to make them white; this icon class is added to the <i> in the header
	iconSortNone : 'fa fa-unsorted', // class name added to icon when column is not sorted
	iconSortAsc  : 'fa fa-sort-up', // class name added to icon when column has ascending sort
	iconSortDesc : 'fa fa-sort-down', // class name added to icon when column has descending sort
	filterRow    : '', // filter row class; use widgetOptions.filter_cssFilter for the input/select element
};
$.tablesorter.addParser({
	id: 'german-date',
	is: function(s) {
		return s.match(/\d{1,2}\.\d{1,2}\.\d{2,4}\s*(?:\d\{1,2}:\d{1,2}(?::\d{1,2})?)?/);
	},
	format: function(s) {
		var a = s.split(/\s/);
		var date, time = [0, 0, 0];
		date = a[0].split('.').map(function(e) {
			return parseInt(e);
		});
		// Haha this will break when more than 100 years of data is represented in the table
		date[2] = date[2] > 100 ? date[2] : 2000 + date[2];
		if(a.length > 1) {
			time = a[1].split(':').map(function(e) {
				return parseInt(e);
			});
			if(time.length < 3) {
				time[2] = 0;
			}
		}
		var time = new Date(parseInt(date[2]), // year
			date[1] - 1, // month
			date[0], //day
			time[0], //hour
			time[1], //minute
			time[2] //second
		);
		return time.getTime();
	},
	type: 'numeric'
});

var sortingHeaders = {}
$('th.no-sort').each(function(i, elem) {
	sortingHeaders[$(this).index()] = {
		sorter: false
	};
});
/*$('th.sort-date').each(function(i, elem) {
	sortingHeaders[$(this).index()] = {
		sorter: 'german-date'
	};
});*/
$('table.tablesorter').tablesorter({
	widgets : ['uitheme', 'columns'],
	theme : "custom",
	headers : sortingHeaders,
	headerTemplate : '{content} {icon}'
});
