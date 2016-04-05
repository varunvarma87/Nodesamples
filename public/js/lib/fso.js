/*
 * TODO: This file is a combination of midOpt and flash-jquery, taken verbatim from other flows, except for the addition of jQuery.namespace.
 * We need to see how this can be optimized to include only what's needed and reduce size.
 *
 * lifted verbatim from: https://github.paypal.com/Checkout/Aries/blob/bugfix/public/js/lib/fso.js
 *
 */

define(['jquery'], function($) {

    var PAYPAL = window.PAYPAL || {};

    PAYPAL.namespace = function() {
        var a = arguments, o = null, i, j, d;
        for (i = 0; i < a.length; i = i + 1) {
            d = a[i].split(".");
            o = this;
            for (j = 0; j < d.length; j = j + 1) {
                o[d[j]] = o[d[j]] || {};
                o = o[d[j]];
            }
        }
        return o;
    };

    PAYPAL.namespace('core');

    (function($) {

        PAYPAL.core.Flash = {
            /**
             * Insert a flash video if supported or an image if not.
             * @param {String} flash The flash movie URL
             * @param {int} width The width of the flash movie
             * @param {int} height The height of the flash movie
             * @param {String|DomNode} target The element (or ID of the element) to place the flash movie in.
             * @param {Boolean} replace Set to TRUE to replace the target content. If FALSE, it will append to target.
             * @param {int} minVer The minimum flash version supported for this movie
             * @param {String} id The ID to place on the object tag
             * @param {Boolean} useNonStandard Use a non-standard HTML rendering. This is for including the <embed> tag so that Mozilla will correctly reference the flash object. Requires Platform team approval.
             * @return {Object} A reference to the flash object that was output to the page
             */

            getVersion: function() {
                var flash;
                var i = 3;
                var ver = 0;

                // From navigator object
                if (navigator.plugins && navigator.mimeTypes.length) {
                    flash = navigator.plugins["Shockwave Flash"];
                    if (flash) {
                        ver = parseInt(flash.description.replace(/[^0-9.]/g, ""), 10);
                    }
                }

                // Internet Explorer
                else {
                    flash = true;
                    while (flash) {
                        try {
                            flash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
                            ver = i;
                            i++;
                        } catch (e) {
                            break;
                        }
                    }
                }
                return ver;
            },
            insertFlash: function(flash, width, height, target, replace, minVer, id, useNonStandard, flashVars) {
                // Get target
                if (typeof target == "string") {
                    target = $('#' + target)[0];
                }
                if (!target) {
                    return false;
                }

                // Doesn't match version requirement
                var ver = this.getVersion();

                if (ver == 0 || ver < parseInt(minVer, 10)) {
                    return false;
                }
                if (typeof id !== 'string') {
                    id = 'flashmovie-' + Math.ceil(Math.random() * 500);
                }
                // Default use of non-standard HTML to false
                if (typeof useNonStandard != 'boolean') {
                    useNonStandard = false;
                }

                // Create object
                var objectHtml = '';

                if (navigator.userAgent.match(/msie/i) !== null || useNonStandard) {
                    objectHtml += '<object width="' + width + '" height="' + height + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="' + id + '">';
                }
                else {
                    objectHtml += '<object width="' + width + '" height="' + height + '" data="' + flash + '" type="application/x-shockwave-flash" id="' + id + '">';
                }

                // Parameters
                objectHtml += '<param name="movie" value="' + flash + '"></param>' +
                    '<param name="wmode" value="transparent"></param>' +
                    '<param name="quality" value="high"></param>' +
                    '<param name="menu" value="false"></param>' +
                    '<param name="allowScriptAccess" value="always"></param>';
                if (flashVars) {
                    objectHtml += '<param name="FlashVars" value="' + flashVars + '"></param>';
                }

                // Embed tag
                if (useNonStandard) {
                    objectHtml += '<embed src="' + flash + '" quality="high" width="' + width + '" height="' + height + '" name="' + id + '" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer"';
                    if (flashVars) {
                        objectHtml += ' flashvars="' + flashVars + '"';
                    }
                    objectHtml += '>';
                }
                objectHtml += '</object>';

                if (replace) {
                    target.innerHTML = objectHtml;
                }
                else {
                    target.innerHTML += objectHtml;
                }

                return this.getFlashMovieObject(id);
            },
            /**
             * Returns an object reference to the Flash movie. This is necessary
             * for any page that wants to communicate with the movie via script.
             * @return {Object} Object reference to flash movie in DOM
             */
            getFlashMovieObject: function(movieName) {
                try {
                    if (document.embeds && document.embeds[movieName]) {
                        return document.embeds[movieName];
                    } else if (window.document[movieName]) {
                        return window.document[movieName];
                    }
                }
                catch (e) {
                    return $('#' + movieName);
                }
            }

            /**
             * Gets the current major version of flash installed.
             * The minimum version this will find is 3.x.
             * @return {Number} Version number or zero if it cannot be detected.
             */

        };
    })(jQuery);

    /*
     NOTE: This file is taken verbatim from other flows except for removing the firing of PAYPAL.tns.MIDinit();.
     NOTE: This depends on flash-jquery.js.
     TODO: We need to see how this can be optimized and size reduced.
     */
    (function($) {

        if (!PAYPAL.namespace) {
            return;
        }

        PAYPAL.namespace('common', 'core', 'util', 'bp', 'ks', 'tns', 'core.util', 'core.widget', 'widget', 'global');

        PAYPAL.tns.hiddenFsoFields = {};

        PAYPAL.tns.MIDinit = function() {
            var FsoId = 'midflash';

            if (document.getElementById(FsoId)) {
                return; // skip this step if FSO already exists
            }
            PAYPAL.tns.flashDiv = document.createElement('div');
            // Take the element out of the style flow so it's not impacting the document
            PAYPAL.tns.flashDiv.style.position = 'absolute';
            PAYPAL.tns.flashDiv.style.top = '0';
            document.body.appendChild(PAYPAL.tns.flashDiv);
            PAYPAL.tns.flashRef = PAYPAL.core.Flash.insertFlash(PAYPAL.tns.flashLocation, 1, 1, PAYPAL.tns.flashDiv, true, 8, FsoId, true);
        };

        PAYPAL.tns.flashInit = function() {

            if (PAYPAL.tns.token) {
                PAYPAL.tns.flashRef.writeTokenValue(PAYPAL.tns.token);
            } else {
                try {
                    var token = PAYPAL.tns.flashRef.getTokenValue();
                    if (token) {
                        var tokenVar = {'fso': token};
                        PAYPAL.tns.hiddenFsoFields = $.extend(PAYPAL.tns.hiddenFsoFields, tokenVar);

                    } else {
                        var flashEnabled = {'fso_enabled': PAYPAL.core.Flash.getVersion()};
                        PAYPAL.tns.hiddenFsoFields = $.extend(PAYPAL.tns.hiddenFsoFields, flashEnabled);
                    }
                }
                catch (e) {
                }
            }
            PAYPAL.tns.appendField(PAYPAL.tns.hiddenFsoFields);
        };

        PAYPAL.tns.appendField = function(hiddenFields) {
            $.each(hiddenFields, function(name, val) {
                var field = $('<input></input>').attr('name', name).attr('value', val).attr('type', 'hidden');
                $('form').each(function() {
                    $(field).clone().appendTo(this);
                });

            });
        };
        PAYPAL.tns.detectFsoBlock = function(resultOfFso) {
            if (PAYPAL.tns.loginflow !== null) {
                PAYPAL.tns.hiddenFsoFields = $.extend(PAYPAL.tns.hiddenFsoFields, {'flow_name': PAYPAL.tns.loginflow});
            }
            if (resultOfFso) {
                PAYPAL.tns.flashInit();
            } else {
                var fsoBlocked = {'fso_blocked': '1'}
                PAYPAL.tns.hiddenFsoFields = $.extend(PAYPAL.tns.hiddenFsoFields, fsoBlocked);
                PAYPAL.tns.appendField(PAYPAL.tns.hiddenFsoFields);
            }
        };

        /* NOTE: In the classic paypal world, this worked. In our flow, we are now doing this from content.js.
         $(document).ready(function(){
         PAYPAL.tns.MIDinit();
         });
         */

        window.PAYPAL = PAYPAL;

    })(jQuery);

    window.PAYPAL = window.PAYPAL || PAYPAL;

    PAYPAL.tns.doFso = function(token, viewName) {
        if (token !== '') {
            PAYPAL.tns.token = token;
        } else {
            PAYPAL.tns.token = undefined;
        }

        PAYPAL.tns.loginflow = viewName;
        //PAYPAL.tns.flashLocation = 'https://www.paypalobjects.com/en_US/m/midOpt.swf';
        // This relative path will properly load the file regardless of Stage or LIVE.
        PAYPAL.tns.flashLocation = '/en_US/m/midOpt.swf';
        PAYPAL.tns.MIDinit();
    };
});