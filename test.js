var definedOptions = [{
  name: 'file',
  alias: 'f',
  mandatory: true,
  type: 'string'
}, {
  name: 'hasHeaders',
  alias: 'hh',
  default: true,
  type: 'boolean'
}, {
  name: 'headers',
  alias: 'h',
  type: 'array'
}, {
  name: 'port',
  alias: 'p',
  default: 3000,
  allowed: [8000, 4000, 5000, 9000],
  type: 'number'
}, {
  name: 'user',
  alias: 'u',
  type: 'object'
}, {
  name: 'skipHeaders',
  alias: 'sh',
  caseSensitive: true,
  allowed: ['Y', 'N', 1, 0],
  default: 0,
  type: 'string|number'
}, {
  name: 'weeks',
  alias: 'w',
  type: 'number|boolean'
}, {
  name: 'save',
  type: 'single'
}];

var getOptions = require('./index.js')();
console.log(getOptions)
