/*global window:true, jQuery:true, document:true */
/**
 * Behaviour For Numeric field
 *
 * DESCRIPTION: this file helps to:
 * allow only numeric characters,
 * allow copy - paste
 *
 * USAGE: $('input').numeric();
 *
 * REQUIRED FILES:
 *	jquery-1.7.1.min.js
 *	jQuery-ui-widgets-1.8.16.min.js
 *
 */
/**
 * Dev Note: KeyCode explanations
 * 46: backspace
 * 8: delete
 * 9: tab
 * 27: esc
 * 13: enter
 * 32: space
 * 35: home
 * 109: negative sign
 * 38: up arrow
 * 40: down arrow
 * 33: page Up
 * 34: page Down
 * 65: A (select All)
 * 67: C (copy)
 * 86: V (paste)
 * 88: X (cut)
 * 89: Y (redo)]
 * 90: Z (undo)
 */
(function ($) {

    "use strict";

    $.widget("pp.numeric", {
        /**
         * Widget constructor
         * @private
         */
        _create: function () {
            this._getElements();
            this._addListeners();
        },

        _getElements: function () {
            this.elements = {};
            this.elements.input = this.element;
        },

        _addListeners: function () {
            this.elements.input.bind('keydown', $.proxy(this._check, this));
            this.elements.input.bind("keyup paste", $.proxy(this._paste, this));
        },

        _paste: function (event) {
            var ele, val = (ele = $(this.element)).val();
			if (event.keyCode >= 37 && event.keyCode <= 40) { // Let user navigate to on field using four arrow keys.
				return;
			} else {
				$(ele).val(val.replace(/[^\d]/g, ""));
			}
        },

        _check: function (event) {
            var ctrlKey = event.ctrlKey;
            if (event.metaKey && !ctrlKey) {
                ctrlKey = event.metaKey;
            }
            // Allow: backspace, delete, tab, escape, and enter
            if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 9 || event.keyCode === 27 || event.keyCode === 13 ||
                // Allow: Ctrl+A
                (event.keyCode === 65 && ctrlKey === true) ||
                // Allow: Ctrl+V
                (ctrlKey === true && (event.keyCode === 118 || event.keyCode === 86)) ||
                // Allow: Ctrl+c
                (ctrlKey === true && (event.keyCode === 99 || event.keyCode === 67)) ||
                // Allow: Ctrl+x
                (ctrlKey === true && (event.keyCode === 120 || event.keyCode === 88)) ||
                // Allow: home, end, left, right
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            } else {
                // Ensure that it is a number and stop the keypress
                if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && ((event.keyCode < 96 || event.keyCode > 105))) {
                    event.preventDefault();
                }
            }
        }
    });
})(jQuery);
