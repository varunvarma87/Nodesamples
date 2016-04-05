/*global module:true, require:true*/

'use strict';

var addBank     = require('../controllers/fmx/addBank'),
    confirmBank = require('../controllers/fmx/confirmBank'),
    addBankDone = require('../controllers/fmx/addBankDone'),
    enrollPAD   = require('../controllers/fmx/pad'),
    Bank        = require('../controllers/middleware/bank'),
    pad         = require('../controllers/middleware/pad'),
    bankFlow    = require('../controllers/fmx/bankFlow'),
    Common      = require("../controllers/middleware/common"),
    login       = require('../controllers/login'),
    risk        = require('../controllers/middleware/risk'),
    authFlow    = require('../lib/authFlow'),
// used for fmx/login
   
    exp         = require('../lib/experiments'),
    responses   = require('../lib/responses'),
    tracking    = require('../lib/tracking');

module.exports = function (router) {
    // uncomment following for login for local...
/*
     router({path: '/login', name: 'login'})
     .get(ppauth.logout(), login.mockLogin, responses.renderHTMLandJSON)
     .post(login.authenticate);
     router({path: '/login-processing', name: 'login-processing'})
     .get(login.redirect);
*/
    // login for local...


    router.get('/', function (req, res) {
        res.redirect("addBank");
    });

    /**
     * add Bank
     */
    router({path: '/addBank', name: 'addBank'})
        .get(exp.splitTraffic, addBank.process, responses.renderHTMLandJSON)
        .post(addBank.process, addBank.validate, addBank.linkBank, addBank.redirect);

    /**
     * get bank name
     */
    router.post('/getBankName', addBank.getBankDetails, addBank.renderJSON);

    /**
     * confirm Bank
     */


    /**
     * FAB: /bankflow/confirmIdentity/:institutionId
     */
    router({path: '/bankflow/confirmIdentity/:institutionId'})
        .get(Bank.processConfirmIdentity, bankFlow.renderWithErrorsHTMLandJSON)
        .post(Bank.processConfirmIdentity, Bank.submitFrictionLessBankLogin, bankFlow.confirmFrictionLessBank, bankFlow.onConfirmIdentity, bankFlow.renderWithErrorsHTMLandJSON);

    router({path: '/optinPAD'})
        .post(enrollPAD.optinPAD, bankFlow.renderWithErrorsHTMLandJSON);
};
