import $ from "jquery";
import * as spawnNotification from "../notification";

/**
 * Update the progressbar with an event emitted from the upload.
 * @param {object} e - Event emitted from XHR.
 * @return {undefined}
 */
const updateProgress = function(e) {
	const percent = 100;
	if(e.lengthComputable) {
		const percent = parseInt((e.loaded / e.total) * percent) + "%";
		$(".progress-bar").css({"width" : percent});
	}
}

$("#progress_wrapper").hide();
$(":file").change(() => {
	$("#progress_wrapper").show();
	$("form").hide();
	const formdata = new FormData($("form")[0]);
	$.ajax({
		url : "/api/sounds/add",
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
		contentType : false
	})
	.done((res) => {
		if(res) {
			$("form").show();
			$("#progress_wrapper").hide();
			spawnNotification("success", "Sound was uploaded.");
		}
	})
	.error((res) => {
		$("form").show();
		spawnNotification("error", "Failed to upload sound.");
	});
});
