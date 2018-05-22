const {
  align, concat, dedent, group, hardline, indent, join, line, markAsRoot
} = require("prettier").doc.builders;

const concatBody = (path, print) => concat(path.map(print, "body"));
const literalBody = (path, print) => path.getValue().body;

const nodes = {
  "@const": literalBody,
  "@ident": literalBody,
  "@int": literalBody,
  "@ivar": literalBody,
  "@tstring_content": literalBody,
  alias: (path, print) => concat(["alias ", join(" ", path.map(print, "body"))]),
  args_add_block: (path, print) => {
    const [_, block] = path.getValue().body;
    const parts = [join(", ", path.map(print, "body", 0))];

    if (block) {
      parts.push(path.map(print, "body", 1));
    }

    return group(concat(parts));
  },
  assign: (path, print) => join(" = ", path.map(print, "body")),
  binary: (path, print) => join(` ${path.getValue().body[1]} `, [
    path.call(print, "body", 0),
    path.call(print, "body", 2)
  ]),
  bodystmt: (path, print) => join(line, path.map(print, "body", 0)),
  call: (path, print) => join(path.getValue().body[1], [
    path.call(print, "body", 0),
    path.call(print, "body", 2)
  ]),
  class: (path, print) => {
    const parts = ["class ", path.call(print, "body", 0)];

    if (path.getValue().body[1]) {
      parts.push(" < ", path.call(print, "body", 1));
    }

    parts.push(indent(path.call(print, "body", 2)), hardline, "end", hardline);

    return group(concat(parts));
  },
  command: (path, print) => join(" ", path.map(print, "body")),
  const_ref: (path, print) => path.call(print, "body", 0),
  def: (path, print) => group(concat([
    concat(["def ", path.call(print, "body", 0)]),
    path.call(print, "body", 1),
    indent(concat([hardline, path.call(print, "body", 2)])),
    hardline,
    "end"
  ])),
  params: (path, print) => (
    join(", ", path.getValue().body.reduce((parts, paramType, index) => {
      if (paramType) {
        return parts.concat(path.map(print, "body", index));
      }
      return parts;
    }, []))
  ),
  paren: (path, print) => (
    concat(["(", ...path.getValue().body.reduce((parts, part, index) => {
      if (Array.isArray(part)) {
        return parts.concat(path.map(print, "body", index));
      }
      return [...parts, path.call(print, "body", index)];
    }, []), ")"])
  ),
  program: (path, print) => markAsRoot(join(hardline, path.map(print, "body", 0))),
  string_content: (path, print) => {
    const delim = path.getValue().body.some(({ type }) => type === "string_embexpr") ? "\"" : "'";
    return concat([delim, ...path.map(print, "body"), delim]);
  },
  string_embexpr: (path, print) => concat(["#{", ...path.map(print, "body", 0), "}"]),
  string_literal: concatBody,
  symbol: (path, print) => concat([":", ...path.map(print, "body")]),
  symbol_literal: concatBody,
  var_field: concatBody,
  var_ref: (path, print) => path.call(print, "body", 0),
  vcall: concatBody,
  void_stmt: (path, print) => ""
};

const debugNode = (path, print) => {
  console.log("=== UNSUPPORTED NODE ===");
  console.log(path.getValue());
  console.log("========================");
  return "";
};

const genericPrint = (path, options, print) => {
  const { type } = path.getValue();
  return (nodes[type] || debugNode)(path, print);
};

module.exports = genericPrint;
