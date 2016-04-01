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

  return isType ? value : value.apply(null, args);
}

// Add methods for each type
types.forEach(function(type) {
  normalize[type] = normalize.bind(null, type);
});

module.exports = normalize;
