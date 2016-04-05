/*global require:true, module:true, process:true */
"use strict";
var makara  = require("makara"),
    path    = require("path"),
    config  = {
        fallback: 'en_US',
        contentRoot: path.join(process.cwd(), 'locales'),
        templateRoot: path.join(process.cwd(), 'public', 'templates'),
        cache: true,
        enableHtmlMetadata: false
    };

module.exports = {
    loadContentBundle: function(fName, locale, callback) {
        var provider = makara.create(config);

        provider.getBundle(fName, locale, callback);
    }
};