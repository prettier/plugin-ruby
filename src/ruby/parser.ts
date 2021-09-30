import type { Plugin, Ruby } from "../types";
import parseSync from "../parser/parseSync";

const parser: Plugin.Parser<Ruby.AnyNode> = {
  // This function is responsible for taking an input string of text and
  // returning to prettier a JavaScript object that is the equivalent AST that
  // represents the code stored in that string. We accomplish this by spawning a
  // new Ruby process of parser.rb and reading JSON off STDOUT.
  parse(text) {
    return parseSync("ruby", text);
  },
  astFormat: "ruby",
  // This function handles checking whether or not the source string has the
  // pragma for prettier. This is an optional workflow for incremental adoption.
  hasPragma(text) {
    return /^\s*#[^\S\n]*@(?:prettier|format)\s*?(?:\n|$)/m.test(text);
  },
  // This function is critical for comments and cursor support, and is
  // responsible for returning the index of the character within the source
  // string that is the beginning of the given node.
  locStart(node) {
    return node.sc;
  },
  // This function is critical for comments and cursor support, and is
  // responsible for returning the index of the character within the source
  // string that is the ending of the given node.
  locEnd(node) {
    return node.ec;
  }
};

export default parser;
