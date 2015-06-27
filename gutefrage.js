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
	var title = this._entities.decode($("h1.Question-title").html().trim());
	var text = this._entities.decode($("div.Question-body").find("div.formatted-text").find("p").html());
	callback(title, text);
};

var gf = new Gutefrage(["gesundheit", "ernaehrung"]);
gf.loadRandomNewQuestion(function(title, text) {
	console.log("Title: " + title);
	console.log("Text: " + text);
});
