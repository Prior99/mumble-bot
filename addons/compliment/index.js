var instrument = require("../instrument");
var Winston = require("winston");

module.exports = function(bot, callback) {
	var words = {
		attribute_body : [
			"schön",
			"wunderschön",
			"gottgleich",
			"wunderbar",
			"geil",
			"cool",
			"toll",
			"stark",
			"sexy",
			"erotisch",
			"nett",
			"Schnitzel",
			"himmlisch",
			"mega",
			"süß",
			"makellos"
		],
		prefix : [
			"unendlich",
			"",
			"überirdisch",
			"unfassbar",
			"mega",
			"super",
			"über-",
			"dermaßen",
			"traumhaft"
		],
		attribute_intel : [
			"intelligent",
			"genial",
			"schlau",
			"kreativ",
			"lieb",
			"sanft",
			"zärtlich",
			"mitfühlend",
			"selbstsicher",
			"selbstlos",
			"gewitzt",
			"süß"
		],
		subject : [
			"er Engler",
			"er Gott",
			"er Übermensch",
			"er Adonis",
			"es Genie",
			"er Geilo",
			"er Hengst",
			"e Stute",
			"er Gentleman",
			"e Elfe",
			"er Bodybuilder"
		]
	};

	var specificSentences = [
		'{{ziel}} ist so ein {{prefix}} {{attribute_intel}}{{subject}}.',
		'{{ziel}}, du bist ein {{attribute_intel}}{{subject}}. Ich liebe dich.',
		'{{ziel}}, ich liebe es, wie {{attribute_intel}} du bist. Nicht so wie {{irgendwer}}...',
		'{{ziel}} ist so {{prefix}} {{attribute_intel}}!',
		'{{ziel}} hat so einen {{prefix}} {{attribute_body}}en Körper.',
		'Bei {{ziel}}s {{attribute_body}}em Körper werde ich immer ganz wuschig.',
		'Ist {{ziel}} nicht einfach sowas von {{attribute_body}}?',
		'{{ziel}}, du siehst heute wieder ganz besonders {{attribute_body}} aus.',
		'{{ziel}}, du siehst heute wieder so {{prefix}} {{attribute_body}} aus.',
		'{{ziel}}, dein Körper ist so {{prefix}} {{attribute_body}}. Wie machst du das nur?',
		'{{ziel}} ist heute wieder sowas von {{attribute_intel}}.',
		'{{ziel}} ist einfach ein {{attribute_intel}}{{subject}}!',
		'{{ziel}} ist einfach ein {{attribute_body}}{{subject}}!',
		'{{ziel}} ist so viel {{attribute_intel}}er, als {{irgendwer}}.',
		'Im Vergleich zu {{irgendwer}} ist {{ziel}} ein echt{{subject}}.',
		'{{ziel}}s Körper ist so {{attribute_body}}... Im Gegensatz zu {{irgendwer}}',
		'Seht euch {{ziel}} und {{irgendwer}} an. Ist {{ziel}} nicht einfach so {{prefix}} {{attribute_intel}}?',
		'Ich würde {{ziel}}s {{attribute_body}}en Körper jederzeit {{irgendwer}} vorziehen.',
		'{{ziel}}s {{attribute_body}}em Body kann nichtmal {{irgendwer}} wiederstehen.'
	];

	function specificTarget(you) {
		bot.database.getRandomUser(function(err, user) {
			if(err) {
				Winston.error("Could not get random user.", err);
			}
			else {
				bot.say(instrument(specificSentences, words, {
					ziel : you,
					irgendwer : user.username
				}));
			}
		});
	}

	bot.database.getAllIdentifiers(function(err, identifiers) {
		if(err) {
			Winston.error("Could not get all identifiers.", err);
		}
		else {
			var arguments = [];
			for(var i in identifiers) { arguments.push(identifiers[i].identifier); }
			bot.newCommand("compliment", function(user, via, target) {
				bot.database.getUserByIdentifier(target, function(err, user) {
					if(err) {
						Winston.error("Unabled to get user by identifier: " + target, err);
					}
					else {
						if(user) {
							specificTarget(user.username);
						}
						else {
							Winston.warn("Trying to compliment unknown user.");
						}
					}
				});
			}, "Einer Person ein Kompliment machen", "heart", arguments);
		}
		callback();
	});
	return true;
}
