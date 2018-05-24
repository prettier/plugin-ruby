const { sexp } = require("ripperjs");
const print = require("./print");

module.exports = {
  languages: [{
    name: "Ruby",
    parsers: ["ruby"]
  }],
  parsers: {
    ruby: {
      parse: (text, parsers, options) => sexp(text),
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
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};
