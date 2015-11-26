var $ = require("jquery");
var spawnNotification = require("../notification");

function updateProgress(e) {
	if(e.lengthComputable) {
		var percent = parseInt((e.loaded/e.total)*100) +"%";
		$(".progress-bar").css({"width" : percent});
	}
}

$("#progress_wrapper").hide();
$(":file").change(function() {
	$("#progress_wrapper").show();
	$("form").hide();
	var formdata = new FormData($("form")[0]);
	$.ajax({
		url : "/api/sounds/add",
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
		contentType : false
	})
	.done(function(res) {
		if(res) {
			$("form").show();
			$("#progress_wrapper").hide();
			spawnNotification('success', "Sound was uploaded.");
		}
	})
	.error(function(res) {
		$("form").show();
		spawnNotification('error', "Failed to upload sound.");
	});
});
