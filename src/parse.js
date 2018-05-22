const { sexp } = require("ripperjs");

const parse = (text, parsers, options) => {
  return sexp(text);
};

const locStart = node => undefined;

const locEnd = node => undefined;

module.exports = {
  parse,
  locStart,
  locEnd
};
