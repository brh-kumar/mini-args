var exports = module.exports = {};
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
  default: true,
  type: 'string|boolean|number'
}, {
  name: 'save',
  type: 'single'
}];

const args = process.argv.slice(2);
const invalid = 'invalid!';

console.log(args);

var getDefinedOptions = function () {
  // Holds current argument
  //
  var arg;

  var invalidOptions = false;
  var optionIndex;
  var option;
  var result = {};

  // To quickly get index of specific option by name
  // stores { optionsName: index }
  //        { alias: index }
  //
  var minifiedOptions = {};

  // Holds mandatory options names
  // used to show errors if mandatory options not found or invalid
  // will be spliced if mandatory option found valid
  //
  var mandatoryOptions = [];

  // To parse passed arguments by defined options type
  // val - options value (passed argument)
  // if invalid value found will return invalid. ref. const invalid;
  // TODO for minified version
  // most of the line can written in sigle line or simplified
  // eg. 'array' can be
  // return (val[0] === '[' && val[val.length - 1] === ']' && this.JSONParse(val)) || invalid;
  //
  var getValueByType = {
    'array': function (val) {
      if (val[0] !== '[' || val[val.length - 1] !== ']') {
        return invalid;
      }

      return this.JSONParse(val);
    },

    'boolean': function (val) {
      if (val !== 'true' && val !== 'false') {
        return invalid;
      }

      return (val === 'true' && true) || false;
    },

    'object': function (val) {
      if (val[0] !== '{' || val[val.length - 1] !== '}') {
        return invalid;
      }

      return this.JSONParse(val);
    },

    'number': function (val) {
      if (isNaN(val)) return invalid;

      val = parseFloat(val);
      if (option.allowed && option.allowed.length && option.allowed.indexOf(val) === -1) {
        return invalid;
      }

      return val;
    },

    'single': function () {
      return true;
    },

    'string': function (val) {
      let allowed = (option.allowed && option.allowed.length && option.allowed) || false;
      let caseSensitive = option.caseSensitive || false;

      val = val.toString();
      if (allowed && allowed.indexOf((caseSensitive && val) || val.toLowerCase()) === -1) {
        return invalid;
      }

      return val;
    },

    'boolean|number': function (val) {
      let res = this.boolean(val);
      return (res !== invalid && res) || this.number(val);
    },

    'boolean|string': function (val) {
      let res = this.boolean(val);
      return (res !== invalid && res) || this.string(val);
    },

    'number|string': function (val) {
      let res = this.number(val);
      return (res !== invalid && res) || this.string(val);
    },

    'boolean|number|string': function (val) {
      let res = this.boolean(val);
      return (res !== invalid && res) || ((res = this.number()) !== invalid && res) || this.string(val);
    },

    'JSONParse': function (val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return invalid;
      }
    }
  };

  // Loop defined options to filter
  // -mandatory options
  // -minified options
  //
  for (let i = 0, n = definedOptions.length; i < n; i++) {
    if (definedOptions[i].mandatory) mandatoryOptions.push(definedOptions[i].name);

    minifiedOptions['--' + definedOptions[i].name] = i;
    if (definedOptions[i].alias) minifiedOptions['-' + definedOptions[i].alias] = i;
  }

  // Loop args
  //
  for (let i = 0, n = args.length; i < n; i++) {
    arg = args[i];
    optionIndex = minifiedOptions[arg];

    // For now, if argument not found in definedOptions then skip it
    // can be modified to throw an error if neccessary
    //
    if (optionIndex === undefined) continue;

    option = definedOptions[optionIndex];
    option['value'] = args[i + 1] || '';

    if (/^(--|-)/.test(option.value) && option.type !== 'single') {
      console.log(`Error: No value found for "${arg}"`);
      invalidOptions = true;
    } else {
      option['value'] = getValueByType[option.type](option.value);
    }

    // Note*
    // do not decide here that it's invalid if args[i + 1] is empty|undefined
    // if do then skip type "single"
    // type "single" - if it's mentioned in command line then considered tobe true (eg. --save --delete)
    //
    if (option.value === invalid) {
      console.log(`Error: ${args[i + 1]} found!, expected "${option.type}" for "${arg}"`);
      invalidOptions = true;
    }

    if (!invalidOptions && option.mandatory) {
      mandatoryOptions.splice(optionIndex, 1);
    }

    result[option.name] = option.value;

    if (option.type !== 'single') i++;
  }

  if (invalidOptions) process.exit();

  console.log(result);
};

getOptions = function (args = process.argv.slice(2)) {
  let options = {};
  let arg;
  let value;
  let i;
  let n = args.length;

  function isOptionName (index = i) {
    let nextArg = args[index];
    return nextArg && (nextArg.indexOf('-') === 0 || nextArg.indexOf('--') === 0);
  }

  function getOptionValue () {
    let value = (args[i + 1] && args[i + 1].trim());

    if (!value || isOptionName(i + 1)) return true;

    if (value[0] === '[' || value[0] === '{' || value === 'true' || value === 'false' || /^[0-9]+$/.test(value)) {
      return JSON.parse(value);
    }

    if (value === 'null' || value === 'undefined' || value === 'NaN') {
      return '';
    }

    return value;
  }

  for (i = 0; i < n; i++) {
    arg = args[i].replace(/--|-/, '');
    if (isOptionName()) {
      options[arg] = getOptionValue();
      i++;
    }
  }

  return options;
};
// console.log(getOptions());
getDefinedOptions();
