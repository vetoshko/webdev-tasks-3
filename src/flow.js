'use strict';

module.exports.serial = function (functionsArray, callback) {
    var currentIndex = 0;
    var currentCallback = function (error, nextData) {
        if (currentIndex === functionsArray.length - 1 || error) {
            callback(error, nextData);
        } else {
            currentIndex++;
            functionsArray[currentIndex](nextData, currentCallback);
        };
    };
    functionsArray[0](currentCallback);
};

module.exports.parallel = function (functionsArray, callback) {
    var accArray = [];
    var hasErrors = false;
    functionsArray.forEach(function (currentFunction, index, functionsArray) {
        currentFunction(function (error, data) {
            if (hasErrors) {
                return;
            }
            if (error) {
                hasErrors = true;
                callback(error);
            }
            accArray[index] = data;
            if (index === functionsArray.length - 1) {
                callback(error, accArray);
            }
        });
    });
};

module.exports.map = function (valuesArray, func, callback) {
    var accArray = [];
    var callbackError = null;
    var hasErrors = false;
    var counter = 0;
    var createCallback = function (i) {
        return function (error, nextData) {
            if (error) {
                if (hasErrors) {
                } else {
                    callbackError = error;
                    hasErrors = true;
                }
            } else {
                accArray[i] = nextData;
            }
        };
    };
    for (var i = 0; i < valuesArray.length; i++) {
        func(valuesArray[i], createCallback(i));
    };
    callback(callbackError, accArray);
};

module.exports.makeAsync = function (func) {
    return function(data, callback) {
        try {
            var result = func(data);
            callback(null, result);
        }
        catch(e) {
            callback(e);
        }
    };
}
