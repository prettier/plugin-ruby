const parseSync = require("../parser/parseSync");

// This function is responsible for taking an input string of text and returning
// to prettier a JavaScript object that is the equivalent AST that represents
// the code stored in that string. We accomplish this by spawning a new Ruby
// process of parser.rb and reading JSON off STDOUT.
function parse(text, _parsers, opts) {
  return parseSync("ruby", text, opts);
}

// This function handles checking whether or not the source string has the
// pragma for prettier. This is an optional workflow for incremental adoption.
function hasPragma(text) {
  return /^\s*#[^\S\n]*@(format|prettier)\s*(\n|$)/.test(text);
}

// This function is critical for comments and cursor support, and is responsible
// for returning the index of the character within the source string that is the
// beginning of the given node.
function locStart(node) {
  return node.sc;
}

// This function is critical for comments and cursor support, and is responsible
// for returning the index of the character within the source string that is the
// ending of the given node.
function locEnd(node) {
  return node.ec;
}

module.exports = {
  parse,
  astFormat: "ruby",
  hasPragma,
  locStart,
  locEnd
};
