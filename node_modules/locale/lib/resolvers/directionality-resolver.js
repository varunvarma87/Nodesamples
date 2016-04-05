/**
 *  PayPal directionality resolver
 *  Determine the directionality (rtl or ltr) to use.
 */

var rtlLanguages = ['ar', 'fa', 'he'];

exports = module.exports = {
    resolve: function (language) {
        return ~rtlLanguages.indexOf(language) ? 'rtl' : 'ltr';
    }
};
