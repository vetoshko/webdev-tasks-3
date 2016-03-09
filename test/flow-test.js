'use strict';

const flow = require('../src/flow');
const assert = require('assert');
const sinon = require('sinon');

describe('Flow', () => {
    describe('serial', () => {
        it ('should call callback with error if fail', () => {
            var spy = sinon.spy((error, data) => {});
            var errorFunction = (callback) => {
                callback('error', 'data');
            };
            flow.serial([errorFunction], spy);
            assert.ok(spy.calledWith('error'));
        });
        it('should call callback when array ends', () => {
            var spy = sinon.spy((error, data) => {});
            var lastFunction = (callback) => {
                callback(null, 'data')
            };
            flow.serial([lastFunction], spy);
            assert.ok(spy.calledWith(null, 'data'));
        });
        it('should call next function with result of previous function', () => {
            var spy = sinon.spy((error, data) => {});
            var previousFunction = (callback) => {
                callback(null, 'previousData');
            };
            var nextFunction = sinon.spy((data, callback) => {
                callback(null, 'result');
            });
            flow.serial([previousFunction, nextFunction], spy);
            assert.equal(spy.callCount, 1);
            assert.ok(nextFunction.calledWith('previousData'));
        });
        it('should call global callback once no matter what (I got your back)', () => {
            var spy = sinon.spy((error, data) => {});
            var previousFunction = (callback) => {
                callback('firstError', 'previousData');
            };
            var nextFunction = sinon.spy((data, callback) => {
                callback('secondError', 'result');
            });
            flow.serial([previousFunction, nextFunction], spy);
            assert.equal(spy.callCount, 1);
        })
    });
    describe('parallel', () => {
        it('should call global callback once', () => {
            var spy = sinon.spy((error, data) => {});
            var firstFunction = (callback) => {
                callback(null, 'firstData');
            };
            var secondFunction = (callback) => {
                callback(null, 'secondData');
            };
            flow.parallel([firstFunction, secondFunction], spy);
            assert.ok(spy.calledOnce);
        });
        it('should call global callback once if errors', () => {
            var spy = sinon.spy((error, data) => {});
            var firstFunction = (callback) => {
                callback('firstError', 'firstData');
            };
            var secondFunction = (callback) => {
                callback('secondError', 'secondData');
            };
            flow.parallel([firstFunction, secondFunction], spy);
            assert.ok(spy.calledOnce);
        });
        it('should have all results', () => {
            var spy = sinon.spy((error, data) => {
                return data;
            });
            var firstFunction = (callback) => {
                callback('firstError', 'firstData');
            };
            var secondFunction = (callback) => {
                callback('secondError', 'secondData');
            };
            flow.parallel([firstFunction, secondFunction], spy);
            assert.equal(spy.length, 2);
        });
    });
    describe('map', () => {
        it('should call with all arguments', () => {
            var mapFunction = sinon.spy((argument) => {
                return argument;
            });
            var spy = sinon.spy((error, data) => {});
            flow.map([4, 8, 15, 16, 23, 42], mapFunction, spy);
            assert.ok(mapFunction.calledWith(4));
            assert.ok(mapFunction.calledWith(8));
            assert.ok(mapFunction.calledWith(15));
            assert.ok(mapFunction.calledWith(16));
            assert.ok(mapFunction.calledWith(23));
            assert.ok(mapFunction.calledWith(42));
        });
        it('should call global callback once', () => {
            var spy = sinon.spy((error, data) => {});
            var mapFunction = (argument) => {
                return argument
            };
            flow.map([4, 8, 15, 16, 23, 42], mapFunction, spy)
            assert.equal(spy.callCount, 1);
        });
    });
});
