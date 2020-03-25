const path = require("path");
const { setup, parse } = require("../build/Release/parser");

setup(path.resolve(__dirname, "parser.rb"));

module.exports = (text, _parsers, _opts) => parse(text);
