'use strict';

var types = [
  'object',
  'number',
  'string',
  'symbol',
  'boolean',
  'function', // Weird to expose this
  'undefined'
];

function normalize(type, value) {
  var args = Array.prototype.slice.call(arguments, 2);

  if (typeof value !== type && typeof value !== 'function') {
    return null;
  }

  return typeof value === type ? value : value.apply(null, args);
}

// Add methods for each type
types.forEach(function(type) {
  normalize[type] = normalize.bind(null, type);
});

module.exports = normalize;
