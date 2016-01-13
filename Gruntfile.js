module.exports = function(grunt) {
	grunt.initConfig({
		browserify: {
			bundle: {
				files : {
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
					alias : [
						"jquery:",
						"d3:",
						"handlebars:"
					],
					external: null
				}
			},
			dist: {
				files: [{
					expand: true,
					src: ["*.js", "**/*.js"],
					dest: "dist/",
					ext: ".js",
					cwd : "views/"
				}],
				options: {
					transform: [
						["babelify", {
							"presets": [ "es2015" ],
							"plugins" : [],
							"compact": false
						}]
					],
					external: [
						"jquery",
						"d3",
						"handlebars"
					]
				}
			},
			options: {
				browserifyOptions: {
					debug: true
				}
			}
		},
		watch: {
			server: {
				files: ["src/**/*.js"],
				tasks: ["eslint", "babel"]
			},
			style : {
				files: ["style/**/*.less"],
				tasks: ["less"]
			},
			client : {
				files: ["views/**/*"],
				tasks: ["browserify:dist"]
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
