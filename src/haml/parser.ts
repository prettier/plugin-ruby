import type { Parser } from "prettier";
import type { HAML } from "./types";
import parseSync from "../parser/parseSync";

const parser: Parser<HAML.AnyNode> = {
  // This function is responsible for taking an input string of text and returning
  // to prettier a JavaScript object that is the equivalent AST that represents
  // the code stored in that string. We accomplish this by spawning a new process
  // and reading JSON off STDOUT.
  parse(text, _parsers, opts) {
    return parseSync("haml", text, opts);
  },
  astFormat: "haml",
  // This function handles checking whether or not the source string has the
  // pragma for prettier. This is an optional workflow for incremental adoption.
  hasPragma(text) {
    return /^\s*-#\s*@(prettier|format)/.test(text);
  },
  // These functions are just placeholders until we can actually perform this
  // properly. The functions are necessary otherwise the format with cursor
  // functions break.
  locStart(_node) {
    return 0;
  },
  locEnd(_node) {
    return 0;
  }
};

module.exports = parser;
