import $ from "jquery";
import * as spawnNotification from "../notification";

$("#progress_wrapper").hide();
$(":file").change(() => {
	$("#progress_wrapper").show();
	$("form").hide();
	const formdata = new FormData($("form")[0]);

	const files = [];
	$("#progressbar_wrapper").html("");
	for(let i = 0; i < this.files.length; i++) {
		const file = this.files[i];
		const name = file.name;
		const row = $("<tr><td>" + name + "</td></tr>").append().appendTo("#filelist");
		const symbol = $("<td><span class='glyphicon glyphicon-upload' aria-hidden='true'></span></td>");
		symbol.appendTo(row);
		files[name] = {
			symbol,
			row
		};
	}

	const progress = {};
	progress.outer = $("<div class='progress'></div>").appendTo("#progressbar_wrapper");
	progress.inner =
		$("<div class='progress-bar' role='progressbar' aria-valuenow='60' aria-valuemin='0' aria-valuemax='100'>");
	progress.inner.appendTo(progress.outer);

	/**
	 * Update the progressbar when a new XHR event is received.
	 * @param {event} e - The event from the XHR handler.
	 * @return {undefined}
	 */
	const updateProgress = function(e) {
		const percent = 100;
		if(e.lengthComputable) {
			const percent = parseInt((e.loaded/e.total) * percent) + "%";
			progress.inner.css({"width" : percent});
		}
	}

	$.ajax({
		url : "/api/music/upload",
		type : "POST",
		xhr() {
			const xhr = $.ajaxSettings.xhr();
			if(xhr.upload) {
				xhr.upload.addEventListener("progress", updateProgress, false);
			}
			return xhr;
		},
		cache : false,
		data: formdata,
		processData: false,
		contentType : false,
		success(data) {
			if(data.okay) {
				for(const key in data) {
					if(data.hasOwnProperty(key)) {
						const file = data[key];
						const elem = files[key];
						elem.symbol.remove();
						if(file.okay) {
							elem.symbol =
								$("<td><span class='glyphicon glyphicon-ok' aria-hidden='true'></span></td>");
							elem.symbol.appendTo(elem.row);
						}
						else {
							elem.symbol =
								$("<td><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></td>");
							elem.symbol.appendTo(elem.row);
						}
					}
				}
				$("form").show();
			}
			else {
				spawnNotification("error", "Sie verfügen nicht über die nötige Berechtigung, Musik hochzuladen.");
			}
		}
	});
});
