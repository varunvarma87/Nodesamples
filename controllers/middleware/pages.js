/*global require:true, exports:true, module:true */

'use strict';

var __ = require('underscore');

module.exports = {
    /**
     * prevent back button clicks
     * @param req
     * @param res
     * @param next
     */

    backButtonHandler: function(req, res, next) {
        var pages       = ['account', 'create', 'phone', 'createPin', 'paymentMethod', 'addCard', 'addBank', 'directDebit', 'confirmBank', 'applyBml', 'bmlApproved', 'success'],
            country     = req.locality.country,
            page        = (req.path).replace('/', ''), // get requested page
            curPage     = req.session.userActions && req.session.userActions.curPage, // retrieve current page from where back button clicked
            index       = __.indexOf(pages, page),
            nextPages   = [];

        //DE page order is being changed
        if (country === 'DE') {
            pages = ['account', 'create', 'phone', 'createPin', 'paymentMethod', 'addBank', 'directDebit', 'confirmBank', 'addCard', 'success'];
        }
        // get previous pages
        if (index !== -1) {
            nextPages = __.rest(pages, index + 1);
        }
        // check whether new page and current page not equal and requested page is not future page
        if (curPage && page !== curPage && __.contains(nextPages, curPage)) {
            req.log('info', {msg: 'back button clicked', from: curPage});
            res.redirect(curPage);
        } else {
            req.session.userActions = {
                account: true,
                curPage: page
            };
            next();
        }
    }

};
