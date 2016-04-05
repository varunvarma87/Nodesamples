/**
 * restrict behaviour of input elements
 *
 * DESCRIPTION: Numeric, alpha & alpha numeric extend to any other in future
 *
 * USAGE:
 *
 * REQUIRED FILES:
 *	jquery-1.7.1.min.js
 *	jQuery-ui-widgets-1.8.16.min.js
 *
 */
define(['jquery', 'jqueryUI'], function ($) {

    "use strict";

    $.widget('pp.restrict', {

        options: {
            allow: 'numeric'
        },
        /**
         * Widget constructor
         * @private
         */
        _create: function () {
            this._addListeners();
        },

        /**
         * Sets up event listeners for the input field
         * @private
         */
        _addListeners: function () {
            this.element.bind('paste', $.proxy(this._paste, this));
            this.element.bind('keypress', $.proxy(this._keypress, this));
            this.element.bind('keydown', $.proxy(this._keydown, this));
            this.element.bind('blur', $.proxy(this._validate, this));
        },

        /**
         * decides which restrict option to call
         * @param e
         * @returns {boolean}
         * @private
         */
        _keypress: function (e) {
            if (this.options.allow === 'numeric') {
                return this._onlyNumeric(e);
            }
        },

        /**
         * allow only numeric
         * @param e
         * @returns {boolean}
         * @private
         */
        _onlyNumeric: function (e) {
            var $target, input;

            $target = $(e.target);
            if (e.metaKey || e.ctrlKey) {
                return true;
            }
            if (e.which === 32) {
                return false;
            }
            if (e.which === 0) {
                return true;
            }
            if (e.which < 33) {
                return true;
            }
            input = String.fromCharCode(e.which);
            return !!/[\d\s]/.test(input);
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
            if (($target.prop('selectionStart') !== null) && $target.prop('selectionStart') !== value.length) {
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
         * on paste remove non-allowed options & fires validations
         * @param e
         * @private
         */
        _paste: function (e) {
            if (e.type === 'paste') {
                var val = e.originalEvent.clipboardData.getData('Text');
                if (val.length) {
                    var formatted = this._format(val);
                    this.element.val(formatted);
                    this._validate(this.options.allow);
                }
            }
        },

        /**
         * formats value based on option passed to it.
         * @param val
         * @returns {*}
         * @private
         */
        _format: function (val) {
            if (this.options.allow === "numeric") {
                val = val.replace(/\D/g, '');
            }
            return val;
        },

        /**
         * validates the input based on options
         * @private
         */
        _validate: function () {
            var val = this.element.val();
            if (this.options.allow === 'numeric') {
                if (/^\d+$/.test(val)) {
                    // input is valid
                    this.element.parent().removeClass('hasError error-format');
                } else {
                    // input is invalid
                    this.element.parent().addClass('hasError error-format');
                }
            }
        }
    });

});
