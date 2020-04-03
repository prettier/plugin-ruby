const { concat, group, indent, line, softline } = require("../prettier");

module.exports = {
  binary: (path, opts, print) => {
    const operator = path.getValue().body[1];
    const useNoSpace = operator === "**";

    return group(
      concat([
        group(path.call(print, "body", 0)),
        indent(
          concat([
            useNoSpace ? "" : " ",
            group(
              concat([
                operator,
                useNoSpace ? softline : line,
                path.call(print, "body", 2)
              ])
            )
          ])
        )
      ])
    );
  },
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
    const oper = path.getValue().body[0];
    const doc = path.call(print, "body", 1);

    if (oper === "not") {
      // For the `not` operator, we're explicitly making the space character
      // another element in the `concat` because there are some circumstances
      // where we need to force parentheses (e.g., ternaries). In that case the
      // printer for those nodes can just take out the space and put in parens.
      return concat(["not", " ", doc]);
    }

    return concat([oper[0], doc]);
  }
};
