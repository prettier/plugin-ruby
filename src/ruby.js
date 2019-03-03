const parse = require("./parse");
const print = require("./print");

module.exports = {
  languages: [{
    name: "Ruby",
    parsers: ["ruby"],
    extensions: [".rb", ".rake", ".gemspec"],
    linguistLanguageId: 303,
    vscodeLanguageIds: ["ruby"]
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
    addTrailingCommas: {
      type: "boolean",
      category: "Global",
      default: false,
      description: "Adds a trailing comma to array literals, hash literals, and method calls."
    },
    inlineConditionals: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When it fits on one line, allows if and unless statements to use the modifier form."
    },
    inlineLoops: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When it fits on one line, allows while and until statements to use the modifier form."
    },
    preferHashLabels: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When possible, uses the shortened hash key syntax, as opposed to hash rockets."
    },
    preferSingleQuotes: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "When double quotes are not necessary for interpolation, prefers the use of single quotes for string literals."
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};
