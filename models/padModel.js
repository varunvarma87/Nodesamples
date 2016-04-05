/*global PADModel:true, module:true */

'use strict';

var servicecore = require('servicecore'),
    async       = require('async'),
    commonUtil  = require('../lib/commonUtil'),
    calLogger   = require('../lib/calTracker'),
    WalletModel = require('./walletModel'),
//	initialize this whereever required, not here(breaks unit-tests)
    padService;

var PadModel = function () {
};

PadModel.prototype = (function () {

    /**
     * [NOTE]: Check this URL for details on the PAD Service:
     * https://confluence.paypal.com/display/VerticalSolutions/PayAfterDeliveryLifecycle
     *
     * calls padservice to get existing PAD status of the customer
     *
     * @param req
     * @param user
     * @param callback
     * @private
     */
    var _isNotPADIneligible = function (req, user, callback) {
        var EVENT_NAME = 'PADService_EnrollmentStatus';
        var isNotPADIneligible = true;

        padService = servicecore.create('fundingpolicy-paypal');
        padService.getPADEnrollmentStatus(user, req.params, function (err, response) {
                var body = response && response.body;

                if (err || (response && response.statusCode !== 200)) {
                    calLogger.calLog(EVENT_NAME, EVENT_NAME + "_FAILED", 'error', req.correlationId, user.accountNumber);
                    req.log('debug', 'PADModel: PAD enrollment status call failed ' + commonUtil.getDebugMessage(err, response));

                    return callback(null, isNotPADIneligible);
                }

                if (body.status !== 'ELIGIBLE') {
                    isNotPADIneligible = false;
                }
                calLogger.calLog(EVENT_NAME, EVENT_NAME + "_SUCCESS_VALUE__" + body.status, 'info', req.correlationId, user.accountNumber);

                callback(null, isNotPADIneligible);
            });
        },

        _handlePADResponse = function (callback) {
            return function(err, response) {
                var body = response && response.body,
                    errorCode = body && body.error_code,
                    padResponse = {
                        status: body && body.status,
                        defaultPaymentMethod: body && body.is_default_payment_method
                    },
                    responseCode = errorCode || padResponse;

                if (err || response.statusCode !== 200 || responseCode) {
                    return callback(responseCode);
                }

                callback();
            };
        };

    return {
        checkPADEligibility: function (req, user, callbackUpstream) {
            var EVENT_NAME = 'PADModel_PADEligibiity';
            var _isPADEligible = false;
            var walletModel = new WalletModel();

            async.parallel({
                    isNotPADIneligible: function (callback) {
                        _isNotPADIneligible(req, user, callback);
                    },
                    hasPPCredit: function (callback) {
                        walletModel.hasPPCredit(req, user, callback);
                    },
                    hasActiveCard: function (callback) {
                        walletModel.hasActiveCard(req, user, callback);
                    }
                },
                function (err, results) {

                    if (err) {
                        calLogger.calLog(EVENT_NAME, EVENT_NAME + "_FAILED", 'error', req.correlationId, user.accountNumber);
                        req.log('debug', 'PADModel: PAD eligibility call failed with error ' + err.message);
                        callbackUpstream(err, null);
                    }

                    if (results.isNotPADIneligible && !results.hasPPCredit && results.hasActiveCard) {
                        _isPADEligible = true;
                    }
                    calLogger.calLog(EVENT_NAME, EVENT_NAME + "_SUCCESS_VALUE_" + _isPADEligible, 'info', req.correlationId, user.accountNumber);
                    callbackUpstream(null, {isPADEligible: _isPADEligible});

                });
        },

        enrollPAD: function(account, param, callbackUpstream){
            padService = servicecore.create('fundingpolicy-paypal');
            padService.enrollPAD(account, param, _handlePADResponse(callbackUpstream));
        }
    };


})();

module.exports = PadModel;
