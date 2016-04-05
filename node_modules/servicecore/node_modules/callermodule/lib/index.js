'use strict';

var path = require('path'),
    fs = require('fs');

module.exports = function callermodule() {
    return lookup(path.dirname(caller()));
};

/**
 * Modification of @totherik's module wrapper of @substack's `caller.js`
 * @original: https://www.npmjs.org/package/caller
 */
function caller() {
    var pst, stack, file, frame;

    pst = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        Error.prepareStackTrace = pst;
        return stack;
    };

    stack = (new Error()).stack;
    stack = stack.slice(3);

    do {
        frame = stack.shift();
        file = frame && frame.getFileName()
    } while (stack.length && file === 'module.js');

    return file;
}

function lookup(dir) {
    var file, parent;

    file = path.join(dir, 'package.json');

    if (fs.existsSync(file)) {
        return require(file).name;
    }

    parent = path.dirname(dir);

    if (parent !== dir) {
        return lookup(parent);
    }

    return undefined;
}
