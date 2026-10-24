"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var normalize = require("../");

describe("normalize", function () {
  it("compares a type and the type of a value", function () {
    var type = "string";
    var value = "test string";
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("returns undefined if value does not match type", function () {
    var type = "string";
    var value = 1;
    var result = normalize(type, value);
    assert.strictEqual(result, undefined);
  });

  it("supports arrays for the type parameter", function () {
    var type = ["string"];
    var value = "test string";
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("runs coercers in array order", function () {
    var type = ["string", "object"];
    var value = {};
    var result = normalize(type, value);
    assert.strictEqual(result, "[object Object]");
  });

  it("compares each type and the type of the value (string)", function () {
    var type = ["number", "string", "object"];
    var value = "test string";
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("compares each type and the type of the value (function)", function () {
    var type = ["function", "string"];
    var value = function () {};
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("handles function properly if the first condition is not satisfied", function () {
    var type = ["string", "function"];
    var value = function () {};
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("compares each type and the type of the value (number)", function () {
    var type = ["string", "number"];
    var value = 123;
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("compares each type and the type of the value (boolean)", function () {
    var type = ["string", "boolean"];
    var value = true;
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("compares each type and the type of the value (object)", function () {
    var type = ["object", "string"];
    var value = { a: 1 };
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("calls `toString` on object if string coercer is first", function () {
    var type = ["string", "object"];
    var value = { a: 1 };
    var result = normalize(type, value);
    assert.strictEqual(result, "[object Object]");
  });

  it("does not fallback to `toString` if created with `Object.create(null)`", function () {
    var type = ["string", "object"];
    var value = Object.create(null);
    value.a = 1;
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("compares each type and the type of the value (timestamp)", function () {
    var type = ["date", "string"];
    var value = Date.now();
    var result = normalize(type, value);
    assert.deepStrictEqual(result, new Date(value));
  });

  it("calls `toString` on date if string coercer is first", function () {
    var type = ["string", "object"];
    var value = new Date();
    var result = normalize(type, value);
    assert.strictEqual(result, value.toString());
  });

  it("returns date if object coercer is first", function () {
    var type = ["object", "string"];
    var value = new Date();
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("handles `null` via the object coercer", function () {
    var type = ["string", "object", "number"];
    var value = null;
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("compares each type and the type of the value (undefined)", function () {
    var type = ["string", "undefined"];
    var value = undefined;
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("compares each type and the type of the value (symbol)", function () {
    var type = ["string", "symbol"];
    var value = Symbol("foo");
    var result = normalize(type, value);
    assert.strictEqual(result, value);
  });

  it("returns undefined if value does not match any type", function () {
    var type = ["string", "undefined"];
    var value = 1;
    var result = normalize(type, value);
    assert.strictEqual(result, undefined);
  });

  it("supports coercer functions for the type parameter", function () {
    var type = function () {
      return true;
    };
    var value = 1;
    var result = normalize(type, value);
    assert.strictEqual(result, true);
  });

  it("throws if a coercer is not a string or function", function () {
    var type = 123;
    var value = 1;
    assert.throws(() => normalize(type, value), {
      message: "Invalid coercer. Can only be a string or function.",
    });
  });

  it("calls the coercer function to attempt coercion", function (t) {
    var expected = 1;
    var type = t.mock.fn(function (value) {
      return value;
    });
    var result = normalize(type, expected);
    assert.strictEqual(result, expected);
    assert.strictEqual(type.mock.callCount(), 1);
  });

  it("calls the coercer functions with context, if bound", function (t) {
    var expected = 1;
    var context = {};
    var type = t.mock.fn(function (value) {
      assert.strictEqual(this, context);
      return value;
    });
    var result = normalize.call(context, type, expected);
    assert.strictEqual(result, expected);
    assert.strictEqual(type.mock.callCount(), 1);
  });

  it("calls the value if it is a function", function (t) {
    var type = "string";
    var expected = "test string";
    var value = t.mock.fn(function () {
      return expected;
    });
    var result = normalize(type, value);
    assert.strictEqual(result, expected);
    assert.strictEqual(value.mock.callCount(), 1);
  });

  it("calls the value function with context, if bound", function (t) {
    var type = "string";
    var context = {};
    var value = t.mock.fn(function () {
      assert.strictEqual(this, context);
    });
    normalize.call(context, type, value);
    assert.strictEqual(value.mock.callCount(), 1);
  });

  it("checks the result of function against coercer", function (t) {
    var expected = "test string";
    var coercer = t.mock.fn(function (value) {
      return typeof value === "string" ? value : undefined;
    });
    var value = t.mock.fn(function () {
      return expected;
    });
    var result = normalize(coercer, value);
    assert.strictEqual(result, expected);
    assert.strictEqual(coercer.mock.callCount(), 1);
    assert.strictEqual(value.mock.callCount(), 1);
  });

  it("calls the function, passing extra arguments", function (t) {
    var type = "string";
    var expected = "test string";
    var value = t.mock.fn(function (arg) {
      return arg;
    });
    var result = normalize(type, value, expected);
    assert.strictEqual(result, expected);
    assert.strictEqual(value.mock.callCount(), 1);
  });

  it("returns null if result of function does not match type", function (t) {
    var type = "string";
    var value = t.mock.fn(function () {
      return 123;
    });
    var result = normalize(type, value);
    assert.strictEqual(result, undefined);
    assert.strictEqual(value.mock.callCount(), 1);
  });

  it("rejects if function return val doesn't satisfy custom coercer", function (t) {
    var coercer = t.mock.fn(function (value) {
      return typeof value === "string" ? value : undefined;
    });
    var value = t.mock.fn(function () {
      return 123;
    });
    var result = normalize(coercer, value);
    assert.strictEqual(result, undefined);
    assert.ok(coercer.mock.callCount(), 1);
    assert.strictEqual(value.mock.callCount(), 1);
  });
});

describe("normalize.object", function () {
  it("compares value to typeof object", function () {
    var obj = {};
    var arr = [];
    var numObj = new Number(1);
    var strObj = new String("test");
    var objResult = normalize.object(obj);
    var arrResult = normalize.object(arr);
    var numObjResult = normalize.object(numObj);
    var strObjResult = normalize.object(strObj);
    assert.strictEqual(objResult, obj);
    assert.strictEqual(arrResult, arr);
    assert.strictEqual(numObjResult, numObj);
    assert.strictEqual(strObjResult, strObj);
  });

  it("accpets value if it is null", function () {
    var value = null;
    var result = normalize.object(value);
    assert.strictEqual(result, null);
  });

  it("rejects values if not Object", function () {
    var value = "invalid";
    var result = normalize.object(value);
    assert.strictEqual(result, undefined);
  });

  it("calls the object function with context, if bound", function (t) {
    var context = {};
    var value = t.mock.fn(function () {
      assert.strictEqual(this, context);
    });
    normalize.object.call(context, value);
    assert.strictEqual(value.mock.callCount(), 1);
  });

  describe("normalize.number", function () {
    it("accepts value if typeof number", function () {
      var value = 1;
      var result = normalize.number(value);
      assert.strictEqual(result, value);
    });

    it("accepts value if it is not-a-number", function () {
      var value = Number.NaN;
      var result = normalize.number(value);
      assert.strictEqual(Number.isNaN(result), true);
    });

    it("accepts value if it is infinite", function () {
      var value = Number.NEGATIVE_INFINITY;
      var result = normalize.number(value);
      assert.strictEqual(result, value);
    });

    it("accepts value if instanceof Number", function () {
      var expected = 1;
      var value = new Number(expected);
      var result = normalize.number(value);
      assert.strictEqual(result, expected);
    });

    it("rejects values that won't coerce to number", function () {
      var value = "invalid";
      var result = normalize.number(value);
      assert.strictEqual(result, undefined);
    });

    it("calls the number function with context, if bound", function (t) {
      var context = {};
      var value = t.mock.fn(function () {
        assert.strictEqual(this, context);
      });
      normalize.number.call(context, value);
      assert.strictEqual(value.mock.callCount(), 1);
    });
  });

  describe("normalize.string", function () {
    it("accepts value if typeof string", function () {
      var value = "test string";
      var result = normalize.string(value);
      assert.strictEqual(result, value);
    });

    it("accepts value if instanceof String", function () {
      var expected = "test string";
      var value = new String(expected);
      var result = normalize.string(value);
      assert.strictEqual(result, expected);
    });

    it("accepts value if it is an Object", function () {
      var expected = "test string";
      var value = {
        toString: function () {
          return expected;
        },
      };
      var result = normalize.string(value);
      assert.strictEqual(result, expected);
    });

    it("rejects Object if its toString doesn't return string", function () {
      var value = {
        toString: function () {
          return {};
        },
      };
      var result = normalize.string(value);
      assert.strictEqual(result, undefined);
    });

    it("rejects values that won't coerce to string", function () {
      var value = undefined;
      var result = normalize.string(value);
      assert.strictEqual(result, undefined);
    });

    it("calls the string function with context, if bound", function (t) {
      var context = {};
      var value = t.mock.fn(function () {
        assert.strictEqual(this, context);
      });
      normalize.string.call(context, value);
      assert.strictEqual(value.mock.callCount(), 1);
    });
  });

  describe("normalize.symbol", function () {
    it("compares value to typeof symbol", function () {
      var value = Symbol();
      var result = normalize.symbol(value);
      assert.strictEqual(result, value);
    });

    it("rejects values that are not Symbol", function () {
      var value = "invalid";
      var result = normalize.symbol(value);
      assert.strictEqual(result, undefined);
    });

    it("calls the symbol function with context, if bound", function (t) {
      var context = {};
      var value = t.mock.fn(function () {
        assert.strictEqual(this, context);
      });
      normalize.symbol.call(context, value);
      assert.strictEqual(value.mock.callCount(), 1);
    });
  });

  describe("normalize.boolean", function () {
    it("accepts value if typeof boolean", function () {
      var value = true;
      var result = normalize.boolean(value);
      assert.strictEqual(result, value);
    });

    it("accepts value if instanceof Boolean", function () {
      var expected = true;
      var value = new Boolean(expected);
      var result = normalize.boolean(value);
      assert.strictEqual(result, expected);
    });

    it("rejects values that won't coerce to boolean", function () {
      var value = "invalid";
      var result = normalize.boolean(value);
      assert.strictEqual(result, undefined);
    });

    it("calls the boolean function with context, if bound", function (t) {
      var context = {};
      var value = t.mock.fn(function () {
        assert.strictEqual(this, context);
      });
      normalize.boolean.call(context, value);
      assert.strictEqual(value.mock.callCount(), 1);
    });
  });

  describe("normalize.function", function () {
    it("accepts value if typeof function", function () {
      var value = function () {};
      var result = normalize.function(value);
      assert.strictEqual(result, value);
    });

    it("never calls the function", function (t) {
      var value = t.mock.fn(() => {});
      var result = normalize.function(value);
      assert.strictEqual(result, value);
      assert.strictEqual(value.mock.callCount(), 0);
    });

    it("rejects values that won't coerce to function", function () {
      var value = "invalid";
      var result = normalize.function(value);
      assert.strictEqual(result, undefined);
    });
  });

  describe("normalize.date", function () {
    it("coerces a number to a Date object", function () {
      var value = 1;
      var expected = new Date(value);
      var result = normalize.date(value);
      assert.deepStrictEqual(result, expected);
    });

    it("rejects numbers with not-a-number values", function () {
      var value = Number.NaN;
      var result = normalize.date(value);
      assert.strictEqual(result, undefined);
    });

    it("rejects numbers with infinite values", function () {
      var value = Number.POSITIVE_INFINITY;
      var result = normalize.date(value);
      assert.strictEqual(result, undefined);
    });

    it("accepts objects that are Numbers", function () {
      var value = new Number(1);
      var expected = new Date(value);
      var result = normalize.date(value);
      assert.deepStrictEqual(result, expected);
    });

    it("rejects Numbers with not-a-number values", function () {
      var value = new Number(Number.NaN);
      var result = normalize.date(value);
      assert.strictEqual(result, undefined);
    });

    it("rejects Numbers with infinite values", function () {
      var value = new Number(Number.POSITIVE_INFINITY);
      var result = normalize.date(value);
      assert.strictEqual(result, undefined);
    });

    it("accepts objects that are valid Dates", function () {
      var value = new Date();
      var result = normalize.date(value);
      assert.deepStrictEqual(result, value);
    });

    it("rejects Dates that are invalid", function () {
      var value = new Date(undefined);
      var result = normalize.date(value);
      assert.strictEqual(result, undefined);
    });

    it("rejects object that are not dates", function () {
      var value = "invalid";
      var result = normalize.date(value);
      assert.strictEqual(result, undefined);
    });

    it("calls the date function with context, if bound", function (t) {
      var context = {};
      var value = t.mock.fn(function () {
        assert.strictEqual(this, context);
      });
      normalize.date.call(context, value);
      assert.strictEqual(value.mock.callCount(), 1);
    });
  });
});
