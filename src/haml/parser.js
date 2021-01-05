const { spawnSync } = require("child_process");
const path = require("path");

const parser = path.join(__dirname, "./parser.rb");

const parse = (text, _parsers, _opts) => {
  const child = spawnSync("ruby", [parser], { input: text });

  const error = child.stderr.toString();
  if (error) {
    throw new Error(error);
  }

  const response = child.stdout.toString();
  return JSON.parse(response);
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
