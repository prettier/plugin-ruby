const { concat, join, line, align, group } = require("../prettier");
const { literal } = require("../utils");

module.exports = {
  super: (path, opts, print) => {
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
    const printedArgs = path.call(print, "body", 0);

    return group(
      concat([
        keyword,
        align(
          keyword.length,
          group(join(concat([",", line]), printedArgs)),
        )
      ])
    );
  },
  // version of super without any parens or args.
  zsuper: literal("super")
};
