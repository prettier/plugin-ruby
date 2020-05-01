const {
  align,
  concat,
  group,
  hardline,
  indent,
  join,
  line
} = require("../prettier");
const { literal } = require("../utils");

module.exports = {
  begin: (path, opts, print) =>
    concat([
      "begin",
      indent(concat([hardline, concat(path.map(print, "body"))])),
      hardline,
      "end"
    ]),
  ensure: (path, opts, print) =>
    concat([
      "ensure",
      indent(concat([hardline, concat(path.map(print, "body"))]))
    ]),
  redo: literal("redo"),
  rescue: (path, opts, print) => {
    const [exception, variable, _stmts, addition] = path.getValue().body;
    const parts = ["rescue"];

    if (exception || variable) {
      if (exception) {
        if (Array.isArray(exception)) {
          // In this case, it's actually only the one exception (it's an array
          // of length 1).
          parts.push(" ", path.call(print, "body", 0, 0));
        } else {
          // Here we have multiple exceptions from which we're rescuing, so we
          // need to align them and join them together.
          const joiner = concat([",", line]);
          const exceptions = group(join(joiner, path.call(print, "body", 0)));

          parts.push(" ", align("rescue ".length, exceptions));
        }
      }

      if (variable) {
        parts.push(" => ", path.call(print, "body", 1));
      }
    } else {
      // If you don't specify an error to rescue in a `begin/rescue` block, then
      // implicitly you're rescuing from `StandardError`. In this case, we're
      // just going to explicitly add it.
      parts.push(" StandardError");
    }

    const rescueBody = path.call(print, "body", 2);

    if (rescueBody.parts.length > 0) {
      parts.push(indent(concat([hardline, rescueBody])));
    }

    // This is the next clause on the `begin` statement, either another
    // `rescue`, and `ensure`, or an `else` clause.
    if (addition) {
      parts.push(concat([hardline, path.call(print, "body", 3)]));
    }

    return group(concat(parts));
  },
  rescue_mod: (path, opts, print) =>
    concat([
      "begin",
      indent(concat([hardline, path.call(print, "body", 0)])),
      hardline,
      "rescue StandardError",
      indent(concat([hardline, path.call(print, "body", 1)])),
      hardline,
      "end"
    ]),
  retry: literal("retry")
};
