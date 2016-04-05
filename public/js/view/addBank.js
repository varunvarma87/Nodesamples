define(['nougat', 'jquery', 'backbone','numeric','placeholder'], function (nougat, $, Backbone) {

    'use strict';

    var View = Backbone.View.extend({

        el: '#addBank',
	 addBankUrl: Backbone.history.options.root + 'addBank',

        events: {

            'blur #routingNumber': 'retrieveBankName',
            'blur #accountNumber': 'formValidate',
            'click #continue' :'formValidate',
            'focus #routingNumber': 'highlightCheck',
            'focus #accountNumber': 'highlightCheck',
            'focusout #routingNumber': 'removeHighlight',
            'focusout #accountNumber': 'removeHighlight'
        },

        fields: {
            $routingNumber: $('#routingNumber'),
            $accountNumber: $('#accountNumber')
        },
        containers: {
            $bankcontainer: $('#bankDetails'),
            $invalidno: $('#invalidNumber'),
            $rnempty: $("#routingNumberEmpty"),
            $anempty:$("#accountNumberEmpty")

        },

        //initialize form
        initialize: function () {
            var os = (function() {
                var ua = navigator.userAgent.toLowerCase();
                return {
                    isWin: /windows/.test(ua)
                };
            })();
            $('input[type=tel]').numeric();
            $('#bank input').placeholder();
            if(this.fields.$accountNumber.val()!="") {
                this.fields.$accountNumber.closest("div.form-group").addClass('has-error ');
            }
            if (os.isWin && $.browser.mozilla) {
                $("#accountTypeChecking, #accountTypeSavings").addClass('radioffox');
            }
        },

        /**
         * return error on type in routing number less than 9 digits
         * @param e
         */

        formValidate: function(e) {
            var routingNumber = this.fields.$routingNumber.val().length,
                accountNumber = this.fields.$accountNumber.val().length;

            if(accountNumber === 0) {
                this.fields.$accountNumber.closest(".form-group").addClass('has-error');
                this.containers.$anempty.removeClass('hide');
            }
            if(routingNumber === 0){
                this.fields.$routingNumber.closest(".form-group").addClass('has-error');
                this.containers.$rnempty.removeClass('hide');

            }
            else if((routingNumber >= 1 ) && (routingNumber < 9 )) {
                if(this.containers.$bankcontainer.is(':visible')) {
                    this.containers.$bankcontainer.addClass('hide');
                 }
                 this.fields.$routingNumber.closest(".form-group").addClass('has-error');
                 this.containers.$invalidno.removeClass('hide');
                 return false;
            }
        },
        /**
         * retrieves the bank name based on routing number
         * @param e
         */
        retrieveBankName: function (e) {
            console.log("\n\n In retrieveBankName of addBank \n");
            var routingNumber       = this.fields.$routingNumber,
                routingLength       = parseInt(this.$(routingNumber).attr('maxlength')),
                accountNumber       = this.fields.$accountNumber,
                routingNumberLength = $(routingNumber).val().length,
                accountNumberLength = $(accountNumber).val().length;

            this.formValidate(e);
            if (routingNumberLength === 0) {
                this.containers.$bankcontainer.addClass('hide');
            }

            if (routingNumberLength === routingLength)  {
                console.log("\n\n check for routingNumberLength passed \n\n ");
                $('#bankDetails').removeClass('hide');
                $('#bankNameNotFound').addClass('hide');
                $.ajax({
                    type: "POST",
                    url: "getBankName",
                    data: {
                            routingNumber: $(routingNumber).val().replace(/\D/g, '')
                          },
                    dataType: 'json',
                    success: function (response) {
                        $('#bankName').html(response.name);
                        //successful retrival bank name then show bank details
                        if (response.name) {
                            $('#bankDetails').removeClass('hide');
                            $('#bankNameNotFound').addClass('hide');
                        } else {
                            // invalid routing number
                            $('#bankNameNotFound').removeClass('hide');
                            $('#routingNumber').closest(".form-group").addClass('has-error');
                            $('#bankDetails').addClass('hide');
                        }
                    }
                });
            }
        },



        /**
         * highlight check
         * @param e
         */
        highlightCheck: function (e) {
            var ele = this.$(e.currentTarget);

            if (this.$(ele).attr('id') === 'routingNumber') {
                this.$('#highlightAccountNumber').removeClass('highlightAccountNumber');
                this.$('#highlightRoutingNumber').addClass('highlightRoutingNumber');
                this.fields.$routingNumber.closest(".form-group").removeClass('has-error');
                this.fields.$routingNumber.siblings('.help-block').addClass('hide');

            } else if (this.$(ele).attr('id') === 'accountNumber'){
                this.$('#highlightRoutingNumber').removeClass('highlightRoutingNumber');
                this.$('#highlightAccountNumber').addClass('highlightAccountNumber');
                this.fields.$accountNumber.closest(".form-group").removeClass('has-error');
                this.fields.$accountNumber.siblings('.help-block').addClass('hide');
            }
        },

        /**
         * remove highlight on check
         * @param e
         */
        removeHighlight: function (e) {
            var ele = this.$(e.currentTarget);

            if (this.$(ele).attr('id') === 'routingNumber') {
                this.$('#highlightRoutingNumber').removeClass('highlightRoutingNumber');
            } else {
                this.$('#highlightAccountNumber').removeClass('highlightAccountNumber');
            }
        },

        render: function () {

        }
    });

    return  new View();

});
