/* global require:true, module:true */
'use strict';

var servicecore  = require('servicecore'),
    userRead = require('userread-paypal'),
    LoadUserDataModel = require('./loadUserData');
    servicecore.register('userread-paypal', userRead);

function UserModel () {
    this.address = [];
    this.phone = [];
}


UserModel.prototype = {
    /**
     * load user data
     * @param user
     * @param callback
     * @param profileInfo
     */
    load: function (req, callback) {
        var actor = req && req.securityContext && req.securityContext.actor,
            model = new LoadUserDataModel(actor);
        var userReadClient = servicecore.create('userread-paypal');
        userReadClient.load_user_data(model, function (err, result) {
            if (err || result.statusCode !== 200) {
                return callback(err || new Error('Could not load user data'));
            }
            callback(err, result.body);
        });
    }
};

module.exports = UserModel;
