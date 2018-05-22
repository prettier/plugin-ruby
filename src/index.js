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
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};
