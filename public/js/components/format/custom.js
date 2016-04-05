/**
 * custom formatter
 *
 * REQUIRED FILES:
 *    jquery-1.7.1.min.js
 *    jQuery-ui-widgets-1.8.16.min.js
 *
 */
define(['jquery', 'jqueryUI'], function ($) {

    'use strict';


    var ua = navigator.userAgent,
        chrome = /chrome/i.test(ua),
        android = /android/i.test(ua);

    $.widget('pp.custom', {

        /**
         * Widget get/set options
         */
        _getCreateOptions: function () {
            var format = this.element.data("format");
            return {
                format: format,
                pattern: this.element.attr("pattern"),
                digits: (format.replace(/\W/g, '')).length
            };
        },

        /**
         * Widget constructor
         * @private
         */
        _create: function () {
            this._load();
            this._addListeners();
            // android chrome doesn't fire keypress
            if (android && chrome) {
                this.element.bind('keyup', $.proxy(this._keyup, this));
            }
        },

        /**
         * Sets up event listeners for the input field
         * @private
         */
        _addListeners: function () {
            this.element.bind('keypress', $.proxy(this._numeric, this));
            this.element.bind('keypress', $.proxy(this._restrict, this));
            this.element.bind('keypress', $.proxy(this.format, this));
            this.element.bind('keydown', $.proxy(this._keydown, this));
            this.element.bind('paste', $.proxy(this._paste, this));
            this.element.bind('blur', $.proxy(this._blur, this));
        },

        /**
         * callback for load
         * @private
         */
        _load: function () {
            if (this.element.val().length === this.options.digits) {
                this.element.val(this.formatVal(this.element.val()));
            }
            // when input formatter is initiated
            // check the input field for value
            // if a number is present, format it
            if (this.element.val() !== '' && !this.element.parent().hasClass('hasError')) {
                this._blur();
            }
        },

        /**
         * allow only numeric
         * @param e
         * @returns {boolean}
         * @private
         */
        _numeric: function (e) {
            var input;

            if (e.metaKey || e.ctrlKey) {
                return true;
            }
            if (e.which === 32) {
                return false;
            }
            if (e.which < 33) {
                return true;
            }
            input = String.fromCharCode(e.which);
            return !!/[\d\s]/.test(input);
        },

        /**
         * restrict to numeric, length on keypress
         * @param e
         * @returns {boolean}
         * @private
         */
        _restrict: function (e) {
            var $target,
                digit,
                value;

            $target = $(e.currentTarget);
            digit = String.fromCharCode(e.which);
            if (!/^\d+$/.test(digit)) {
                return;
            }
            if ($target.prop('selectionStart') !== null && $target.prop('selectionStart') !== $target.prop('selectionEnd')) {
                return;
            }
            value = $target.val() + digit;
            value = value.replace(/\D/g, '');

            if ((value.length > this.options.digits)) {
                return false;
            }
        },

        /**
         * restrict & format on keydown
         * @param e
         * @returns {*}
         * @private
         */
        _keydown: function (e) {
            var $target, value;

            if (e.meta) {
                return;
            }
            $target = $(e.currentTarget);
            value = $target.val();
            if (e.which !== 8) {
                return;
            }
            if ($target.prop('selectionStart') !== null && $target.prop('selectionStart') !== value.length) {
                return;
            }
            if (/\d(\s|\-)+$/.test(value)) {
                e.preventDefault();
                return $target.val(value.replace(/\d(\s|\-)+$/, ''));
            } else if (/\s\-\s?\d?$/.test(value)) {
                e.preventDefault();
                return $target.val(value.replace(/\s\-\s?\d?$/, ''));
            }
        },

        /**
         * Callback for the blur event on the
         * phone input element.
         * @method _blur
         */
        _blur: function (e) {
            var val = this.element.val();
            // android chrome has issue with keypress event so format in blur
            if (android && chrome && val.length === this.options.digits) {
                var formatted = this.formatVal(val);
                this.element.val(formatted);
            }
            this._validate();
        },

        /**
         * Callback for the paste event. This method is called only when the paste event if fired.
         * @param e
         * @private
         */
        _paste: function (e) {
            var val = e.originalEvent.clipboardData.getData('Text');
            if (val.length) {
                val = val.replace(/\D/g, '');
                if (val.length > this.options.digits) {
                    val = val.substr(0, this.options.digits);
                }
                var formatted = this.formatVal(val);
                this.element.val(formatted);
                e.preventDefault();
                e.stopImmediatePropagation();
                this._validate();
            }
        },

        /**
         * android - chrome doesn't fire keypress event so formatting with keyup
         * @param e
         * @private
         */
        _keyup: function (e) {
            var formatted, $target, val, value;

            $target = $(e.currentTarget);
            val = $target.val();
            formatted = this.formatVal(val);
            e.preventDefault();
            $target.val('' + formatted);
            if (android) {
                value = $target.val();
                $target.value = '';
                $target.value = value;
            }
        },

        /**
         * Callback for the blur, keyup event on the
         * phone input element.
         * @method _format
         * @param  e
         */
        format: function (e) {
            var formatted, $target, digit, old_val, val, value, currentTarget = e.currentTarget, start, end, charArr;

            digit = String.fromCharCode(e.which);
            if (!/^\d+$/.test(digit)) {
                return;
            }
            $target = $(currentTarget);
            old_val = $target.val();
            if (currentTarget.selectionStart || currentTarget.selectionStart == '0') {
                start = currentTarget.selectionStart, end = currentTarget.selectionEnd,
                    charArr = old_val.split(''),
                    charArr.splice(start, end - start, digit),
                    val = charArr.join('');
            } else {
                val = old_val + digit;

            }
            formatted = this.formatVal(val);
            e.preventDefault();
            $target.val('' + formatted);
            if (android) {
                value = $target.val();
                $target.value = '';
                $target.value = value;
            }
        },

        /**
         * Method used for formatting the value
         * @method formatVal
         * @param  val
         */
        formatVal: function (val) {
            var text = this.options.format,
                i;
            val = val.replace(/\D/g, ''); // get only digits
            for (i = 0; i < val.length; i++) {
                text = text.replace(/X/, val[i]);
            }
            if (val.length !== this.options.digits && text.indexOf('X') !== -1) {
                text = text.substring(0, text.indexOf('X'));
            }
            return text;
        },

        /**
         * Validates the input the user has given in the phone input field
         * against a regular expression to determine if it is valid
         *
         * @method _validate
         */
        _validate: function () {
            var val = this.element.val(),
                pattern = this.options.pattern ? new RegExp(this.options.pattern) : false;
            if (pattern && val !== '') {
                if (pattern.test(val)) {
                    this.element.parent().removeClass('hasError'); // number is valid
                } else {
                    this.element.parent().addClass('hasError'); // number is invalid
                }
            }
        }
    });

});