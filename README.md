## mini-args

Parse nodejs command line args
-No additional packages
-Single file package


### Syntax
```
$ executable --option value -alias value ...
```

## Usage
```
require('./index.js')(definedOptions, arguments);
```

### Option Keys
**name** [Mandatory] <br />
Defines the name of a option

**alias** [Mandatory] <br />
Defines the alias of a option

**type** [Mandatory] <br />
Defines the type of value. A option can have multiple type combination.

```
{
  name: "fetchData",
  type: "boolean|number|string"
  ...
}
```
*Note: <br />
array and object cannot be part of multiple type combination

Invalid combinations <br />
type: "boolean|number|array"
type: "string|object"
type: "array|object"*

**mandatory** [Optional, by default false] <br />
If specified true, option does not described in args or no value found then mini-args will throw an error
```
{
  name: "clear",
  type: "string",
  mandatory: true
}
```

**default** [Optional] <br />
Holds default value for a option.
If the option or value does not found in args then option will be parsed by default value if declared.

Only works with of type "boolean" or "number" or "string" or combination of kind.

```
{
  name: "clear",
  type: "string",
  default: "Y"
}
```

**allowed** [Optional] <br />
Holds array of allowed values of specified type/s
Only works with of type "boolean" or "number" or "string" or combination of kind.

```
{
  name: "clear",
  type: "string|number",
  default: "Y",
  allowed: ["Y", "N", 1, 0]
}
```

**caseSensitive** [Optional, by default false] <br />
If specified true then, "allowed" comparison on case-sensitive mode.
Only works with "string"

ex:
```
{
  name: "clear",
  type: "string|number",
  default: "Y",
  allowed: ["Y", "N", 1, 0],
  caseSensitive: true
}
```
if value is "n" then it'll be considered as invalid and throws error.


**definedOptions** <br />
Definition of the options. Must be Array of objects
ex:
```
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
},{
  name: 'save',
  type: 'single'
}]
```

**arguments** <br />
Can be process.argv.slice(2). If not passed then by default it'll be process.argv.slice(2).
Must be Array[]


## Constraints
**Without definedOptions** <br />
If definedOptions not passed or invalid then all valid pair of option and value will be parsed, if a option found but value is undefined then it's considered to be single type option by default mini-args will parse it with the value true, rest will be ignored.

ex:
```
$ node example.js -f index.js -hh true --fetchData 1 fetch reserve --save --clear
```

Output
```
$ { f: 'index.js',
  hh: true,
  fetchData: 1,
  save: true,
  clear: true }

```
Hence "fetch" and "reserve" are ignored.
"--save" and ""--clear" are considered to be single type options.


**With definedOptions** <br />
Only defined options will be parsed, even a valid pair of option and value passed by command line will be ignored.

ex:
definedOptions will be
```
[{
  name: "file",
  alias: "f",
  mandatory: true,
  type: "string"
}, {
  name: "hasHeaders",
  alias: "hh",
  default: true,
  type: "boolean"
}, {
  name: "headers",
  alias: "h",
  type: "array"
}, {
  name: "port",
  alias: 'p',
  default: 3000,
  allowed: [8000, 4000, 5000, 9000],
  type: "number"
}, {
  name: "save",
  type: "single"
  }]
```
Command
```
$ node example.js -f index.js -hh true --fetchData 1 fetch reserve --save --clear
```

Output
```
$ { file: 'index.js',
  hasHeaders: true,
  save: true }
```

## TODO
- Support JSON5 features but without the package.
- Validation for definedOptions
- Proper documentation
- Support array and object for multiple type combinations
- min. version
