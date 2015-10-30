var $ = require("jquery");
var spawnNotification = require("../notification");

$("#progress_wrapper").hide();
$(":file").change(function() {
	$("#progress_wrapper").show();
	$("form").hide();
	var formdata = new FormData($("form")[0]);

	var files = [];
	$("#progressbar_wrapper").html("");
	for(var i = 0; i < this.files.length; i++) {
		var file = this.files[i];
		var name = file.name;
		var row = $('<tr><td>' + name + '</td></tr>').append().appendTo("#filelist");
		var symbol = $('<td><span class="glyphicon glyphicon-upload" aria-hidden="true"></span></td>');
		symbol.appendTo(row);
		files[name] = {
			symbol: symbol,
			row : row
		};

	}

	var progress = {};
	progress.outer = $('<div class="progress"></div>').appendTo("#progressbar_wrapper");
	progress.inner = $('<div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100">').appendTo(progress.outer);

	function updateProgress(e) {
		if(e.lengthComputable) {
			var percent = parseInt((e.loaded/e.total)*100) +"%";
			progress.inner.css({"width" : percent});
		}
	}

	$.ajax({
		url : "/api/music/upload",
		type : "POST",
		xhr : function() {
			var xhr = $.ajaxSettings.xhr();
			if(xhr.upload) {
				xhr.upload.addEventListener("progress", updateProgress, false);
			}
			return xhr;
		},
		cache : false,
		data: formdata,
		processData: false,
		contentType : false,
		success : function(data) {
			if(data.okay) {
				for(var key in data) {
					var file = data[key];
					var elem = files[key];
					elem.symbol.remove();
					if(file.okay) {
						elem.symbol = $('<td><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></td>').appendTo(elem.row);
					}
					else {
						elem.symbol = $('<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>').appendTo(elem.row);
					}
				}
				$("form").show();
			}
			else {
				spawnNotification('error', "Sie verfügen nicht über die nötige Berechtigung, Musik hochzuladen.");
			}
		}
	});
});
