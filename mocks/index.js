/*global require:true, module:true*/
'use strict';

var express     = require('express'),
    bodyParser  = require('body-parser'),
    app         = express(),
    config      = require('./ServiceConfig'),
    testConfig  = {
        "openshiftEnvVariable": "OPENSHIFT_INTERNAL_IP",
        "appPort": 16000,
        "mocksPort": 17000
    },
    caseManager = require('./caseManager'),
    db          = {};

app.use(bodyParser.urlencoded());

app.use(bodyParser.json());

Object.keys(config).forEach(function (serviceName) {
    if (config[serviceName].hasResponse === true && config[serviceName].dynamic === undefined) {
        db[serviceName] = require('./dummyData/' + serviceName);

        app[config[serviceName].action](config[serviceName].endpoint, function (req, res) {

            if (db[serviceName]) {

                if (req.query && req.query[serviceName]) {
                    req.query.case = req.query[serviceName];
                }

                req.model = db[serviceName].cases ? caseManager(req, res, db[serviceName].cases) : db[serviceName];
                res.json(req.model);
            } else {
                res.send('');
            }
        });
    }
});

// Launch server
app.listen(testConfig.mocksPort);
module.exports = app;
