/* global requirejs:true */
requirejs.config({
	paths: {
		"jquery":                   "lib/jquery-1.8.0",
		"jqueryUI":                 "lib/jquery.ui.widget",
		"jqueryUICore":             "lib/jquery.ui.core",
		"json":                     (typeof JSON === "undefined") ? "lib/json2" : "empty:",
		"underscore":               "lib/underscore-1.7.0",
		"backbone":                 "lib/backbone-1.1.2",
		"backboneSubroute":         "lib/backbone-subroute-0.3.2",
		"dust":                     "lib/dust-core",
		"nougat":                   "core/nougat",
		"BaseView":                 "core/baseView",
		"dust-helpers" :            "lib/dust-helpers",
		"dust-helpers-supplement" : "lib/dust-helpers-supplement",
		'fso-helper':               'lib/fso-helper',
		'fso':                      'lib/fso',
		'browserID':                'lib/bid',
		//Core Components
		"numeric":                  "components/textInput/numeric",
		"restrict":                 "components/textInput/restrict",
		"placeholder":              "lib/placeholder"
	},
	useStrict: true,
	shim: {
		"Analytics":{
			exports:'PAYPAL'
		},
		"dust": {
			exports: "dust"
		},
		"dust-helpers": {
			deps: ["dust"]
		},
		"dust-helpers-supplement": {
			deps: ["dust", "dust-helpers"]
		},
		"jqueryUI": {
			deps: ["jquery","jqueryUICore"]
		},
		"underscore": {
			exports: "_"
		},
		"backbone": {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		"backboneSubroutes": {
			deps: ["backbone"]
		},

		"numeric": {
			deps: ["jquery", "jqueryUI"]
		},

		"restrict": {
			deps: ["jquery", "jqueryUI"]
		},
		"placeholder": {
			deps: ["jquery"]
		}
	}
});
