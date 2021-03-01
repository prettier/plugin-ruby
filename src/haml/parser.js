const parseSync = require("../parser/parseSync");

const parse = (text, _parsers, opts) => {
  return parseSync("haml", text, opts);
};

const pragmaPattern = /^\s*-#\s*@(prettier|format)/;
const hasPragma = (text) => pragmaPattern.test(text);

// These functions are just placeholders until we can actually perform this
// properly. The functions are necessary otherwise the format with cursor
// functions break.
const locStart = (_node) => 0;
const locEnd = (_node) => 0;

module.exports = {
  parse,
  astFormat: "haml",
  hasPragma,
  locStart,
  locEnd
};
