import $ from "jquery";
import spawnNotification from "../notification";
import * as WebSocket from "ws"; //returns global.WebSocket
import * as Handlebars from "handlebars";
import * as Moment from "moment";

Handlebars.registerHelper("formatDate", (date) => Moment(date).format("DD.MM.YY"));
Handlebars.registerHelper("formatTime", (date) => Moment(date).format("HH:mm:ss"));
Handlebars.registerHelper("bootstrapClassIfProtected", (audio) => {
	if(audio.protected) {
		return "warning";
	}
	else {
		return "";
	}
});

const ListTemplate = Handlebars.compile($("#template-cached").html());

let url = location.href.replace("http", "ws");
let list = [];
let paused = false;

if(url.substr(-1) === "/") {
	url = url.substr(0, url.length - 1);
}

const ws = new WebSocket(url);

/**
 * Refresh the list with the currently cached audios.
 * Reads the data from the list and recreates the view from the template and the data.
 * @return {undefined}
 */
const refreshList = function() {
	if(!paused) {
		$("#cachedtable").html(ListTemplate({
			cached : list.sort((a, b) => {
				if(a.protected && !b.protected) {
					return -1;
				}
				else if(!a.protected && b.protected) {
					return 1;
				}
				else {
					return new Date(b.date) - new Date(a.date);
				}
			})
		}));
	}
}
/**
 * An object representing one single cached audio file.
 * @typedef CachedAudio
 * @property {boolean} protected - True when the audio was protected by someone.
 * @property {date} date - Date when the audio was recorded.
 * @property {number} duration - Duration of the audio file in seconds.
 * @property {number} id - Unique id.
 * @property {DatabaseUser} user - User from which the audio was recorded.
 */
/**
 * Initialize the page after the loading was done.
 * @param {object} obj - The initial object received from the server on connection startup.
 * @param {CachedAudio[]} obj.list - list of cached audios currently in the queue.
 * @return {undefined}
 */
const init = function(obj) {
	$("#loading").remove();
	$("#cached").show();
	list = obj.list;
	refreshList();
}

/**
 * Add a new audio to the list of audios and refresh the view.
 * @param {CachedAudio} obj - Audio to add.
 * @return {undefined}
 */
const add = function(obj) {
	list.unshift(obj);
	refreshList();
}

/**
 * Removes an audio from the list of audios and refresh the view.
 * @param {number} id - Unique id of the audio to remove.
 * @return {undefined}
 */
const remove = function(id) {
	list = list.filter((elem) => elem.id !== id);
	refreshList();
}


/**
 * Protects an audio in the list of audios and refresh the view.
 * @param {number} id - Unique id of the audio to protect.
 * @return {undefined}
 */
const protect = function(id) {
	const e = list.find((elem) => elem.id === id);
	if(e) {
		e.protected = true;
	}
	refreshList();
}

/**
 * Pause refreshing the view.
 * @return {undefined}
 */
const pause = function() {
	paused = true;
	$(".pauseicon").find("i").removeClass("fa-play");
	$(".pauseicon").find("i").addClass("fa-pause");
}

/**
 * Unpause refreshing the view.
 * @return {undefined}
 */
const unpause = function() {
	paused = false;
	$(".pauseicon").find("i").removeClass("fa-pause");
	$(".pauseicon").find("i").addClass("fa-play");
	refreshList();
}

ws.onmessage = function(msg) {
	const obj = JSON.parse(msg.data);
	if(obj.type === "init") {
		init(obj);
	}
	else if(obj.type === "add") {
		add(obj.audio);
	}
	else if(obj.type === "remove") {
		remove(obj.id);
	}
	else if(obj.type === "protect") {
		protect(obj.id);
	}
	else {
		throw new Error("Received packet of invalid type:" + obj.type);
	}
};

$("#cachedtable").mouseenter(() => pause());
$("#cachedtable").mouseleave(() => unpause());

ws.onopen = () => {
	$("#description").html("Warte auf Liste von Aufnahmen...");
};

$(document).on("click", "a.protectbutton", (e) => {
	const id = $(e.currentTarget).attr("soundId");
	const t = $(e.currentTarget);
	$.ajax("/api/record/protect?id=" + id)
		.done((response) => spawnNotification("success", "Aufnahme geschützt."))
		.error(() => spawnNotification("error", "Schützen fehlgeschlagen."));
});
$(document).on("click", "a.deletebutton", (e) => {
	const id = $(e.currentTarget).attr("soundId");
	const t = $(e.currentTarget);
	$.ajax("/api/record/deletecached?id=" + id)
		.done((response) => spawnNotification("success", "Aufnahme gelöscht."))
		.error(() => spawnNotification("error", "Konnte Aufnahme nicht löschen."));
});
$(document).on("click", "a.playbutton", (e) => {
	const id = $(e.currentTarget).attr("soundId");
	$.ajax("/api/record/playcached?id=" + id)
		.done((response) => {
			if(response.okay) {
				spawnNotification("success", "Datei erfolgreich wiedergegeben!");
			}
		})
		.error(() => spawnNotification("error", "Konnte Datei nicht abspielen."));
});
