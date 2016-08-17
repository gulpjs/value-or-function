'use strict';

// Built-in types
var types = [
  'object',
  'number',
  'string',
  'symbol',
  'boolean',
  'date',
  'function', // Weird to expose this
  'undefined', // And this?
];


function normalize(coercer, value) {
  if (typeof value === 'function') {
    if (coercer === 'function') {
      return value;
    }
    value = value.apply(null, Array.prototype.slice.call(arguments, 2));
  }
  return coerce(coercer, value);
}


function coerce(coercer, value) {

  // Handle built-in types
  if (typeof coercer === 'string') {
    if (coerce[coercer]) {
      return coerce[coercer](value);
    }
    return typeOf(coercer, value);
  }

  // Handle custom coercer
  if (typeof coercer === 'function') {
    return coercer(value);
  }

  // Array of coercers, try in order until one returns a non-null value
  var result = null;
  coercer.some(function(coercer) {
    result = coerce(coercer, value);
    return result !== null;
  });

  return result;
}


coerce.string = function(value) {
  if (value != null &&
    typeof value === 'object' &&
    typeof value.toString === 'function') {

    value = value.toString();
  }
  return typeOf('string', primitive(value));
};


coerce.number = function(value) {
  return typeOf('number', primitive(value));
};


coerce.boolean = function(value) {
  return typeOf('boolean', primitive(value));
};


coerce.date = function(value) {
  value = primitive(value);
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return new Date(value);
  }
  return null;
};


function typeOf(type, value) {
  if (typeof value === type) {
    return value;
  }
  return null;
}


function primitive(value) {
  if (value != null &&
    typeof value === 'object' &&
    typeof value.valueOf === 'function') {

    value = value.valueOf();
  }
  return value;
}


// Add methods for each type
types.forEach(function(type) {
  normalize[type] = normalize.bind(null, type);
});


module.exports = normalize;
