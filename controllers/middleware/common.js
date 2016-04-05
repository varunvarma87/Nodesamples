/*global require:true, module:true */

"use strict";

var validator       = require("../../lib/validator").check,
    Helper          = require("../../lib/helper"),
    CountryUtil     = require("../../lib/countryUtil"),
    content         = require("../../lib/content"),
    __              = require('underscore');

module.exports = {

    /**
     * This function validates bank user name
     * @param req
     * @param next
     */
    validateBankUserName: function(req, next) {
        var body                 = req.body,
            isValidBankUserName  = validator(body.bankUserName, 'bankUserName').notNull().getErrors();

        if (isValidBankUserName.length) {
            req.model.data.errors.addFieldError('bankUserName', isValidBankUserName[0]);
        }
        next();
    },

    /**
     * This function validates bank password
     * @param req
     * @param next
     */
    validateBankPassword: function(req, next) {
        var body                 = req.body,
            isValidBankPassword  = validator(body.bankPassword, 'bankPassword').notNull().getErrors();

        if (isValidBankPassword.length) {
            req.model.data.errors.addFieldError('bankPassword', isValidBankPassword[0]);
        }
        next();
    },

    /**
     * function to process the campaign id for tracking
     * @param req
     * @param map
     */
    processCampaignIdForTracking: function(req, map) {
        var campaignId = req.session.campaignId;
        if(campaignId === null || campaignId === '' || campaignId === undefined) {
            campaignId = 'null';
        }
        map.external_tracking_code = campaignId;
    },

    /**
     * function to process the campaign id for redirection
     * @param req
     * @param redirectTo
     */
    processCampaignIdForRedirection: function(req, redirectTo) {
        var campaignId = req.session.campaignId,
            appendToURL = '';
        if(campaignId !== null && campaignId !== '' && campaignId !== undefined) {
            if(redirectTo.indexOf('?') > -1) {
                appendToURL = appendToURL + '&ext_cid=' + campaignId;
            } else {
                appendToURL = appendToURL + '?ext_cid=' + campaignId;
            }
        }
        return appendToURL;
    },

    /**
     * function to complete the tracking in case of redirect by flusing
     * @param req
     * @param res
     * @param next
     */
    completeTracking: function(req, res, next) {
        req.tracking.flushServerSide();
        next();
    },



    /**
     * function to check is the URL is null or empty or undefined
     * @param url
     * @returns {boolean}
     */
    isBlank: function (url) {
        if(url === undefined) {
            return true;
        } else if( url === '' ) {
            return true;
        } else if (url === null) {
            return true;
        } else {
            return false;
        }
    },


    /**
     * function to actually check in the decoded URL for http or https or //
     * @param url
     */
    isSuspiciousURL: function (url) {
        if(url.indexOf('http')> -1 || url.indexOf('//')> -1) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * Function to return the bankDetails object based on the institutionId.
     * @param institutionId
     */
    processBankId: function(institutionId) {
        var bankDetails,
            helper = new Helper(),
            bankLogos = helper.getBankData();

        __.each(bankLogos, function (obj) {
            if(obj.InstitutionId === institutionId) {
                bankDetails = obj;
            }
        });
        return bankDetails;
    }

};
