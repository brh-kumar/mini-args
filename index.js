const invalid = 'invalid!';
const notAllowed = 'notAllowed!';

var args;
var definedOptions;

var isEmpty = function (obj) {
  if (obj == null) return true;
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;
  if (typeof obj !== 'object') return true;
  for (let key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }
  return true;
};

var getArgvByDefinedOptions = function () {
  var invalidOptions = false;
  var option;
  var temp = {};
  var result = {};

  // To quickly get specific argument object by name
  // mapped as { argument: value }
  //
  var minifiedArgs = {};

  // To parse passed arguments by defined options type
  // val - options value (passed argument)
  // if valid then returns parsed value
  // else returns invalid. ref. const invalid;
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
        return notAllowed;
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
        return notAllowed;
      }

      return val;
    },

    'boolean|number': function (val) {
      let res = this.boolean(val);
      return (res !== invalid) ? res : this.number(val);
    },

    'boolean|string': function (val) {
      let res = this.boolean(val);
      return (res !== invalid) ? res : this.string(val);
    },

    'number|string': function (val) {
      let res = this.number(val);
      return (res !== invalid) ? res : this.string(val);
    },

    'boolean|number|string': function (val) {
      let res = this.boolean(val);
      if (res !== invalid) return res;

      res = this.number();
      return (res !== invalid) ? res : this.string(val);
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
  for (let i = 0, n = args.length; i < n; i++) {
    if (/^(--|-)/.test(args[i])) minifiedArgs[args[i]] = (!/^(--|-)/.test(args[i + 1])) && args[i + 1] || '';
    if (!/^(--|-)/.test(args[i + 1])) i++;
  }

  // Loop defined options
  //
  for (let i = 0, n = definedOptions.length; i < n; i++) {
    option = definedOptions[i];
    temp['name'] = '--' + option.name;
    temp['alias'] = '-' + option.alias;
    option['type'] = option.type.toLowerCase().split('|').sort().join('|');
    option['value'] = (minifiedArgs.hasOwnProperty(temp.name) &&  minifiedArgs[temp.name]) || (minifiedArgs.hasOwnProperty(temp.alias) && minifiedArgs[temp.alias]) || invalid;

    if (option.value === invalid && option.type !== 'single') {

      // If a option is mandatory and value is not passed then thorw an error and continue
      // 'single' typed option cannot be mandatory
      //
      if (option.mandatory) {
        console.log(`Error: No value found for "${option.name}"`);
        invalidOptions = true;
        continue;
      }

      // If option value is not found in args then check for default value
      //
      if (!option.hasOwnProperty('default')) continue;

      // default value cannot be of different type must match option's type
      //
      option['value'] = option.default;
    }

    option['parsedValue'] = getValueByType[option.type](option.value);

    if (option.parsedValue === invalid) {
      console.log(`Error: "${option.value}" found!, expected ${option.type} for "${temp.name}(${temp.alias})"`);
      invalidOptions = true;
    }

    if (option.parsedValue === notAllowed) {
      console.log(`Error: "${option.value}" not allowed in "${temp.name}(${temp.alias})"`);
      invalidOptions = true;
    }

    result[option.name] = option.parsedValue;
  }

  if (invalidOptions) process.exit();

  return result;
};

var getArgv = function () {
  var options = {};
  var arg;
  var value;
  var i;
  var n = args.length;

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

      // Checking whether next a[i+1] is a option or value
      // if value then skip it by i++
      // else let is continue
      //
      if (!isOptionName(i+1)) i++;
    }
  }

  return options;
};

module.exports = function (definedOpts, argv) {
  args = (!isEmpty(argv)) ? argv : process.argv.slice(2);
  definedOptions = (!isEmpty(definedOpts)) ? definedOpts : [];

  if (isEmpty(args)) {
    console.log('Error: No arguments found!');
    process.exit();
  }

  if (isEmpty(definedOptions)) {
    return getArgv();
  }

  return getArgvByDefinedOptions();
};
