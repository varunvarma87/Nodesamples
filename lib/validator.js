/* global module:true */
"use strict";

var Validator = module.exports = function () {};

Validator.prototype.check = function (str, field) {
    this.str = typeof( str ) === 'undefined' || str === null || (isNaN(str) && str.length === undefined) ? '' : str + '';
    this.field = field.toUpperCase(); // for Error key
    this.fieldName = field; // for Error key
    this._errors = this._errors || [];
    return this;
};

Validator.prototype.validate = Validator.prototype.check;

Validator.prototype.error = function(msg) {
    this._errors.push(msg);

    return this;
};

Validator.prototype.getErrors = function () {
    return this._errors;
};

Validator.prototype.isAlphanumeric = function() {
    if (!this.str.match(/^[a-zA-Z0-9]+$/)) {
        return this.error(this.msg || this.field + '_INVALID_CHARACTERS');
    }
    return this;
};

Validator.prototype.isAlpha = function() {
    if (!this.str.match(/^[a-zA-Z\s]+$/)) {
        return this.error(this.msg || this.field + '_INVALID_CHARACTERS');
    }
    return this;
};

Validator.prototype.isNumeric = function() {
    if (!this.str.match(/^-?[0-9]+$/)) {
        return this.error(this.msg || this.field + '_INVALID_NUMBER');
    }
    return this;
};

Validator.prototype.notNull = function() {
    if (this.str === '') {
        return this.error(this.msg || this.field + '_IS_NULL');
    }
    return this;
};

Validator.prototype.isNull = function() {
    if (this.str !== '') {
        return this.error(this.msg || this.field + '_IS_NOT_NULL');
    }
    return this;
};
Validator.prototype.equals = function(equals) {
    if (this.str !== equals) {
        return this.error(this.msg || this.field + '_MISMATCH');
    }
    return this;
};

Validator.prototype.isEmail = function() {
    if (!this.str.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/)) {
        return this.error(this.msg || this.field + '_INVALID_FORMAT');
    }
    return this;
};

Validator.prototype.isPassword = function() {
    // check null
    this.notNull();
    this.len(8, 20);
    // TODO: validation failing
    //this.not(/[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/\\]/);
    this.not(/(.)\1{3}/);

    return this;
};

Validator.prototype.isPhone = function(country) {
    this.str = this.str.replace(/[^0-9]+/g, ''); // remove all spaces, etc
    // check null
    this.notNull();
    if (country === undefined || country === 'US') {
        this.len(10, 10);
    }

    return this;
};

Validator.prototype.isRoutingNumber = function(country) {
    // check null
    this.notNull();
    this.isNumeric();
    if (country === undefined || country === 'US') {
        this.len(3, 12);
    }
    /*
    else if (country === 'DE') {
        this.len(2, 8);
    } else if (country === 'FR') {
        this.len(5, 5);
    }
    */
    return this;
};

// http://www.aa-asterisk.org.uk/index.php/Regular_Expressions_for_Validating_and_Formatting_GB_Telephone_Numbers
// UK phone /^(((\+44)? ?(\(0\))? ?)|(0))( ?[0-9]{3,4}){3}$/ 
// UK postal code /[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][ABD-HJLNP-UW-Z]{2}/i

//Will work against Visa, MasterCard, American Express, Discover, Diners Club, and JCB card numbering formats
Validator.prototype.isCreditCard = function() {
    this.str = this.str.replace(/[^0-9]+/g, ''); //remove all dashes, spaces, etc.
    if (!this.str.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
        return this.error(this.msg || this.field + '_INVALID_CARD');
    }
    // Doing Luhn check
    var sum = 0;
    var digit;
    var tmpNum;
    var shouldDouble = false;
    for (var i = this.str.length - 1; i >= 0; i--) {
        digit = this.str.substring(i, (i + 1));
        tmpNum = parseInt(digit, 10);
        if (shouldDouble) {
            tmpNum *= 2;
            if (tmpNum >= 10) {
                sum += ((tmpNum % 10) + 1);
            } else {
                sum += tmpNum;
            }
        } else {
            sum += tmpNum;
        }
        if (shouldDouble) {
            shouldDouble = false;
        } else {
            shouldDouble = true;
        }
    }

    if ((sum % 10) !== 0) {
        return this.error(this.msg || this.field + '_INVALID_CARD');
    }
    return this;
};

Validator.prototype.contains = function(str) {
    if (this.str.indexOf(str) === -1 || !str) {
        return this.error(this.msg || 'Invalid characters');
    }
    return this;
};

Validator.prototype.notContains = function(str) {
    if (this.str.indexOf(str) >= 0) {
        return this.error(this.msg || 'Invalid characters');
    }
    return this;
};

Validator.prototype.regex = Validator.prototype.is = function(pattern, modifiers) {
    if (Object.prototype.toString.call(pattern).slice(8, -1) !== 'RegExp') {
        pattern = new RegExp(pattern, modifiers);
    }
    if (! this.str.match(pattern)) {
        return this.error(this.msg || this.field + '_INVALID_CHARACTERS');
    }
    return this;
};

Validator.prototype.notRegex = Validator.prototype.not = function(pattern, modifiers) {
    if (Object.prototype.toString.call(pattern).slice(8, -1) !== 'RegExp') {
        pattern = new RegExp(pattern, modifiers);
    }
    if (this.str.match(pattern)) {
        return this.error(this.msg || this.field + '_INVALID_CHARACTERS');
    }
    return this;
};

Validator.prototype.len = function(min, max) {
    if (this.str.length < min) {
        return this.error(this.msg || this.field + '_TOO_SHORT');
    }
    if (typeof max !== undefined && this.str.length > max) {
        return this.error(this.msg || this.field + '_TOO_LONG');
    }
    return this;
};

Validator.prototype.isValidCSC = function(type) {

    this.notNull();

    if (type === 'AMEX') {
        if (this.str.length !== 4) {
            return this.error(this.msg || this.field + '_INVALID');
        }
    } else {
        if (this.str.length !== 3) {
            return this.error(this.msg || this.field + '_INVALID');
        }
    }

    return this;
};

/**
 * Method for validating the user input of month
 * @Param value of the Month sent from the isValidExpirationDate method
 **/
Validator.prototype.isValidMonth = function(value) {
    var months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
        len = months.length;
    if (value.length === 1) {
        value = "0" + value;
    }
    while (len--) {
        if (value === months[len]) {
            return true;
        }
    }
    return false;
};

/**
 * Method for validating the user input of year
 * @Param value of the year sent from the isValidExpirationDate method
 **/
Validator.prototype.isValidYear = function(value) {
    var regEx = new RegExp("^[0-9]+");
    if (!regEx.test(value)) {
        return false;
    }
    var year = new Date().getFullYear().toString().substr(2, 2);
    return (value >= year);
};

/**
 * Method for validating the user input of Expiry date
 * Make use of two method isValidMonth and isValidYear
 * @Param value of the expiry month
 **/
Validator.prototype.isValidExpirationDate = function() {
    var value = this.str.replace(/\s/g, "");
    
    this.notNull();

    var split = value.split("/"),
        month = split[0],
        year = split[1],
        currentYear = parseInt(new Date().getFullYear().toString().substr(2, 2), null), //Missing radix parameter.
        currentMonth = parseInt(new Date().getMonth(), null) + 1, //Missing radix parameter.
        validYear = true,
        validMonth = true;
    if (value.length < 5) {
        return this.error(this.msg || this.field + '_INVALID');
    }
    if (!this.isValidMonth(month)) {
        return this.error(this.msg || this.field + '_INVALID_MONTH');
    } else {
        month = parseInt(month, null); //Missing radix parameter.
    }
    year = parseInt(year, null); //Missing radix parameter.
    
    validYear = (year >= currentYear);
    if (!validYear) {
        return this.error(this.msg || this.field + '_INVALID_YEAR');
    }
    if (year === currentYear) {
        validMonth = (month >= currentMonth);
    }

    if (!validYear || !validMonth) {
        return this.error(this.msg || this.field + '_INVALID');
    }
    return this;
};

Validator.prototype.isValidDateFormat = function (country) {
    var pattern = /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/((19|20)[0-9]{2})$/g; // mm/dd/yyyy

    /*
    if (country !== undefined && country === 'GB') {
        pattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/((19|20)[0-9]{2})$/g; // dd/mm/yyyy
    }
    */

    if(! this.str.match(pattern)){
        return this.error(this.msg || this.field + '_INVALID');
    }
    return this;
};

/**
 * validate AGE over 21 given date formate mm/dd/yyyy
 * @returns {*}
 */
Validator.prototype.isValidAge = function() {
    var now = new Date(),
        userDob = new Date(this.str),
        age = parseInt((now - userDob)/(31557600000),null);
    if(age < 21 || age > 100) {
        return this.error(this.msg || this.field + '_INVALID');
    } else {
        return this;
    }
};

/**
 * validates AGE over 18 given the date format dd/mm/yyyy
 * @returns {*}
 */
Validator.prototype.isOver18 = function() {
    var now = new Date(),
        value = this.str,
        parts = value.split("/"),
        date = new Date(parts[2], parts[1] - 1, parts[0]),
        day = 86400000,
        year = 365.25 * day, // add 1/4 of a day for leap years
        age = (now.getTime() - date.getTime()) / year;

    // only validate if we have a value, else let required validation take over
    if (value && age < 18) {
        return this.error(this.msg || this.field + '_LESS_18');
    } else {
        return this;
    }
};

/**
 * Validation Logic:
 *  PIN should not be null
 *  PIN should consist of only numbers
 *  PIN should be between 4 and 8 characters
 *  If PIN is 4 characters long, it should not consist of the same digits
 *  PIN should not be an increasing sequence of 1 or 2 (1234 and 2468)
 * @returns {*}
 */
Validator.prototype.isValidPin = function() {
    var str = this.str;
    this.notNull();
    this.isNumeric();
    this.len(4, 8);
	if(str.length === 4 && !str.match(/^(?!.*(.).*\1)\d{4}$/)) {
		return this.error(this.msg || this.field + '_INVALID_PATTERN');
	}
	if(str.match(/^(?=\d{4}$)2?4?6?8?$/) || str.match(/^(?=\d{4}$)1?2?3?4?$/) || str.match(/^(?=\d{5}$)1?2?3?4?5?$/) || str.match(/^(?=\d{6}$)1?2?3?4?5?6?$/) || str.match(/^(?=\d{7}$)1?2?3?4?5?6?7?$/) || str.match(/^(?=\d{8}$)1?2?3?4?5?6?7?8?$/)) {
		return this.error(this.msg || this.field + '_INVALID_GUIDELINES');
	}
    return this;
};

module.exports.check = module.exports.validate = module.exports.assert = function(str, field) {
    var validator = new Validator();
    return validator.check(str, field);
};