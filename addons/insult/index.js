var instrument = require("../instrument");

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
			"fischig",
			"dumm",
			"hirnrissig",
			"gehirnamputiert",
			"bekloppt"
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
			"er Behindi",
			"er Arschficker",
			"er Mösenfurz",
			"er Sackpickel",
			"es Mistschwein",
			"er Mongowixer",
			"er Pisser"
		],
		food : [
			"Käse",
			"Wurst",
			"Schokolade",
			"Nutella",
			"Kot",
			"Smegma",
			"Rührei"
		],
		food_action : [
			"einreiben",
			"füttern",
			"bewerfen"
		],
		food_action_passive : [
			"einführen",
			"ins Maul stopfen",
			"mit einer Spritzpistole in die Fresse spritzen",
			"ins Ohr stecken",
			"in die Nase rammen"
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
			"Anranzen",
			"Scheißen",
			"Fassen"
		],
		genitals : [
			"Vagina",
			"Eier",
			"Eichel",
			"Nippel",
			"Testikel",
			"Muschi",
			"Hoden",
			"Pickel",
			"Pussy",
			"Schwanz",
			"Penis",
			"Eierstöcke",
			"Schritt",
			"Nase"
		],
		genital_action : [
			"Leck",
			"Schleck",
			"Lutsch",
			"Friss",
			"Schnüffel",
			"Inhalier",
			"Kraul",
			"Kotz"
		],
		genital_action_hurt : [
			"trete",
			"schlage",
			"ficke",
			"wichse",
			"kneife",
			"pieke",
			"beisse",
			"penetriere",
			"zerstöre",
			"breche"
		]
	};

	var sentences = [
		'Geh {{verb}}, du {{attribute}}{{subject}}.',
		'{{attribute}}{{subject}}. Warum gehst du nicht einfach {{verb}}?',
		'Du bist {{attribute}}, du {{attribute}}{{subject}}.',
		'Ich {{genital_action_hurt}} dir in die {{genitals}}, du {{attribute}}{{subject}}.',
		'{{genital_action}} mir die {{genitals}}, {{attribute}}{{subject}}.',
		'Geh doch auf deine {{genitals}} {{verb}}, du {{attribute}}{{subject}}.',
		'Warum darf so ein {{attribute}}{{subject}} wie du überhaupt rumlaufen?',
		'Ich werde dir {{food}} {{food_action_passive}}, {{attribute}}{{subject}}.',
		'Ich werde dich mit {{food}} {{food_action}}, {{attribute}}{{subject}}.',
		'Ey, du {{attribute}}{{subject}}. Geh dich mit {{food}} {{food_action}}!',
		'Ey, du {{attribute}}{{subject}}. Geh dir {{food}} {{food_action_passive}}!'
	];

	bot.newCommand("insult", function() {
		bot.say(instrument(sentences, words));
	}, "Zufällig generierte Beleidigung.", "fire");
};
