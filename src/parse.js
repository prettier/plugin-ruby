const { sexp } = require("ripperjs");

const parse = (text, parsers, options) => {
  return sexp(text);
};

module.exports = parse;
