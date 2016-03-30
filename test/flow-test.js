'use strict';

const flow = require('../src/flow');
const assert = require('assert');
const sinon = require('sinon');

describe('Flow', () => {
    describe('serial', () => {
        it ('should call callback with error if fail', done => {
            var spy = sinon.spy((error, data) => {
                sinon.assert.calledWith(spy, 'error');
                done();
            });
            var errorFunction = (callback) => {
                setTimeout(callback, 30, 'error', 'data');
            };
            flow.serial([errorFunction], spy);
        });
        it('should call callback when array ends', done => {
            var spy = sinon.spy((error, data) => {
                assert.ok(spy.calledAfter(lastFunction));
                done();
            });
            var lastFunction = sinon.spy((callback) => {
                setTimeout(callback, 20, null, 'data')
            });
            flow.serial([lastFunction], spy);

        });
        it('should call next function with result of previous function', done => {
            var spy = sinon.spy((error, data) => {
                assert.ok(nextFunction.calledWith('previousData'));
                done();
            });
            var previousFunction = (callback) => {
                setTimeout(callback, 30, null, 'previousData');
            };
            var nextFunction = sinon.spy((data, callback) => {
                setTimeout(callback, 20, null, 'result');
            });
            flow.serial([previousFunction, nextFunction], spy);
        });
        it('should call global callback once no matter what', done => {
            var spy = sinon.spy((error, data) => {
                assert.ok(spy.calledOnce);
                done();
            });
            var previousFunction = (callback) => {
                setTimeout(callback, 40, 'firstError', 'previousData');
            };
            var nextFunction = sinon.spy((data, callback) => {
                setTimeout(callback, 5, 'secondError', 'result');
            });
            flow.serial([previousFunction, nextFunction], spy);
        });
        it('shouldn\'t call next function if previous ends with error', done => {
            var spy = (error, data) => {
                assert.equal(nextFunction.callCount, 0);
                done();
            };
            var functionWithError = sinon.spy((callback) => {
                setTimeout(callback, 20, 'firstError', 'previousData');
            });
            var nextFunction = sinon.spy((data, callback) => {
                setTimeout(callback, 10, 'secondError', 'result');
            });
            flow.serial([functionWithError, nextFunction], spy);
        });
        it('shouldn call second function after first', done => {
            var spy = (error, data) => {
                assert.ok(secondFunction.calledAfter(firstFunction));
                done();
            };
            var firstFunction = sinon.spy((callback) => {
                setTimeout(callback, 35, null, 'previousData');
            });
            var secondFunction = sinon.spy((data, callback) => {
                setTimeout(callback, 37, null, 'result');
            });
            flow.serial([firstFunction, secondFunction], spy);
        })
    });
    describe('parallel', () => {
        it('should call global callback once', done => {
            var spy = sinon.spy((error, data) => {
                assert.ok(spy.calledOnce);
                done();
            });
            var firstFunction = (callback) => {
                setTimeout(callback, 9, null, 'firstData');
            };
            var secondFunction = (callback) => {
                setTimeout(callback, 5, null, 'secondData');
            };
            flow.parallel([firstFunction, secondFunction], spy);
        });
        it('should call global callback once if errors', done => {
            var spy = sinon.spy((error, data) => {
                assert.ok(spy.calledOnce);
                done();
            });
            var firstFunction = (callback) => {
                setTimeout(callback, 40, 'firstError', 'firstData');
            };
            var secondFunction = (callback) => {
                setTimeout(callback, 25, 'secondError', 'secondData');
            };
            flow.parallel([firstFunction, secondFunction], spy);
        });
        it('should have all results', done => {
            var spy = sinon.spy((error, data) => {
                assert.ok(spy.withArgs(null, 'firstData'));
                assert.ok(spy.withArgs(null, 'secondData'));
                done();
                return data;
            });
            var firstFunction = (callback) => {
                setTimeout(callback, 4, null, 'firstData');
            };
            var secondFunction = (callback) => {
                setTimeout(callback, 13, null, 'secondData');
            };
            flow.parallel([firstFunction, secondFunction], spy);
        });
    });
    describe('map', () => {
        it('should call with all arguments', done => {
            var mapFunction = sinon.spy((argument) => {
                setTimeout(function(argument) {
                    return argument;
                }, 4)
            });
            var spy = sinon.spy((error, data) => {
                assert.ok(mapFunction.calledWith(4));
                assert.ok(mapFunction.calledWith(8));
                assert.ok(mapFunction.calledWith(15));
                assert.ok(mapFunction.calledWith(16));
                assert.ok(mapFunction.calledWith(23));
                assert.ok(mapFunction.calledWith(42));
                done();
            });
            flow.map([4, 8, 15, 16, 23, 42], mapFunction, spy);
        });
        it('should call global callback once', done => {
            var spy = sinon.spy((error, data) => {
                assert.equal(spy.callCount, 1);
                done();
            });
            var mapFunction = (argument) => {
                setTimeout(function(argument) {
                    return argument;
                }, 5);
            };
            flow.map([4, 8, 15, 16, 23, 42], mapFunction, spy)
        });
        it('should call global callback once if error', done => {
            var spy = sinon.spy((err, data) => {
                if (err) {
                    console.error(err);
                }
                assert.equal(spy.callCount, 1);
                done();
            });
            var mapFunction = (argument) => {
                setTimeout(function(argument) {
                    return('error', argument)
                }, 20);
            };
            flow.map([4, 8, 15, 16, 23, 42], mapFunction, spy)
        });
    });
});
