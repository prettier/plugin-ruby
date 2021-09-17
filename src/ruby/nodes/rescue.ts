import type * as Prettier from "prettier";
import type { Plugin, Ruby } from "./types";

const {
  align,
  concat,
  group,
  hardline,
  indent,
  join,
  line
} = require("../../prettier");
const { literal } = require("../../utils");

const printBegin: Plugin.Printer<Ruby.Begin> = (path, opts, print) => {
  return concat([
    "begin",
    indent(concat([hardline, concat(path.map(print, "body"))])),
    hardline,
    "end"
  ]);
};

const printEnsure: Plugin.Printer<Ruby.Ensure> = (path, opts, print) => {
  return concat([
    path.call(print, "body", 0),
    indent(concat([hardline, path.call(print, "body", 1)]))
  ]);
};

const printRescue: Plugin.Printer<Ruby.Rescue> = (path, opts, print) => {
  const parts = ["rescue"];

  if (path.getValue().body[0]) {
    parts.push(align("rescue ".length, path.call(print, "body", 0)));
  } else {
    // If you don't specify an error to rescue in a `begin/rescue` block, then
    // implicitly you're rescuing from `StandardError`. In this case, we're
    // just going to explicitly add it.
    parts.push(" StandardError");
  }

  const bodystmt = path.call(print, "body", 1) as Prettier.doc.builders.Concat;

  if (bodystmt.parts.length > 0) {
    parts.push(indent(concat([hardline, bodystmt])));
  }

  // This is the next clause on the `begin` statement, either another
  // `rescue`, and `ensure`, or an `else` clause.
  if (path.getValue().body[2]) {
    parts.push(concat([hardline, path.call(print, "body", 2)]));
  }

  return group(concat(parts));
};

// This is a container node that we're adding into the AST that isn't present in
// Ripper solely so that we have a nice place to attach inline comments.
const printRescueEx: Plugin.Printer<Ruby.RescueEx> = (path, opts, print) => {
  const [exception, variable] = path.getValue().body;
  const parts = [];

  if (exception) {
    let exceptionDoc = path.call(print, "body", 0);

    if (Array.isArray(exceptionDoc)) {
      const joiner = concat([",", line]);
      exceptionDoc = group(join(joiner, exceptionDoc));
    }

    parts.push(" ", exceptionDoc);
  }

  if (variable) {
    parts.push(" => ", path.call(print, "body", 1));
  }

  return group(concat(parts));
};

const printRescueMod: Plugin.Printer<Ruby.RescueModifier> = (path, opts, print) => {
  const [statementDoc, valueDoc] = path.map(print, "body");

  return concat([
    "begin",
    indent(concat([hardline, statementDoc])),
    hardline,
    "rescue StandardError",
    indent(concat([hardline, valueDoc])),
    hardline,
    "end"
  ]);
};

module.exports = {
  begin: printBegin,
  ensure: printEnsure,
  redo: literal("redo"),
  rescue: printRescue,
  rescue_ex: printRescueEx,
  rescue_mod: printRescueMod,
  retry: literal("retry")
};
