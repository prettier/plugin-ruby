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

function printBegin(path, opts, print) {
  return concat([
    "begin",
    indent(concat([hardline, concat(path.map(print, "body"))])),
    hardline,
    "end"
  ]);
}

function printEnsure(path, opts, print) {
  return concat([
    path.call(print, "body", 0),
    indent(concat([hardline, path.call(print, "body", 1)]))
  ]);
}

function printRescue(path, opts, print) {
  const parts = ["rescue"];

  if (path.getValue().body[0]) {
    parts.push(align("rescue ".length, path.call(print, "body", 0)));
  } else {
    // If you don't specify an error to rescue in a `begin/rescue` block, then
    // implicitly you're rescuing from `StandardError`. In this case, we're
    // just going to explicitly add it.
    parts.push(" StandardError");
  }

  const bodystmt = path.call(print, "body", 1);

  if (bodystmt.parts.length > 0) {
    parts.push(indent(concat([hardline, bodystmt])));
  }

  // This is the next clause on the `begin` statement, either another
  // `rescue`, and `ensure`, or an `else` clause.
  if (path.getValue().body[2]) {
    parts.push(concat([hardline, path.call(print, "body", 2)]));
  }

  return group(concat(parts));
}

// This is a container node that we're adding into the AST that isn't present in
// Ripper solely so that we have a nice place to attach inline comments.
function printRescueEx(path, opts, print) {
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
}

function printRescueMod(path, opts, print) {
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
}

module.exports = {
  begin: printBegin,
  ensure: printEnsure,
  redo: literal("redo"),
  rescue: printRescue,
  rescue_ex: printRescueEx,
  rescue_mod: printRescueMod,
  retry: literal("retry")
};
