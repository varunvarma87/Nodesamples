'use strict';


/*module.exports = function (grunt) {

	// Load the project's grunt tasks from a directory
	require('grunt-config-dir')(grunt, {
		configDir: require('path').resolve('tasks')
	});

	// App tasks
	grunt.registerTask('build', [ 'jshint', 'less', 'requirejs', 'i18n', 'copyto' ]);
	grunt.registerTask('test', [ 'jshint', 'mochacli' ]);
	grunt.registerTask('lint', [ 'jshint' ]);

	// Build tasks
	grunt.loadNpmTasks('grunt-ci-suite');

};*/

/* global require:true, module:true, process:true */


var path = require('path'),
	nconf = require('nconf'),
	confer = require('confer');

//Nconf Read utility function

function read(prop, isArray) {
	if (isArray) {
		return nconf.get(prop).split(',');
	}
	return nconf.get(prop);
}

module.exports = function(grunt) {
	//Strip the color option from logging. Suitable for logging to build output.
	grunt.option('color', false);

	//Load properties in the order of (1) Command line (2) Environment Variables , and (3) Json properties file
	nconf.argv()

		.env()
		.file({
			file: 'ci-build.json'
		});


	var jsHintrcFile    = read('JSHINT_RC'), //The JsHintrc file location
		jsHintJSON      = confer(path.resolve(jsHintrcFile)) || {},
		jsHintReporter  = read('JSHINT_REPORTER'), //The JsHint Reporter
		jshintSrc       = read('JSHINT_SRC', true), //The files to run Linting
		checkstyle      = read('CHECKSTYLE_FILE'), //The Checkstyle.xml path
		reportDir       = read('REPORTS_DIR'), //The Reports Home directory
		testFiles       = read('TEST_FILES', true), //The files to run mocha test
		platoReport     = read('REPORTS_PLATO'), //The Plato Report file location
		covReport       = read('REPORTS_COVERAGE'), //The Coverage Report file location
		covType         = read('COVERAGE_TYPE'), //The Coverage Report type
		covPrintType    = read('COVERAGE_PRINT_TYPE'), //The Coverage print type
		mochaReporter   = read('MOCHA_REPORTER'), //The Reporter type
		cwd             = process.cwd();

	jsHintJSON.globals = {
		exports: true
	};

	//The CheckStyle Environment Variable
	if (checkstyle) {
		process.env.CHECKSTYLE_FILE = path.resolve(checkstyle);
	}

	grunt.initConfig({
		pkg: '<json:package.json>',
		chdir: {
			application: {
				src: cwd
			}
		},

		express: {
			mock: {
				options: {
					port: 4000,
					server: path.resolve('./mocks')
				}
			}
		},
		// clean files/folder
		clean: {
			reports: {
				src: reportDir
			},
			tmp: 'tmp',
			build: '.build/templates'
		},
		//JS Hint configuration
		jshint: {
			all: {
				src: jshintSrc,
				options: {
					jshintrc: jsHintrcFile,
					reporter: jsHintReporter
				},
				globals: {
					exports: true

				}
			}
		},
		// view js minification
		requirejs: {
			compile: {
				options: {
					baseUrl: 'public/js',
					mainConfigFile: 'public/js/config.js',
					dir: '.build/js',
					optimize: 'uglify',
					modules: [{
						name: 'app'
					}]
				}
			}
		},
		// less to css conversion
		less: {
			compile: {
				options: {
					yuicompress: true,
					paths: ['public/css']
				},
				files: {
					'.build/css/app.css': 'public/css/app.less',
					'.build/css/appAU.css': 'public/css/appAU.less',
					'.build/css/appBGC.css': 'public/css/appBGC.less',
					'.build/css/appIE.css': 'public/css/appIE.less',
					'.build/css/appIE8.css': 'public/css/appIE8.less',
					'.build/css/appSWallet.css': 'public/css/appSWallet.less',
					'.build/css/appIntent.css': 'public/css/appIntent.less'
				}
			}
		},
		// i18n conversion
		'makara': {
			files: ['public/templates/**/*.dust'],
			options: {
				contentPath: ['locales/**/*.properties']
			}
		},
		// dust templates compilation
		dustjs: {
			compile: {
				files: [{
					expand: true,
					cwd: 'tmp/',
					src: '**/*.dust',
					dest: '.build/templates',
					ext: '.js'
				}],
				options: {
					fullname: function(filepath) {
						var path = require('path'),
							name = path.basename(filepath, '.dust'),
							parts = filepath.split(path.sep),
							fullname = parts.slice(3, -1).concat(name);
						return fullname.join(path.sep);
					}
				}
			}
		},
		//Mocha test
		mochatest: {
			all: {
				src: testFiles,
				options: {
					globals: ['chai'],
					timeout: 600000,
					ignoreLeaks: false,
					ui: 'bdd',
					reporter: mochaReporter
				}
			}
		},
		//Plato configuration
		plato: {
			all: {
				src: jshintSrc,
				dest: platoReport,
				options: {
					jshint: jsHintJSON
				}
			}
		},
		localizr: {
			files: ['public/templates/**/*.dust'],
			options: {
				contentPath: ['locales/**/*.properties']
			}
		},
		copyto: {
			build: {
				files: [{
					cwd: 'public',
					src: ['**/*'],
					dest: '.build/'
				}],
				options: {
					ignore: [
						'public/css/**/*',
						'public/js/**/*',
						'public/templates/**/*'
					]
				}
			}
		},
		//Istanbul configurations
		codecoverage: {
			all: {
				src: testFiles,
				options: {
					globals: ['should'],
					timeout: 60000, //for code coverage
					ignoreLeaks: false,
					ui: 'bdd',
					reporter: mochaReporter,
					covDir: covReport, //Istanbul option
					reportType: covType, //Istanbul option
					printType: covPrintType //Istanbul option
				}
			}
		},
		//for js functional testing
		"loopmocha": {
			"src": ["<%=loopmocha.basedir%>/spec/**/*.js"],
			"basedir": process.cwd() + "/" + "test/functional/jsTests",
			"options": {
				"mocha": {
					"reportLocation": grunt.option("reportLocation") || "<%=loopmocha.basedir%>/report",
					"timeout": grunt.option("timeout") || 120000,
					"grep": grunt.option("grep") || 0,
					"debug": grunt.option("debug") || 0,
					"reporter": grunt.option("reporter") || "spec"
				},
				"nemoData": {
					"autoBaseDir": "<%=loopmocha.basedir%>",
					"targetBrowser": nconf.get("TARGET_BROWSER") || "firefox",
					"targetServer": nconf.get("TARGET_SERVER") || "localhost",
					"targetBaseUrl": nconf.get("TARGET_BASE_URL") || "http://localhost:8000",
					"seleniumJar": nconf.get("SELENIUM_JAR") || "/usr/local/bin/selenium-server-standalone.jar",
					"serverProps": {"port": 4444},
					"stage": nconf.get("STAGE") || "STAGE2P1971"

				},
				"iterations": [
					{
						"description": "default"
					}
				]
			},
			"all": {
				"src": "<%=loopmocha.src%>"
			},
			"legacy": {
				"src": "<%=loopmocha.src%>",
				"options": {
					"mocha": {
						"grep": (grunt.option('grep') || '') + '(?!migrate)'
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-dustjs');

	grunt.loadNpmTasks('grunt-plato');
	grunt.loadNpmTasks('grunt-ci-suite');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-loop-mocha');
	grunt.loadNpmTasks('grunt-localizr');
	grunt.loadNpmTasks('grunt-copy-to');

	grunt.registerTask('test', ['jshint', 'mochatest']);
	grunt.registerTask('coverage', ['chdir', 'clean:reports', 'plato', 'codecoverage']);

	grunt.registerTask('i18n', [ 'clean', 'localizr', 'dustjs', 'clean:tmp' ]);
	grunt.registerTask('build', [ 'jshint', 'less', 'requirejs', 'i18n', 'copyto' ]);
	grunt.registerTask('automation', ['loopmocha:all']);
	grunt.registerTask('default', ['test']);
};