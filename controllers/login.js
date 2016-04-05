'use strict';

var ppauth = require('auth-paypal');

/**
 * This is the mock route for authentication. On live this route will not be used
 * @param {Object} req the HTTP request object
 * @param {Object} res the HTTP response object
 */
exports.mockLogin = function (req, res, next) {
	var config = req.app && req.app.kraken || require('nconf'),
		baseURI = config.get('requestURI');
console.log('mockLogin');
	req.model = {
		data: {requestURI: '/fmx/'},
		viewName: 'mockLogin'
	};
	next();
};

/**
 * This route is to conditionally pass back either the HTML page (at /login on live for webscr)
 * or JSON data with the appropriate response code
 * @param {Object} req the HTTP request object
 * @param {Object} res the HTTP response object
 */

exports.realLogin = function (req, res) {
	var model = {
		'location': '/login'
	};

	res.format({
		html: function () {
			res.redirect(model.location);
		},
		json: function () {
			res.status(401).json(model);
		}
	});
};

/**
 * Authenticate the user, or just pass through if in test mode
 */
exports.authenticate = function(req, res, next) {
	var config = req.app && req.app.kraken || require('nconf'),
		baseURI = config && config.get ? config.get('requestURI') : '';

	if (process.env.NODE_ENV === 'test') {
		res.redirect(baseURI + '/');
	} else {
		ppauth.login({
			successRedirect: baseURI + 'login-processing',
			failureRedirect: baseURI + 'login'
		})(req, res, next);
	}
};

/**
 * Fake the behavior on live of the login processing page, and clear
 * the inconsistent req.user that's populated by POST'ing to login
 */
exports.redirect = function(req, res, next) {
	var config = req.app && req.app.kraken || require('nconf'),
		baseURI = config && config.get ? config.get('requestURI') : '';

	res.redirect(baseURI);
};
