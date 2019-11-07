const { concat, join } = require("../prettier");
const { literal } = require("../utils");

module.exports = {
  break: (path, opts, print) => {
    const content = path.getValue().body[0];

    if (content.body.length === 0) {
      return "break";
    }

    if (content.body[0].body[0].type === "paren") {
      return concat([
        "break ",
        path.call(print, "body", 0, "body", 0, "body", 0, "body", 0)
      ]);
    }

    return concat(["break ", join(", ", path.call(print, "body", 0))]);
  },
  next: (path, opts, print) => {
    const args = path.getValue().body[0].body[0];

    if (!args) {
      return "next";
    }

    if (args.body[0].type === "paren") {
      // Ignoring the parens node and just going straight to the content
      return concat([
        "next ",
        path.call(print, "body", 0, "body", 0, "body", 0, "body", 0)
      ]);
    }

    return concat(["next ", join(", ", path.call(print, "body", 0))]);
  },
  yield: (path, opts, print) => {
    if (path.getValue().body[0].type === "paren") {
      return concat(["yield", path.call(print, "body", 0)]);
    }

    return concat(["yield ", join(", ", path.call(print, "body", 0))]);
  },
  yield0: literal("yield")
};
