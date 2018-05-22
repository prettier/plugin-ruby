const { parse, locStart, locEnd } = require("./parse");
const print = require("./print");

module.exports = {
  languages: [{
    name: "Ruby",
    parsers: ["ruby"]
  }],
  parsers: {
    ruby: {
      parse,
      astFormat: "ruby",
      locStart,
      locEnd
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
