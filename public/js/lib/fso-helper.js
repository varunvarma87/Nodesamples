/*global define:false, ActiveXObject:false, PAYPAL:true*/

/*
 * This is a helper for all FSO-related things.
 * lifted verbatim from: https://github.paypal.com/Checkout/Aries/blob/bugfix/public/js/lib/fso-helper.js
 */

define(['fso'], function(fso) {

    'use strict';

    function dropCookie(viewName, token) {
        var tns = PAYPAL.tns;
        tns.doFso(token, viewName);
    }

    return {
        dropCookie: dropCookie
    };
});