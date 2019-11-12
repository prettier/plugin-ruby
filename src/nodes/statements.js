const {
  concat,
  dedent,
  group,
  hardline,
  indent,
  join,
  line,
  literalline,
  softline,
  trim
} = require("../prettier");

module.exports = {
  "@__end__": (path, _opts, _print) => {
    const { body } = path.getValue();
    return concat([trim, "__END__", literalline, body]);
  },
  bodystmt: (path, opts, print) => {
    const [_statements, rescue, elseClause, ensure] = path.getValue().body;
    const parts = [path.call(print, "body", 0)];

    if (rescue) {
      parts.push(dedent(concat([hardline, path.call(print, "body", 1)])));
    }

    if (elseClause) {
      // Before Ruby 2.6, this piece of bodystmt was an explicit "else" node
      const stmts =
        elseClause.type === "else"
          ? path.call(print, "body", 2, "body", 0)
          : path.call(print, "body", 2);

      parts.push(concat([dedent(concat([hardline, "else"])), hardline, stmts]));
    }

    if (ensure) {
      parts.push(dedent(concat([hardline, path.call(print, "body", 3)])));
    }

    return group(concat(parts));
  },
  embdoc: (path, _opts, _print) => concat([trim, path.getValue().body]),
  paren: (path, opts, print) => {
    if (!path.getValue().body[0]) {
      return "()";
    }

    let content = path.call(print, "body", 0);

    if (
      ["args", "args_add_star", "args_add_block"].includes(
        path.getValue().body[0].type
      )
    ) {
      content = join(concat([",", line]), content);
    }

    return group(
      concat([
        "(",
        indent(concat([softline, content])),
        concat([softline, ")"])
      ])
    );
  },
  program: (path, opts, print) =>
    concat([join(hardline, path.map(print, "body")), hardline]),
  stmts: (path, opts, print) => {
    const stmts = path.getValue().body;
    const parts = [];
    let lineNo = null;

    stmts.forEach((stmt, index) => {
      if (stmt.type === "void_stmt") {
        return;
      }

      const printed = path.call(print, "body", index);

      if (lineNo === null) {
        parts.push(printed);
      } else if (
        stmt.start - lineNo > 1 ||
        [stmt.type, stmts[index - 1].type].includes("access_ctrl")
      ) {
        parts.push(hardline, hardline, printed);
      } else if (
        stmt.start !== lineNo ||
        path.getParentNode().type !== "string_embexpr"
      ) {
        parts.push(hardline, printed);
      } else {
        parts.push("; ", printed);
      }

      lineNo = stmt.end;
    });

    return concat(parts);
  }
};
