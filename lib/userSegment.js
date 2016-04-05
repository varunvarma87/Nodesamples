"use strict";

var services = require("servicecore"),
    //ErrorModel          = require('./errorModel'),
    segmentRead;


module.exports = {
    getSegmentInfo: function (req, res, callback) {
        var segments;
        var self = this;
        if (!segmentRead) {
            segmentRead = services.create('segmentread-paypal');
        }
        var payload = {
            accountNumber: req.user.accountNumber,
            getDetails: false,
            trackingIdentifier: null,
            publicCredential: null,
            segmentFilter: null
        };

        segmentRead.profile(req).get_segments(payload, function (err, response) {
            if (err || response.statusCode !== 200) {
                req.log('debug', 'userSegment getSegmentInfo call status ' + response.statusCode);
                //handle errors
                //callback(self.processErrors(req, response), response);
                callback(err,response);
            } else {
                req.log('info', 'userSegment getSegmentInfo call success');
                if (response.body !== undefined) {
                    segments = response.body.segments;
                }
                callback(err,segments);

            }

        });
    }

    /*
     * processErrors from response
     * @param req
     * @param result
     * @returns {string}
     */
    /*processErrors: function(req, result) {
        req.model.data.errors = new ErrorModel();
        if (result !== undefined && result.body !== undefined && result.body.details !== undefined && result.body.details.length) {
            req.log('debug', result.body.details);
            var index;
            for(index = 0; index < result.body.details.length; index++ ) {
                req.model.data.errors.autoPopulateError(result.body.details[index].code, req);
            }
        }else{
            req.model.data.errors.addGlobalError('internalServerError');
        }
        return 'Err';
    }*/
};


