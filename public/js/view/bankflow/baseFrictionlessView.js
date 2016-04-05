/**
 * Created by juspears on 10/23/14.
 */
define(['BaseView', 'appRouter', 'underscore', 'jquery', 'restrict', 'numeric', 'placeholder'], function (BaseView, appRouter, _) {

    "use strict";

    /**
     * Helper function allows for plugins to be declared.
     * <code>
     * {
     *   plugins:{
     *     '.someNodeSelector':'dob',
     *     '.someNodeSelector':'plugin1 plugin2 plugin3',
     *     '#someNode':[function(node){ node.doPlugin({stuff:this.isOn}) }, 'other']
     *
     *   }
     * }
     * </code>
     * @param v
     * @param k
     */
    function handlePlugins(v, k) {

        if (typeof v === 'function') {
            v.call(this, this.$(k));
        } else {
            _.each(_.isArray(v) ? v : v.split('\s+'), function eachHandlePlugin(vv, kk) {
                if (typeof vv === 'function') {
                    handlePlugins.call(this, vv, k);
                } else {
                    var parts = vv.split('.'), $node = this.$(k), p;
                    while ($node && parts.length) {
                        p = parts.shift();
                        if (typeof $node[p] === 'function') {
                            $node = $node[p]();
                        } else {
                            $node = $node[p];
                        }
                    }
                }
            }, this);
        }
    }


    return BaseView.extend({
        template: 'frictionLessBankLogIn',
        events: {
            'click .disabled': function (e) {
                e.preventDefault()
            },
            'click a.subview': 'onAction',
            'submit': 'onAction',
            'click #skipLink': 'toggleContent',
            'change input': 'hideGlobalError'
        },

        _track: function () {
        },
        hideGlobalError: function () {
            Backbone.trigger('error:hideGlobalErrorMessage');
        },
        initialize: function (opts) {
            _.bindAll(this, 'navigate', 'loadView', 'onSubmitSuccess', 'onSubmitError', 'onAction');
            opts = opts || {};
            this._data = opts;
            this.bankId = opts.bankId;
        },

        serialize: function () {
            if (this._data && this._data.data) {
                return this._data;
            }
            var p = $.Deferred();
            $.getJSON((_.result(this, 'url') || this._url) + (this.bankId ? '/' + this.bankId : '')).then(function (response) {
                if (response.data.errors) {
                    p.reject(response);
                } else {
                    p.resolve(response);
                }
            }, p.reject);
            return p;
        },
        onAction: function bankLogin$onAction(e) {
            e && e.preventDefault();
            this._track('action', e);

            this.hideGlobalError();
            this.$el.addClass('disabledForm');
            this.submit($(e.target));
        },
		afterRender: function () {
            _.each(_.result(this, 'jqueryPlugins'), handlePlugins, this);
            this.$el.removeClass('disabledForm');

        },
        navigate: function (json, opts) {
            if (!json) {
                json = {};
            }
            this.handleGlobalError(json);
            if (json.redirect) {
                window.location = json.redirect;
                return;
            }
            appRouter.navigate(json.redirect || json.view || json.viewName || json, _.extend({trigger: true}, opts));
        },
        loadView: function (view, data) {
            return appRouter.spaView(view, data, this.$el);
        },
        handleGlobalError: function (data) {
            data = data.data || data;
            if (data && data.errors && data.errors && data.errors.global) {
                Backbone.trigger('error:globalErrorMessage', data.errors);
                return true;
            }
            return false;
        },
        onSubmitSuccess: function () {
            this.$el.removeClass('disabledForm');
            this.navigate.apply(this, arguments);
        },
        onSubmitError: function () {
            this.$el.removeClass('disabledForm');
            this.renderError.apply(this, arguments);

        },
        submit: function bankLogin$submit(ele) {
            var $ele = $(ele), method = $ele.is('form') ? 'post' : 'get',
                url = $ele.attr('action') || $ele.attr('href') || _.result(this, 'url'),
                params = $ele.is('form') ? $ele.serialize() + '&_eventId_continue=Continue' : [], p = $.Deferred();

            this.uri = url;
            this.$el.addClass('disabledForm');

            p.then(this.onSubmitSuccess, this.onSubmitError).then(this._track.bind(null, 'submit-success'), this._track.bind(null, 'submit-failure'));

            $.ajax({
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                type: method,
                url: url,
                data: params
            })
                .fail(p.reject)
                .done(function (response) {
                if (!response || response.data && response.data.errors) {
                    p.reject(response);
                } else {
                    p.resolve(response);
                }
            });

            return p;

        },

        /**
         * toggle content when link clicked
         * @param e
         */
        toggleContent: function (e) {
            e && e.preventDefault();
            this.$('.skipLinkHolder').addClass('hide');
            this.$('#skipInfoContent').removeClass('hide');
        },
        renderError: function (response) {
            if (response && response.status > 399) {
                this.navigate({redirect: '/myaccount/home'});
            } else {
                this.handleGlobalError(response);
            }

        }
    });
});
