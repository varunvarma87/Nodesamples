define(['BaseView'], function (BaseView) {

    return BaseView.extend({
        template: 'inc/globalErrorMessage',
        initialize: function (data) {
            this.data = data;
        },
        serialize: function () {
            return this.data;
        },
        afterRender: function () {

            this.$el.find('.hide').removeClass('.hide');
            return BaseView.prototype.afterRender.apply(this, arguments);
            this._clear = clearTimeout.bind(null, setTimeout(Backbone.trigger.bind(Backbone, 'error:hideGlobalErrorMessage'), 10000));
        },
        _clear: function () {
        },
        remove: function () {
            this._clear();
            return BaseView.prototype.remove.call(this);
        }

    });

});