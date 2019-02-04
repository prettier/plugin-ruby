const parse = require("./parse");
const print = require("./print");

module.exports = {
  languages: [{
    name: "Ruby",
    parsers: ["ruby"]
  }],
  parsers: {
    ruby: {
      parse,
      astFormat: "ruby"
    }
  },
  printers: {
    ruby: {
      print
    }
  },
  options: {
    inlineConditionals: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When it fits on one line, allow if and unless statements to use the modifier form."
    },
    inlineLoops: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When it fits on one line, allow while and until statements to use the modifier form."
    },
    preferHashLabels: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When possible, use the shortened hash key syntax, as opposed to hash rockets."
    },
    preferSingleQuotes: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When double quotes are not necessary for interpolation, prefer the use of single quotes for string literals."
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};
