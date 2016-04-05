/*global require:true, exports:true, module:true */
'use strict';

var PADModel = require('../../models/padModel');

/**
 * sets PAD eligibility in request.model.data
 *
 * @param req
 * @private
 */
var _setPADEligibilityInRequestData = function(req){
    req.model.data = req.model.data || {};

    if(req.session.isPADEligible){
        req.log('debug', 'Setting PAD Eligibility in request data');
        req.model.data.isPADEligible = true;
        req.model.data.flowExecutionUrl = "/fmx/optinPAD";
    }
};

/**
 * checks if PAD eligibility should be checked for the user, based on query parameter
 *
 * @param req
 * @param res
 * @param next
 */
exports.checkPADForUser = function(req, res, next) {

    if(req.session.checkForPAD || (req.query.pad && req.query.pad === 'true')){
        req.session.checkForPAD = true;
    }

    next();
};

/**
 * calls PAD model to check for PAD eligibility
 *
 * @param req
 * @param res
 * @param next
 */
exports.checkPADEligibility = function (req, res, next) {
    var session     = req.session,
        padModel    = new PADModel(),
        user        = req.user;

    if(!session.checkForPAD){
        req.log('debug', 'PADMiddleware: No PAD eligibility check due to absence of PAD query parameter ');
        return next();
    }

    //  if already checked, don't repeat, just set the data
    if(session.isPADEligible){
        _setPADEligibilityInRequestData(req);

        return next();
    }

    padModel.checkPADEligibility(req, user, function (err, response) {

        if (err) {
            req.log('debug', {
                call: 'PAD model checkPADEligibility',
                message: err.message
            });
        }
        else {
            req.session.isPADEligible = response.isPADEligible;

            req.log('debug', {
                page: req.path,
                method: req.method,
                device: session.device,
                call: 'PADEligibility',
                'status': response.isPADEligible
            });

            _setPADEligibilityInRequestData(req);
        }

        next();
    });
};
