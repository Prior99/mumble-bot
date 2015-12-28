module.exports = function(grunt) {
	grunt.initConfig({
		browserify: {
			dist: {
				files: {
					"dist/speak.js" : "views/speak.js",
					"dist/rss.js" : "views/rss.js",
					"dist/commands.js" : "views/commands.js",
					"dist/googlelookup.js" : "views/googlelookup.js",
					"dist/channeltree.js" : "views/channeltree.js",
					"dist/bass/designer.js" : "views/bass/designer.js",
					"dist/bass/effects.js" : "views/bass/effects.js",
					"dist/music/playlist.js" : "views/music/playlist.js",
					"dist/music/songs.js" : "views/music/songs.js",
					"dist/music/status.js" : "views/music/status.js",
					"dist/music/upload.js" : "views/music/upload.js",
					"dist/music/youtube.js" : "views/music/youtube.js",
					"dist/partials/register.js" : "views/partials/register.js",
					"dist/partials/login.js" : "views/partials/login.js",
					"dist/quotes/add.js" : "views/quotes/add.js",
					"dist/quotes/home.js" : "views/quotes/home.js",
					"dist/quotes/list.js" : "views/quotes/list.js",
					"dist/record/cached.js" : "views/record/cached.js",
					"dist/record/create_dialog.js" : "views/record/create_dialog.js",
					"dist/record/dialogs.js" : "views/record/dialogs.js",
					"dist/record/edit.js" : "views/record/edit.js",
					"dist/record/labels.js" : "views/record/labels.js",
					"dist/record/overview.js" : "views/record/overview.js",
					"dist/record/save.js" : "views/record/save.js",
					"dist/record/stored.js" : "views/record/stored.js",
					"dist/stats/index.js" : "views/stats/index.js",
					"dist/stats/recordsperuser.js" : "views/stats/recordsperuser/index.js",
					"dist/stats/recordspertime.js" : "views/stats/recordspertime/index.js",
					"dist/stats/recordplaybacksperuser.js" : "views/stats/recordplaybacksperuser/index.js",
					"dist/stats/onlineperuser.js" : "views/stats/onlineperuser/index.js",
					"dist/stats/spokenperuser.js" : "views/stats/spokenperuser/index.js",
					"dist/stats/spokenperhour.js" : "views/stats/spokenperhour/index.js",
					"dist/stats/spokenperweekday.js" : "views/stats/spokenperweekday/index.js",
					"dist/sounds/sounds.js" : "views/sounds/sounds.js",
					"dist/sounds/upload.js" : "views/sounds/upload.js",
					"dist/users/permissions.js" : "views/users/permissions.js",
					"dist/users/profile.js" : "views/users/profile.js",
					"dist/users/settings.js" : "views/users/settings.js",
					"dist/spotify/play.js" : "views/spotify/play.js",
					"dist/bundle.js": ["views/index.js",
						"node_modules/tablesorter/dist/js/jquery.tablesorter.min.js",
						"node_modules/tablesorter/dist/js/jquery.tablesorter.widgets.min.js"]
				},
				options: {
					transform: [
						["babelify", {
							"presets": [ "es2015" ],
							"plugins" : [],
							"compact": false
						}]
					],
					exclude : ["grunt", "grunt-browserify", "mumble",
						"array.prototype.find", "cheerio", "express",
						"express-handlebars", "express-session", "feed-read",
						"fluent-ffmpeg", "jsdoc", "lame", "less-middleware",
						"mineflayer", "multer", "musicmetadata", "mysql",
						"node-espeak", "node-mpd", "node-samplerate", "prompt",
						"request", "session-file-store", "sox-audio", "steam",
						"wav", "winston", "winston-mysql-transport", "youtube-dl"]
				}
			},
			options: {
				browserifyOptions: {
					debug: true
				}
			}
		},
		watch: {
			scripts: {
				files: ["style/**/*.less", "views/**/*", "Gruntfile.js", "src/**/*.js"],
				tasks: ["default"],
				options: {
					spawn: false
				}
			}
		},
		less: {
			development: {
				files: {
					"dist/bundle.css": "style/*.less"
				}
			}
		},
		eslint: {
			options: {
				configFile: ".eslintrc"
			},
			target: ["src/**/*.js", "views/**/*.js"]
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ["babel-preset-es2015", "babel-preset-stage-3"]
			},
			dist: {
				files: [{
					expand: true,
					src: ["*.js"],
					dest: "compiled/scripts/upgrade",
					ext: ".js",
					cwd : "scripts/upgrades"
				}, {
					expand: true,
					src: ["src/**/*.js", "index.js"],
					dest: "compiled/server",
					ext: ".js"
				}]
			}
		},
		jsdoc : {
			dist : {
				src : ["src/**/*.js", "views/**/*.js"],
				options : {
					destination : "doc"
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-babel");
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-jsdoc");

	grunt.registerTask("default", ["eslint", /*"jsdoc",*/ "babel", "browserify", "less"]);
};
