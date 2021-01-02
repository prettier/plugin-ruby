const { align, concat, group, join, line } = require("../../prettier");
const { literal } = require("../../utils");

function printSuper(path, opts, print) {
  const args = path.getValue().body[0];

  if (args.type === "arg_paren") {
    // In case there are explicitly no arguments but they are using parens,
    // we assume they are attempting to override the initializer and pass no
    // arguments up.
    if (args.body[0] === null) {
      return "super()";
    }

    return concat(["super", path.call(print, "body", 0)]);
  }

  const keyword = "super ";
  const argsDocs = path.call(print, "body", 0);

  return group(
    concat([
      keyword,
      align(keyword.length, group(join(concat([",", line]), argsDocs)))
    ])
  );
}

// Version of super without any parens or args.
const printZSuper = literal("super");

module.exports = {
  super: printSuper,
  zsuper: printZSuper
};
