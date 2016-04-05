define(['nougat', 'jquery', 'backbone','placeholder'], function (nougat, $, Backbone) {

    'use strict';

    var View = Backbone.View.extend({

        el: '#confirmBank',

        //initialize form
        initialize: function () {
            $('#confirmBank input').placeholder();
        },

        events: {
            'click .continueButton': 'submitForm',
            'blur #bankUserName': 'validateForm',
            'blur #bankPassword': 'validateForm',
            'focus #bankUserName': 'clearError',
            'focus #bankPassword': 'clearError'
        },
        fields: {
            $uname: $('#bankUserName'),
            $pwd: $('#bankPassword')
        },
        containers: {
            $unameEmpty: $('#bankUserNameEmpty'),
            $pwdEmpty: $('#bankPasswordEmpty')

        },

        validateForm: function(e) {
            var userName = this.fields.$uname.val(),
                password = this.fields.$pwd.val();

            if(userName === "" ){
                this.fields.$uname.closest(".form-group").addClass('has-error');
                this.containers.$unameEmpty.removeClass('hide');

            }
            else if (password === "" ){
                this.fields.$pwd.closest(".form-group").addClass('has-error');
                this.containers.$pwdEmpty.removeClass('hide');
            }

        },
        clearError: function(e) {
            var ele = this.$(e.currentTarget);
            if (this.$(ele).attr('id') === 'bankUserName') {
                this.fields.$uname.closest(".form-group").removeClass('has-error');
                this.fields.$uname.siblings('.help-block').addClass('hide');
            }
            else if (this.$(ele).attr('id') === 'bankPassword') {
                this.fields.$pwd.closest(".form-group").removeClass('has-error');
                this.fields.$pwd.siblings('.help-block').addClass('hide');
            }

        },

        submitForm: function (e) {
           this.validateForm();

            var userName = this.fields.$uname.val(),
                password = this.fields.$pwd.val();

            if(userName !="" && password !="") {
                $('.containerWrapper').addClass('backgroundFade');
                $('#loading').removeClass('hide');
                $('#confirmBank').submit();

            }
        },
            /**
         * render view
         */
        render: function () {

        }
    });

    return  new View();
});
