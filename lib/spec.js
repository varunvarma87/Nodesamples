'use strict';

module.exports = function spec() {

    return {
        //The deployment scripts will insert a 'vault' section in config.json if the app uses shared keystore
       // vault: require('../config/config.json').vault,
        onconfig: function(config, next) {
            next(null, config);
        }
    };
};
