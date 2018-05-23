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
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};
