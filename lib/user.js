/*global require:true, exports:true, module:true */
'use strict';

var UserModel    = require('../models/userModel'),
    Common       = require('../controllers/middleware/common'),
    Helper       = require('./helper'),
    responses    = require('./responses');

/*
 * Loads user data for a logged in user
 */
exports.loadUserData = function() {
    return function loadUserData(req, res, next) {
        loadUser(req, res, function (err) {
            if (err) {
                req.log('error', 'Not able to load user data');
                req.model.data.errors.mapContent('fmx/errors', req, function () {
                    responses.renderHTMLandJSON(req, res);
                });
                return;
            }
            //setting user object correctly for walletfiserv
            req.user.accountNumber = req.user.account_number;
            req.user.encryptedAccountNumber = req.user.encrypted_account_number;
            req.user.legalCountry = req.user.legal_country;
            req.user.country = {};
            req.user.country.countryCode = req.user.legal_country;

            next();
        });
    };
};

function loadUser(req, res, next) {
    // load the latest info about the user
    var user = new UserModel();
    var loadCallback = function (err,result) {
        if (err) {
            return next(err);
        }

        req.user = req.user || {};
        var userObj = req.user,
            resultObj = result.result;


        if(resultObj) {
            if(resultObj.account && resultObj.account[0]) {
                userObj.account_number = resultObj.account[0].account_number;
                userObj.encrypted_account_number = resultObj.account[0].encrypted_account_number;
                userObj.legal_country = resultObj.account[0].legal_country;
            }
            if(resultObj.name && resultObj.name[0]) {
                userObj.first_name = resultObj.name[0].first_name;
                userObj.last_name = resultObj.name[0].last_name;
            }
        }
        else {
            if(result.account && result.account[0]) {
                userObj.account_number = result.account[0].account_number;
                userObj.encrypted_account_number = result.account[0].encrypted_account_number;
                userObj.legal_country = result.account[0].legal_country;
            }
            if(result.name && result.name[0]) {
                userObj.first_name = result.name[0].first_name;
                userObj.last_name = result.name[0].last_name;
            }
        }

        next();
    };
    user.load(req, loadCallback);
}
