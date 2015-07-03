var Cheerio = require('cheerio');
var Request = require('request');
var Entities = require('html-entities').XmlEntities;

var BASE_URL = "http://www.gutefrage.net";

var Gutefrage = function(categories) {
	this._known = [];
	this._categories = categories;
	this._entities = new Entities();
};

Gutefrage.prototype.loadRandomNewQuestion = function(callback) {
	var category = this._categories[Math.floor(this._categories.length * Math.random())];
	Request(BASE_URL + "/fragen/neue/" + category + "/1", function(err, response, html) {
		if(err) {
			if(callback) { callback(err); }
			else { throw err; }
		}
		else {
			this._loadHTML(Cheerio.load(html), callback);
		}
	}.bind(this));
};

Gutefrage.prototype._loadHTML = function($, callback) {
	var possibilities = [];
	var articles = $("article");
	for(var i in articles) {
		var article = articles[i];
		try {
			var url =$(article).find("a.QuestionTeaser-title").attr("href");
			if(url !== undefined && this._known.indexOf(url) === -1) {
				possibilities.push(url);
			}
		}
		catch(e) {

		}
	}
	var url = possibilities[Math.floor(Math.random() * possibilities.length)];
	this._loadArticle(url, callback);
};

Gutefrage.prototype._loadArticle = function(url, callback) {
	Request(BASE_URL + url, function(err, response, html) {
		if(err) {
			if(callback) { callback(err); }
			else { throw err; }
		}
		else {
			this._loadArticleHTML(Cheerio.load(html), callback);
		}
	}.bind(this));
};

Gutefrage.prototype._loadArticleHTML = function($, callback) {
	var title = $("h1.Question-title").html();
	var text = $("div.Question-body").find("div.formatted-text").find("p").html();
	if(title && text) {
		title = this._entities.decode($("h1.Question-title").html().trim());
		text = this._entities.decode($("div.Question-body").find("div.formatted-text").find("p").html());
		callback(null, title, text);
	}
	else {
		callback(new Error("Unable to parse question"));
	}
};

module.exports = function(bot) {
	var gf = new Gutefrage(["sex", "schwangerschaft", "abnehmen", "pickel", "maedchen", "geschlecht", "geschlechtsverkehr", "pubertaet", "mode", "hilfe", "jungs"]);
	bot.newCommand("question", function() {
		var callback = function(err, title, text) {
			if(err) {
				gf.loadRandomNewQuestion(callback);
			}
			else {
				bot.say(title + " " + text);
			}
		}
		gf.loadRandomNewQuestion(callback);
		bot.say("Bitte warten.");
	}, "Liest eine zufällige Frage von der Webseite \"gutefrage.net\" vor.", "question-circle");
};
