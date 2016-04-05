'use strict';

var url 	 = require('url'),
    tracking = require('../data/tracking');

/**
 * append url helper
 * @param originalUrl
 * @param qs
 * @returns {*}
 */
exports.appendUrl = function(originalUrl, qs) {
    var returnUrl,
        parsedUrl = url.parse(originalUrl);
    if (parsedUrl.search) {
        returnUrl= originalUrl + '&' + qs;
    } else {
        returnUrl = originalUrl + '?' + qs;
    }
    return returnUrl;
};

exports.addData = function(req, page, intentType) {
    var prgpTmpl = tracking.page.pgrp,
        pageTmpl = tracking.page.page;
    prgpTmpl = prgpTmpl.replace('<page>', page);
    pageTmpl = pageTmpl.replace('<page>', page).replace('<intentType>', intentType);

    req.tracking.addData('pgrp', null, prgpTmpl);
    req.tracking.addData('page', null, pageTmpl);
};

/**
 * on error, checks for status code and error objects to return a standardized debug message
 *
 * @param err
 * @param response
 * @returns {string}
 */
exports.getDebugMessage = function(err, response){
    return (response && response.statusCode) ? "[STATUS]: " + response.statusCode : "[ERROR]: " + err.message;
};

exports.trackingData = tracking;
