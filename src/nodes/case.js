const {
  align,
  concat,
  fill,
  group,
  hardline,
  indent,
  line
} = require("../prettier");

module.exports = {
  case: (path, opts, print) => {
    const statement = ["case"];

    // You don't need to explicitly have something to test against in a case
    // statement (without it it effectively becomes an if/elsif chain).
    if (path.getValue().body[0]) {
      statement.push(" ", path.call(print, "body", 0));
    }

    return concat(
      statement.concat([hardline, path.call(print, "body", 1), hardline, "end"])
    );
  },
  when: (path, opts, print) => {
    const [_preds, _stmts, addition] = path.getValue().body;

    // The `fill` builder command expects an array of docs alternating with
    // line breaks. This is so it can loop through and determine where to break.
    const preds = fill(
      path
        .call(print, "body", 0)
        .reduce(
          (accum, pred, index) =>
            index === 0 ? [pred] : accum.concat([",", line, pred]),
          null
        )
    );

    const stmts = path.call(print, "body", 1);
    const parts = [concat(["when ", align("when ".length, preds)])];

    // It's possible in a when to just have empty void statements, in which case
    // we would skip adding the body.
    if (!stmts.parts.every((part) => !part)) {
      parts.push(indent(concat([hardline, stmts])));
    }

    // This is the next clause on the case statement, either another `when` or
    // an `else` clause.
    if (addition) {
      parts.push(hardline, path.call(print, "body", 2));
    }

    return group(concat(parts));
  }
};
