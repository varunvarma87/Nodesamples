/* global exports:true */

"use strict";

var ppauth = require('auth-paypal');


/**
 * render view either html or json
 * @param req
 * @param res
 */
exports.renderHTMLandJSON = function renderHTMLandJSON(req, res) {
    var model = (req.model || (req.model = {}));

    model.data = model.data || {};

    res.format({
        json: function () {
            model.data.isMiniPage = true;
            res.json(req.model);
        },
        html: function () {
            res.render(req.model.viewName, req.model);
        },
        // Fix for IE8
        'application/x-ms-application': function () {
            res.type('.html');
            res.render(req.model.viewName, req.model);
        }
    });
};

/**
 * render 404[page not found]
 * @param req
 * @param res
 */
exports.handle404 = function handle404(req, res) {
    return function handle404(req, res) {
        var session = req.session;
        /* TODO: need to block this page for unauthed users. */
        res.status("404");

        if (!req.model) {
            req.model = {};
        }

        if (session.flow !== undefined) {
            req.model.data = {
                flow: 'oem'
            };
            if (session.flow.showSwallet !== undefined) {
                req.model.data.showSwallet = true;
            }
        }

        req.model.viewName = "pageNotFound";

        res.render(req.model.viewName, req.model);
    };
};

/**
 * log errors
 * @param err
 * @param req
 * @param res
 * @param next
 */
exports.logErrors = function logErrors(err, req, res, next) {
    return function logErrors(req, res) {
        req.log('error', err.stack ? err.stack : err);

        //If can't be handled (by default), then render 500 error page
        if (!err.respondable) {
            next(err);
        }
    };
};

/**
 * render 500 internal server error
 * @param err
 * @param req
 * @param res
 * @param next
 */
exports.handle500 = function handle500(err, req, res, next) {
    return function handle500(req, res) {
        var session = req.session;
        res.status(err.status || "500");

        if (!req.model) {
            req.model = {};
        }

        if (session && session.flow !== undefined) {
            req.model.data = {
                flow: 'fmx',
                url: (req.url !== undefined) ? (req.url).replace("/", "") : 'fmx/addBank'
            };
        }

        req.model.viewName = "error500";

        res.render(req.model.viewName, req.model);
    };
};

/**
 * do force logout user
 * @param req
 * @param res
 * @param next
 */
exports.appLogout = function appLogout(req, res, next) {
    /*
    if (req.session.phonePageVisited !== undefined && req.session.phonePageVisited) {
        next();
    } else {
        //Samsung wallet specific changes
        if (req.session.flow !== undefined) {
            req.body.flow = req.session.flow;
        }
    */
    // check whether user logged In then
    if (req.user !== undefined || (req.session.userActions !== undefined && req.session.userActions.account) || (req.sessionStore !== undefined && req.sessionStore.loggedIn)) {
        req.logout(); //do passport strategy of logout
        ppauth.logout({session: false}, function(err, user, info) {
            if (!err) {
                req.log('info', 'logout success');
                /*
                //Samsung wallet specific changes
                if (req.body.flow !== undefined) {
                    req.session.flow = req.body.flow;
                }
                */
                next();
            } else {
                req.log('debug', 'logout failed, try to logout again');
                ppauth.logout({session: false}, function(err, user, info) {
                    if (!err) {
                        req.log('info', 'logout success on second time');
                    } else {
                        req.log('debug', 'logout failed on second time');
                    }
                    /*
                    //Samsung wallet specific changes
                    if (req.body.flow !== undefined) {
                        req.session.flow = req.body.flow;
                    }
                    */
                    next();
                })(req, res, next);
            }
        })(req, res, next);
    } else {
        next();
    }
    //}
};

/**
 * ppauth authorize to work with custom handler
 * @param req
 * @param res
 * @param next
 */
exports.authorize = function () {
    return function authorize(req, res, next) {
        req.log('debug', {msg: 'authorization call', page: req.baseUrl});
        ppauth.authorize(function (err, actor, info) {
            if(err || !actor){
                req.log('info', "authorization failed. so redirecting to login..");
                if (req.app.kraken.get('features:unifiedLogin')) {
                    var splitLoc = req.originalUrl.indexOf('?');
                    if(splitLoc > 6) {
                        res.redirect('/signin?returnUri=' + encodeURIComponent(req.originalUrl.slice(0,splitLoc)) +
                            '&state=' + encodeURIComponent(req.originalUrl.slice(splitLoc)));
                    } else {
                        res.redirect('/signin?returnUri=' + encodeURIComponent(req.originalUrl));
                    }
                } else {
                    res.redirect('/login');
                }
                return;
            }
            next();
        })(req, res, next);
    };
};

exports.isJson = function (req) {
    return /application\/json/.test(req.headers.accept);
};