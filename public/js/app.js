require(['config'], function (config) {
	"use strict";
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}
	require(["router", "widgets/analytics", "jquery"],
		function (Router, Analytics, $) {


			/* Create instance of the App */
			var app = {
				initialize: function () {

					/* Analytics used for tracking links and errors */
					Analytics.initialize();

					// setup Router
					var router = new Router();
					//Make the router accessible to outside callers.
					define('appRouter', function () {
						return router
					});
				}
			};
			$(function () {
				var csrf = $('body').data('_csrf');
				if (csrf) {
					$.ajaxPrefilter(function (opts, origOpts, jqXHR) {
						jqXHR.setRequestHeader('X-CSRF-Token', csrf);
					});
				}


				/* Initialize the instance */
				app.initialize();
			})
		});
});
