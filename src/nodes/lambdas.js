const {
  concat,
  group,
  ifBreak,
  indent,
  line,
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
    const needsBracePrededence = hasAncestor(path, ["command", "command_call"]);
    const inlineLambda = concat([
      "->",
      noParams ? "" : concat(["(", paramsConcat, ")"]),
      " { ",
      path.call(print, "body", 1),
      " }"
    ]);

    const beggingFitToPrint = needsBracePrededence ? " {" : " do";
    const endingFitToPrint = needsBracePrededence ? "}" : "end";

    return group(
      ifBreak(
        concat([
          "->",
          noParams
            ? ""
            : group(
                concat([
                  "(",
                  indent(concat([softline, paramsConcat])),
                  softline,
                  ")"
                ])
              ),
          beggingFitToPrint,
          group(
            concat([
              indent(concat([line, path.call(print, "body", 1)])),
              line,
              endingFitToPrint
            ])
          )
        ]),
        inlineLambda
      )
    );
  }
};
