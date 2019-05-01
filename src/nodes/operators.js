const { concat, group, indent, line, softline } = require("../builders");

module.exports = {
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
  }
};
