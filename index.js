'use strict';

var types = [
  'object',
  'number',
  'string',
  'symbol',
  'boolean',
  'function', // Weird to expose this
  'undefined',
];

function normalize(type, value) {
  var args = Array.prototype.slice.call(arguments, 2);

  var isType = typeof value === type;
  var isFunction = typeof value === 'function';

  if (!isType && !isFunction) {
    return null;
  }

  if (isType) {
    return value;
  }

  var result = value.apply(null, args);

  if (typeof result !== type) {
    return null;
  }

  return result;
}

// Add methods for each type
types.forEach(function(type) {
  normalize[type] = normalize.bind(null, type);
});

module.exports = normalize;
