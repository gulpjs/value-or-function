'use strict';

var expect = require('expect');
var sinon = require('sinon');

var normalize = require('../');

describe('normalize', function () {
  it('compares a type and the type of a value', function (done) {
    var type = 'string';
    var value = 'test string';
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('returns undefined if value does not match type', function (done) {
    var type = 'string';
    var value = 1;
    var result = normalize(type, value);
    expect(result).toBe(undefined);
    done();
  });

  it('supports arrays for the type parameter', function (done) {
    var type = ['string'];
    var value = 'test string';
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('runs coercers in array order', function (done) {
    var type = ['string', 'object'];
    var value = {};
    var result = normalize(type, value);
    expect(result).toBe('[object Object]');
    done();
  });

  it('compares each type and the type of the value (string)', function (done) {
    var type = ['number', 'string', 'object'];
    var value = 'test string';
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('compares each type and the type of the value (function)', function (done) {
    var type = ['function', 'string'];
    var value = function () { };
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('handles function properly if the first condition is not satisfied', function (done) {
    var type = ['string', 'function'];
    var value = function () { };
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('compares each type and the type of the value (number)', function (done) {
    var type = ['string', 'number'];
    var value = 123;
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('compares each type and the type of the value (boolean)', function (done) {
    var type = ['string', 'boolean'];
    var value = true;
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('compares each type and the type of the value (object)', function (done) {
    var type = ['object', 'string'];
    var value = { a: 1 };
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('calls `toString` on object if string coercer is first', function (done) {
    var type = ['string', 'object'];
    var value = { a: 1 };
    var result = normalize(type, value);
    expect(result).toBe('[object Object]');
    done();
  });

  it('does not fallback to `toString` if created with `Object.create(null)`', function (done) {
    var type = ['string', 'object'];
    var value = Object.create(null);
    value.a = 1;
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('compares each type and the type of the value (timestamp)', function (done) {
    var type = ['date', 'string'];
    var value = Date.now();
    var result = normalize(type, value);
    expect(result).toEqual(new Date(value));
    done();
  });

  it('calls `toString` on date if string coercer is first', function (done) {
    var type = ['string', 'object'];
    var value = new Date();
    var result = normalize(type, value);
    expect(result).toBe(value.toString());
    done();
  });

  it('returns date if object coercer is first', function (done) {
    var type = ['object', 'string'];
    var value = new Date();
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('handles `null` via the object coercer', function (done) {
    var type = ['string', 'object', 'number'];
    var value = null;
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('compares each type and the type of the value (undefined)', function (done) {
    var type = ['string', 'undefined'];
    var value = undefined;
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('compares each type and the type of the value (symbol)', function (done) {
    if (!global.Symbol) {
      console.log('Only available on platforms that support Symbol');
      this.skip();
      return;
    }
    var type = ['string', 'symbol'];
    var value = Symbol('foo');
    var result = normalize(type, value);
    expect(result).toBe(value);
    done();
  });

  it('returns undefined if value does not match any type', function (done) {
    var type = ['string', 'undefined'];
    var value = 1;
    var result = normalize(type, value);
    expect(result).toBe(undefined);
    done();
  });

  it('supports coercer functions for the type parameter', function (done) {
    var type = function () {
      return true;
    };
    var value = 1;
    var result = normalize(type, value);
    expect(result).toBe(true);
    done();
  });

  it('throws if a coercer is not a string or function', function (done) {
    var type = 123;
    var value = 1;
    expect(function () {
      normalize(type, value);
    }).toThrow('Invalid coercer. Can only be a string or function.');
    done();
  });

  it('calls the coercer function to attempt coercion', function (done) {
    var expected = 1;
    var type = sinon.fake(function (value) {
      return value;
    });
    var result = normalize(type, expected);
    expect(result).toBe(expected);
    expect(type.calledOnce).toBeTruthy();
    done();
  });

  it('calls the coercer functions with context, if bound', function (done) {
    var expected = 1;
    var context = {};
    var type = sinon.fake(function (value) {
      expect(this).toBe(context);
      return value;
    });
    var result = normalize.call(context, type, expected);
    expect(result).toEqual(expected);
    expect(type.calledOnce).toBeTruthy();
    done();
  });

  it('calls the value if it is a function', function (done) {
    var type = 'string';
    var expected = 'test string';
    var value = sinon.fake(function () {
      return expected;
    });
    var result = normalize(type, value);
    expect(result).toBe(expected);
    expect(value.calledOnce).toBeTruthy();
    done();
  });

  it('calls the value function with context, if bound', function (done) {
    var type = 'string';
    var context = {};
    var value = sinon.fake(function () {
      expect(this).toBe(context);
    });
    normalize.call(context, type, value);
    expect(value.calledOnce).toBeTruthy();
    done();
  });

  it('checks the result of function against coercer', function (done) {
    var expected = 'test string';
    var coercer = sinon.fake(function (value) {
      return typeof value === 'string' ? value : undefined;
    });
    var value = sinon.fake(function () {
      return expected;
    });
    var result = normalize(coercer, value);
    expect(result).toBe(expected);
    expect(coercer.calledOnce).toBeTruthy();
    expect(value.calledOnce).toBeTruthy();
    done();
  });

  it('calls the function, passing extra arguments', function (done) {
    var type = 'string';
    var expected = 'test string';
    var value = sinon.fake(function (arg) {
      return arg;
    });
    var result = normalize(type, value, expected);
    expect(result).toBe(expected);
    expect(value.calledOnce).toBeTruthy();
    done();
  });

  it('returns null if result of function does not match type', function (done) {
    var type = 'string';
    var value = sinon.fake(function () {
      return 123;
    });
    var result = normalize(type, value);
    expect(result).toBe(undefined);
    expect(value.calledOnce).toBeTruthy();
    done();
  });

  it("rejects if function return val doesn't satisfy custom coercer", function (done) {
    var coercer = sinon.fake(function (value) {
      return typeof value === 'string' ? value : undefined;
    });
    var value = sinon.fake(function () {
      return 123;
    });
    var result = normalize(coercer, value);
    expect(result).toBe(undefined);
    expect(coercer.calledOnce).toBeTruthy();
    expect(value.calledOnce).toBeTruthy();
    done();
  });
});

describe('normalize.object', function () {
  it('compares value to typeof object', function (done) {
    var obj = {};
    var arr = [];
    var numObj = new Number(1);
    var strObj = new String('test');
    var objResult = normalize.object(obj);
    var arrResult = normalize.object(arr);
    var numObjResult = normalize.object(numObj);
    var strObjResult = normalize.object(strObj);
    expect(objResult).toBe(obj);
    expect(arrResult).toBe(arr);
    expect(numObjResult).toBe(numObj);
    expect(strObjResult).toBe(strObj);
    done();
  });

  it('accpets value if it is null', function (done) {
    var value = null;
    var result = normalize.object(value);
    expect(result).toBe(null);
    done();
  });

  it('rejects values if not Object', function (done) {
    var value = 'invalid';
    var result = normalize.object(value);
    expect(result).toBe(undefined);
    done();
  });

  it('calls the object function with context, if bound', function (done) {
    var context = {};
    var value = sinon.fake(function () {
      expect(this).toBe(context);
    });
    normalize.object.call(context, value);
    expect(value.calledOnce).toBeTruthy();
    done();
  });
});

describe('normalize.number', function () {
  it('accepts value if typeof number', function (done) {
    var value = 1;
    var result = normalize.number(value);
    expect(result).toBe(value);
    done();
  });

  it('accepts value if it is not-a-number', function (done) {
    var value = Number.NaN;
    var result = normalize.number(value);
    expect(Number.isNaN(result)).toBe(true);
    done();
  });

  it('accepts value if it is infinite', function (done) {
    var value = Number.NEGATIVE_INFINITY;
    var result = normalize.number(value);
    expect(result).toBe(value);
    done();
  });

  it('accepts value if instanceof Number', function (done) {
    var expected = 1;
    var value = new Number(expected);
    var result = normalize.number(value);
    expect(result).toBe(expected);
    done();
  });

  it("rejects values that won't coerce to number", function (done) {
    var value = 'invalid';
    var result = normalize.number(value);
    expect(result).toBe(undefined);
    done();
  });

  it('calls the number function with context, if bound', function (done) {
    var context = {};
    var value = sinon.fake(function () {
      expect(this).toBe(context);
    });
    normalize.number.call(context, value);
    expect(value.calledOnce).toBeTruthy();
    done();
  });
});

describe('normalize.string', function () {
  it('accepts value if typeof string', function (done) {
    var value = 'test string';
    var result = normalize.string(value);
    expect(result).toBe(value);
    done();
  });

  it('accepts value if instanceof String', function (done) {
    var expected = 'test string';
    var value = new String(expected);
    var result = normalize.string(value);
    expect(result).toBe(expected);
    done();
  });

  it('accepts value if it is an Object', function (done) {
    var expected = 'test string';
    var value = {
      toString: function () {
        return expected;
      },
    };
    var result = normalize.string(value);
    expect(result).toBe(expected);
    done();
  });

  it("rejects Object if its toString doesn't return string", function (done) {
    var value = {
      toString: function () {
        return {};
      },
    };
    var result = normalize.string(value);
    expect(result).toBe(undefined);
    done();
  });

  it("rejects values that won't coerce to string", function (done) {
    var value = undefined;
    var result = normalize.string(value);
    expect(result).toBe(undefined);
    done();
  });

  it('calls the string function with context, if bound', function (done) {
    var context = {};
    var value = sinon.fake(function () {
      expect(this).toBe(context);
    });
    normalize.string.call(context, value);
    expect(value.calledOnce).toBeTruthy();
    done();
  });
});

describe('normalize.symbol', function () {
  it('compares value to typeof symbol', function (done) {
    var value = Symbol();
    var result = normalize.symbol(value);
    expect(result).toBe(value);
    done();
  });

  it('rejects values that are not Symbol', function (done) {
    var value = 'invalid';
    var result = normalize.symbol(value);
    expect(result).toBe(undefined);
    done();
  });

  it('calls the symbol function with context, if bound', function (done) {
    var context = {};
    var value = sinon.fake(function () {
      expect(this).toBe(context);
    });
    normalize.symbol.call(context, value);
    expect(value.calledOnce).toBeTruthy();
    done();
  });
});

describe('normalize.boolean', function () {
  it('accepts value if typeof boolean', function (done) {
    var value = true;
    var result = normalize.boolean(value);
    expect(result).toBe(value);
    done();
  });

  it('accepts value if instanceof Boolean', function (done) {
    var expected = true;
    var value = new Boolean(expected);
    var result = normalize.boolean(value);
    expect(result).toBe(expected);
    done();
  });

  it("rejects values that won't coerce to boolean", function (done) {
    var value = 'invalid';
    var result = normalize.boolean(value);
    expect(result).toBe(undefined);
    done();
  });

  it('calls the boolean function with context, if bound', function (done) {
    var context = {};
    var value = sinon.fake(function () {
      expect(this).toBe(context);
    });
    normalize.boolean.call(context, value);
    expect(value.calledOnce).toBeTruthy();
    done();
  });
});

describe('normalize.function', function () {
  it('accepts value if typeof function', function (done) {
    var value = function () { };
    var result = normalize.function(value);
    expect(result).toBe(value);
    done();
  });

  it('never calls the function', function (done) {
    var value = sinon.spy();
    var result = normalize.function(value);
    expect(result).toBe(value);
    expect(value.notCalled).toBeTruthy();
    done();
  });

  it("rejects values that won't coerce to function", function (done) {
    var value = 'invalid';
    var result = normalize.function(value);
    expect(result).toBe(undefined);
    done();
  });
});

describe('normalize.date', function () {
  it('coerces a number to a Date object', function (done) {
    var value = 1;
    var expected = new Date(value);
    var result = normalize.date(value);
    expect(result).toEqual(expected);
    done();
  });

  it('rejects numbers with not-a-number values', function (done) {
    var value = Number.NaN;
    var result = normalize.date(value);
    expect(result).toBe(undefined);
    done();
  });

  it('rejects numbers with infinite values', function (done) {
    var value = Number.POSITIVE_INFINITY;
    var result = normalize.date(value);
    expect(result).toBe(undefined);
    done();
  });

  it('accepts objects that are Numbers', function (done) {
    var value = new Number(1);
    var expected = new Date(value);
    var result = normalize.date(value);
    expect(result).toEqual(expected);
    done();
  });

  it('rejects Numbers with not-a-number values', function (done) {
    var value = new Number(Number.NaN);
    var result = normalize.date(value);
    expect(result).toBe(undefined);
    done();
  });

  it('rejects Numbers with infinite values', function (done) {
    var value = new Number(Number.POSITIVE_INFINITY);
    var result = normalize.date(value);
    expect(result).toBe(undefined);
    done();
  });

  it('accepts objects that are valid Dates', function (done) {
    var value = new Date();
    var result = normalize.date(value);
    expect(result).toEqual(value);
    done();
  });

  it('rejects Dates that are invalid', function (done) {
    var value = new Date(undefined);
    var result = normalize.date(value);
    expect(result).toBe(undefined);
    done();
  });

  it('rejects object that are not dates', function (done) {
    var value = 'invalid';
    var result = normalize.date(value);
    expect(result).toBe(undefined);
    done();
  });

  it('calls the date function with context, if bound', function (done) {
    var context = {};
    var value = sinon.fake(function () {
      expect(this).toBe(context);
    });
    normalize.date.call(context, value);
    expect(value.calledOnce).toBeTruthy();
    done();
  });
});
