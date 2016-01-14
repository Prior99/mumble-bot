import $ from "jquery";
import WebSocket from "ws"; //returns global.WebSocket
import * as Handlebars from "handlebars";
import Moment from "moment";

Handlebars.registerHelper("queueSymbol", (item) => {
	if(item.type === "speech") {
		return "pencil";
	}
	else if(item.type === "sound") {
		if(item.meta.type === "cached") {
			return "eye";
		}
		else if(item.meta.type === "record") {
			return "microphone";
		}
		else if(item.meta.type === "sound") {
			return "volume-up";
		}
		else if(item.meta.type === "dialog") {
			return "sort-amount-desc";
		}
	}
});

Handlebars.registerHelper("queueTitle", (item) => {
	if(item.type === "speech") {
		return "Sprache";
	}
	else if(item.type === "sound") {
		if(item.meta.type === "cached") {
			return "Vorschau";
		}
		else if(item.meta.type === "record") {
			return "Aufnahme";
		}
		else if(item.meta.type === "sound") {
			return "Sound";
		}
		else if(item.meta.type === "dialog") {
			return "Dialogabschnitt";
		}
	}
});

Handlebars.registerHelper("queueDescription", (item) => {
	if(item.type === "speech") {
		return item.text;
	}
	else if(item.type === "sound") {
		if(item.meta.type === "cached") {
			return "";
		}
		else if(item.meta.type === "record") {
			return item.meta.details.quote;
		}
		else if(item.meta.type === "sound") {
			return item.meta.details.name;
		}
		else if(item.meta.type === "dialog") {
			return "Dialogabschnitt.";
		}
	}
});
Handlebars.registerHelper("queueTime", (item) => Moment(item.date).format("HH:mm:ss"));

Handlebars.registerHelper("queueAuthor", (item) => {
	if(item.type === "speech") {
		return "-";
	}
	else if(item.type === "sound") {
		return item.meta.user.username;
	}
});

const LiveQueueTemplate = Handlebars.compile($("#template-livequeue").html());

let url = location.origin.replace("http", "ws") + "/livequeue";
let queue = [];

const ws = new WebSocket(url);

const refresh = function() {
	$("#livequeuecontainer").html(LiveQueueTemplate({
		queue
	}));
}

ws.onmessage = function(msg) {
	const obj = JSON.parse(msg.data);
	if(obj.action === "initial") {
		queue = obj.data;
	}
	else if(obj.action === "dequeue") {
		queue.shift();
	}
	else if(obj.action === "enqueue") {
		queue.push(obj.data);
	}
	else if(obj.action === "clear") {
		queue = [];
	}
	refresh();
};
