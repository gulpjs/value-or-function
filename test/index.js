'use strict';

var expect = require('expect');

var normalize = require('../');

describe('normalize', function() {

  it('compares a type and the type of a value', function(done) {
    var type = 'string';
    var value = 'test string';
    var result = normalize(type, value);
    expect(result).toEqual(value);
    done();
  });

  it('returns null if value does not match type', function(done) {
    var type = 'string';
    var value = 1;
    var result = normalize(type, value);
    expect(result).toEqual(null);
    done();
  });

  it('supports arrays for the type parameter', function(done) {
    var type = ['string'];
    var value = 'test string';
    var result = normalize(type, value);
    expect(result).toEqual(value);
    done();
  });

  it('compares each type and the type of the value', function(done) {
    var type = ['number', 'string', 'object'];
    var value = 'test string';
    var result = normalize(type, value);
    expect(result).toEqual(value);
    done();
  });

  it('returns null if value does not match any type', function(done) {
    var type = ['string', 'undefined'];
    var value = 1;
    var result = normalize(type, value);
    expect(result).toEqual(null);
    done();
  });

  it('supports functions for the type parameter', function(done) {
    var type = function() {
      return true;
    };
    var value = 1;
    var result = normalize(type, value);
    expect(result).toEqual(value);
    done();
  });

  it('calls the type function to attempt coercion', function(done) {
    var expected = 1;
    var type = expect.createSpy().andCall(function(value) {
      return value;
    });
    var result = normalize(type, expected);
    expect(result).toEqual(expected);
    expect(type).toHaveBeenCalled();
    done();
  });

  it('calls the value if it is a function', function(done) {
    var type = 'string';
    var expected = 'test string';
    var value = expect.createSpy().andCall(function() {
      return expected;
    });
    var result = normalize(type, value);
    expect(result).toEqual(expected);
    expect(value).toHaveBeenCalled();
    done();
  });

  it('checks the result of function against coercer', function(done) {
    var expected = 'test string';
    var coercer = expect.createSpy().andCall(function(value) {
      return (typeof value === 'string') ? value : null;
    });
    var value = expect.createSpy().andCall(function() {
      return expected;
    });
    var result = normalize(coercer, value);
    expect(result).toEqual(expected);
    expect(coercer).toHaveBeenCalled();
    expect(value).toHaveBeenCalled();
    done();
  });

  it('calls the function, passing extra arguments', function(done) {
    var type = 'string';
    var expected = 'test string';
    var value = expect.createSpy().andCall(function(arg) {
      return arg;
    });
    var result = normalize(type, value, expected);
    expect(result).toEqual(expected);
    expect(value).toHaveBeenCalled();
    done();
  });

  it('returns null if result of function does not match type', function(done) {
    var type = 'string';
    var value = expect.createSpy().andCall(function() {
      return 123;
    });
    var result = normalize(type, value);
    expect(result).toEqual(null);
    expect(value).toHaveBeenCalled();
    done();
  });

  it('rejects if function return val doesn\'t satisfy custom coercer', function(done) {
    var coercer = expect.createSpy().andCall(function(value) {
      return (typeof value === 'string') ? value : null;
    });
    var value = expect.createSpy().andCall(function() {
      return 123;
    });
    var result = normalize(coercer, value);
    expect(result).toEqual(null);
    expect(coercer).toHaveBeenCalled();
    expect(value).toHaveBeenCalled();
    done();
  });
});

describe('normalize.object', function() {

  it('compares value to typeof object', function(done) {
    var obj = {};
    var arr = [];
    var numObj = new Number(1);
    var strObj = new String('test');
    var objResult = normalize.object(obj);
    var arrResult = normalize.object(arr);
    var numObjResult = normalize.object(numObj);
    var strObjResult = normalize.object(strObj);
    expect(objResult).toEqual(obj);
    expect(arrResult).toEqual(arr);
    expect(numObjResult).toEqual(numObj);
    expect(strObjResult).toEqual(strObj);
    done();
  });

  it('rejects value if it is null', function(done) {
    var value = null;
    var result = normalize.object(value);
    expect(result).toEqual(null);
    done();
  });

  it('rejects values if not Object', function(done) {
    var value = 'invalid';
    var result = normalize.object(value);
    expect(result).toEqual(null);
    done();
  });
});

describe('normalize.number', function() {

  it('accepts value if typeof number', function(done) {
    var value = 1;
    var result = normalize.number(value);
    expect(result).toEqual(value);
    done();
  });

  it('accepts value if it is not-a-number', function(done) {
    var value = Number.NaN;
    var result = normalize.number(value);
    expect(Number.isNaN(result)).toEqual(true);
    done();
  });

  it('accepts value if it is infinite', function(done) {
    var value = Number.NEGATIVE_INFINITY;
    var result = normalize.number(value);
    expect(result).toEqual(value);
    done();
  });

  it('accepts value if instanceof Number', function(done) {
    var expected = 1;
    var value = new Number(expected);
    var result = normalize.number(value);
    expect(result).toEqual(expected);
    done();
  });

  it('rejects values that won\'t coerce to number', function(done) {
    var value = 'invalid';
    var result = normalize.number(value);
    expect(result).toEqual(null);
    done();
  });
});

describe('normalize.string', function() {

  it('accepts value if typeof string', function(done) {
    var value = 'test string';
    var result = normalize.string(value);
    expect(result).toEqual(value);
    done();
  });

  it('accepts value if instanceof String', function(done) {
    var expected = 'test string';
    var value = new String(expected);
    var result = normalize.string(value);
    expect(result).toEqual(expected);
    done();
  });

  it('accepts value if it is an Object', function(done) {
    var expected = 'test string';
    var value = {
      toString: function() {
        return expected;
      },
    };
    var result = normalize.string(value);
    expect(result).toEqual(expected);
    done();
  });

  it('rejects Object if its toString doesn\'t return string', function(done) {
    var value = {
      toString: function() {
        return {};
      },
    };
    var result = normalize.string(value);
    expect(result).toEqual(null);
    done();
  });

  it('rejects values that won\'t coerce to string', function(done) {
    var value = undefined;
    var result = normalize.string(value);
    expect(result).toEqual(null);
    done();
  });
});

describe('normalize.symbol', function() {

  it('compares value to typeof symbol', function(done) {
    if (!global.Symbol) {
      console.log('Only available on platforms that support Symbol');
      this.skip();
      return;
    }

    var value = Symbol();
    var result = normalize.symbol(value);
    expect(result).toEqual(value);
    done();
  });

  it('rejects values that are not Symbol', function(done) {
    if (!global.Symbol) {
      console.log('Only available on platforms that support Symbol');
      this.skip();
      return;
    }
    var value = 'invalid';
    var result = normalize.symbol(value);
    expect(result).toEqual(null);
    done();
  });
});

describe('normalize.boolean', function() {

  it('accepts value if typeof boolean', function(done) {
    var value = true;
    var result = normalize.boolean(value);
    expect(result).toEqual(value);
    done();
  });

  it('accepts value if instanceof Boolean', function(done) {
    var expected = true;
    var value = new Boolean(expected);
    var result = normalize.boolean(value);
    expect(result).toEqual(expected);
    done();
  });

  it('rejects values that won\'t coerce to boolean', function(done) {
    var value = 'invalid';
    var result = normalize.boolean(value);
    expect(result).toEqual(null);
    done();
  });
});

describe('normalize.function', function() {

  it('accepts value if typeof function', function(done) {
    var value = function() {};
    var result = normalize.function(value);
    expect(result).toEqual(value);
    done();
  });

  it('never calls the function', function(done) {
    var value = expect.createSpy();
    var result = normalize.function(value);
    expect(result).toEqual(value);
    expect(value).toNotHaveBeenCalled();
    done();
  });

  it('rejects values that won\'t coerce to function', function(done) {
    var value = 'invalid';
    var result = normalize.function(value);
    expect(result).toEqual(null);
    done();
  });
});

describe('normalize.undefined', function() {

  it('compares value to typeof undefined', function(done) {
    var value = undefined;
    var result = normalize.undefined(value);
    expect(result).toEqual(value);
    done();
  });

  it('rejects values that won\'t coerce to undefined', function(done) {
    var value = 'invalid';
    var result = normalize.undefined(value);
    expect(result).toEqual(null);
    done();
  });
});

describe('normalize.date', function() {

  it('coerces a number to a Date object', function(done) {
    var value = 1;
    var expected = new Date(value);
    var result = normalize.date(value);
    expect(result).toEqual(expected);
    done();
  });

  it('rejects numbers with not-a-number values', function(done) {
    var value = Number.NaN;
    var result = normalize.date(value);
    expect(result).toEqual(null);
    done();
  });

  it('rejects numbers with infinite values', function(done) {
    var value = Number.POSITIVE_INFINITY;
    var result = normalize.date(value);
    expect(result).toEqual(null);
    done();
  });

  it('accepts objects that are Numbers', function(done) {
    var value = new Number(1);
    var expected = new Date(value);
    var result = normalize.date(value);
    expect(result).toEqual(expected);
    done();
  });

  it('rejects Numbers with not-a-number values', function(done) {
    var value = new Number(Number.NaN);
    var result = normalize.date(value);
    expect(result).toEqual(null);
    done();
  });

  it('rejects Numbers with infinite values', function(done) {
    var value = new Number(Number.POSITIVE_INFINITY);
    var result = normalize.date(value);
    expect(result).toEqual(null);
    done();
  });

  it('accepts objects that are valid Dates', function(done) {
    var value = new Date();
    var result = normalize.date(value);
    expect(result).toEqual(value);
    done();
  });

  it('rejects Dates that are invalid', function(done) {
    var value = new Date(undefined);
    var result = normalize.date(value);
    expect(result).toEqual(null);
    done();
  });

  it('rejects object that are not dates', function(done) {
    var value = 'invalid';
    var result = normalize.date(value);
    expect(result).toEqual(null);
    done();
  });
});
