const {
  concat,
  group,
  ifBreak,
  indent,
  line,
  removeLines,
  softline
} = require("../prettier");
const { hasAncestor } = require("../utils");

module.exports = {
  lambda: (path, opts, print) => {
    let params = path.getValue().body[0];
    let paramsConcat = "";

    if (params.type === "params") {
      paramsConcat = path.call(print, "body", 0);
    } else {
      [params] = params.body;
      paramsConcat = path.call(print, "body", 0, "body", 0);
    }

    const noParams = params.body.every((type) => !type);
    const inlineLambda = concat([
      "->",
      noParams ? "" : concat(["(", paramsConcat, ")"]),
      " { ",
      path.call(print, "body", 1),
      " }"
    ]);

    if (hasAncestor(path, ["command", "command_call"])) {
      return group(
        ifBreak(
          concat([
            "lambda {",
            noParams ? "" : concat([" |", removeLines(paramsConcat), "|"]),
            indent(concat([line, path.call(print, "body", 1)])),
            concat([line, "}"])
          ]),
          inlineLambda
        )
      );
    }

    return group(
      ifBreak(
        concat([
          "lambda do",
          noParams ? "" : concat([" |", removeLines(paramsConcat), "|"]),
          indent(concat([softline, path.call(print, "body", 1)])),
          concat([softline, "end"])
        ]),
        inlineLambda
      )
    );
  }
};
