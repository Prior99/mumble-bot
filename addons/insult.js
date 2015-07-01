var instrument = require("../src/instrument");

module.exports = function(bot) {
	var words = {
		attribute : [
			"hässlich",
			"stinkend",
			"miefend",
			"abgeranzt",
			"fett",
			"nutzlos",
			"wertlos",
			"käsig",
			"gammelig",
			"spermaschluckend",
			"penislutschend",
			"schwul",
			"behindert",
			"angekackt",
			"kackig",
			"fotzig",
			"müllig",
			"ranzig",
			"ölig",
			"pädophil",
			"cheatend",
			"fischig"
		],
		subject : [
			"es Stück Scheisse",
			"es Arschloch",
			"er Wichsfrosch",
			"e Sau",
			"es Schwein",
			"er Mongojunge",
			"er Kloputzer",
			"er Kackhaufen",
			"er Scheissefresser",
			"e Schwuchtel",
			"e Wurstuschi",
			"e Bitsch",
			"e Wichs hure",
			"er Spasti",
			"er Hurensohn",
			"er Spastiker",
			"er Behindi"
		],
		verb : [
			"Sterben",
			"Kacken",
			"Sperma Schlucken",
			"Gammeln",
			"Anschaffen",
			"Porree Essen",
			"Haaren",
			"Furzen",
			"Anal Einführen",
			"Lutschen",
			"Anranzen"
		],
		genitals : [
			"Vagina",
			"Eier",
			"Eichel",
			"Nippel",
			"Testikel",
			"Muschi",
			"Hoden",
			"Pickel"
		],
		genital_action : [
			"Leck",
			"Schleck",
			"Lutsch",
			"Friss",
			"Schnüffel",
			"Inhaliere",
			"Kraul"
		],
		genital_action_hurt : [
			"trete",
			"schlage",
			"ficke",
			"wichse",
			"kneife",
			"pieke",
			"beisse"
		]
	};

	var sentences = [
		'Geh {{verb}}, du {{attribute}}{{subject}}.',
		'{{attribute}}{{subject}}. Warum gehst du nicht einfach {{verb}}?',
		'Du bist {{attribute}}, du {{attribute}}{{subject}}.',
		'Ich {{genital_action_hurt}} dir in die {{genitals}}, du {{attribute}}{{subject}}.',
		'{{genital_action}} mir die {{genitals}}, {{attribute}}{{subject}}.',
		'Geh doch auf deine {{genitals}} {{verb}}, du {{attribute}}{{subject}}.',
		'Warum darf so ein {{attribute}}{{subject}} wie du überhaupt rumlaufen?'
	];

	bot.newCommand("insult", function() {
		bot.say(instrument(sentences, words));
	});
};
