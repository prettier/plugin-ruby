const { concat, group, indent, line, softline } = require("./builders");
const { concatBody, empty, first } = require("./utils");

const nodes = {
  "@int": (path, _opts, _print) => {
    const { body } = path.getValue();

    // If the number is octal and does not contain the optional "o" character
    // after the leading 0, add it in.
    if (/^0[0-9]/.test(body)) {
      return `0o${body.slice(1)}`;
    }

    // If the number is a base 10 number, is sufficiently large, and is not
    // already formatted with underscores, then add them in in between the
    // numbers every three characters starting from the right.
    if (!body.startsWith("0") && body.length >= 4 && !body.includes("_")) {
      return `  ${body}`
        .slice((body.length + 2) % 3)
        .match(/.{3}/g)
        .join("_")
        .trim();
    }

    return body;
  },
  binary: (path, opts, print) => {
    const operator = path.getValue().body[1];
    const useNoSpace = operator === "**";

    return group(
      concat([
        concat([path.call(print, "body", 0), useNoSpace ? "" : " "]),
        operator,
        indent(
          concat([useNoSpace ? softline : line, path.call(print, "body", 2)])
        )
      ])
    );
  },
  defined: (path, opts, print) =>
    group(
      concat([
        "defined?(",
        indent(concat([softline, path.call(print, "body", 0)])),
        concat([softline, ")"])
      ])
    ),
  dot2: (path, opts, print) =>
    concat([
      path.call(print, "body", 0),
      "..",
      path.getValue().body[1] ? path.call(print, "body", 1) : ""
    ]),
  dot3: (path, opts, print) =>
    concat([
      path.call(print, "body", 0),
      "...",
      path.getValue().body[1] ? path.call(print, "body", 1) : ""
    ]),
  unary: (path, opts, print) => {
    const operator = path.getValue().body[0];

    return concat([
      operator === "not" ? "not " : operator[0],
      path.call(print, "body", 1)
    ]);
  },
  var_field: concatBody,
  var_ref: first
};

module.exports = Object.assign(
  {},
  require("./nodes/alias"),
  require("./nodes/args"),
  require("./nodes/arrays"),
  require("./nodes/assign"),
  require("./nodes/blocks"),
  require("./nodes/calls"),
  require("./nodes/case"),
  require("./nodes/commands"),
  require("./nodes/conditionals"),
  require("./nodes/constants"),
  require("./nodes/flow"),
  require("./nodes/hashes"),
  require("./nodes/hooks"),
  require("./nodes/lambdas"),
  require("./nodes/loops"),
  require("./nodes/massign"),
  require("./nodes/methods"),
  require("./nodes/params"),
  require("./nodes/regexp"),
  require("./nodes/rescue"),
  require("./nodes/scopes"),
  require("./nodes/statements"),
  require("./nodes/strings"),
  nodes
);
