const embed = require("./haml/embed");
const parse = require("./haml/parse");
const print = require("./haml/print");

const pragmaPattern = /^\s*-#\s*@(prettier|format)/;
const hasPragma = (text) => pragmaPattern.test(text);

// These functions are just placeholders until we can actually perform this
// properly. The functions are necessary otherwise the format with cursor
// functions break.
const locStart = (_node) => 0;
const locEnd = (_node) => 0;

module.exports = {
  embed,
  hasPragma,
  locStart,
  locEnd,
  parse,
  print
};
