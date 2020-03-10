const {
  align,
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  softline
} = require("../prettier");
const { containsAssignment } = require("../utils");

const printLoop = (keyword, modifier) => (path, { inlineLoops }, print) => {
  const [_predicate, statements] = path.getValue().body;

  // If the only statement inside this while loop is a void statement, then we
  // can shorten to just displaying the predicate and then a semicolon.
  if (statements.body.length === 1 && statements.body[0].type === "void_stmt") {
    return group(
      concat([
        keyword,
        " ",
        path.call(print, "body", 0),
        ifBreak(softline, "; "),
        "end"
      ])
    );
  }

  let inlineParts = [
    path.call(print, "body", 1),
    ` ${keyword} `,
    path.call(print, "body", 0)
  ];

  // If the return value of this loop expression is being assigned to anything
  // besides a local variable then we can't inline the entire expression
  // without wrapping it in parentheses. This is because the following
  // expressions have different semantic meaning:
  //
  //     hash[:key] = break :value while false
  //     hash[:key] = while false do break :value end
  //
  // The first one will not result in an empty hash, whereas the second one
  // will result in `{ key: nil }`. In this case what we need to do for the
  // first expression to align is wrap it in parens, as in:
  //
  //     hash[:key] = (break :value while false)
  if (["assign", "massign"].includes(path.getParentNode().type)) {
    inlineParts = ["("].concat(inlineParts).concat(")");
  }

  const inlineLoop = concat(inlineParts);

  // If we're in the modifier form and we're modifying a `begin`, then this is a
  // special case where we need to explicitly use the modifier form because
  // otherwise the semantic meaning changes. This looks like:
  //
  //     begin
  //       foo
  //     end while bar
  //
  // The above is effectively a `do...while` loop (which we don't have in ruby).
  if (modifier && path.getValue().body[1].type === "begin") {
    return inlineLoop;
  }

  const blockLoop = concat([
    concat([
      `${keyword} `,
      align(keyword.length + 1, path.call(print, "body", 0))
    ]),
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, "end"])
  ]);

  // If we're disallowing inline loops or if the predicate of the loop contains
  // an assignment (in which case we can't know for certain that that
  // assignment doesn't impact the statements inside the loop) then we can't
  // use the modifier form and we must use the block form.
  if (!inlineLoops || containsAssignment(path.getValue().body[0])) {
    return blockLoop;
  }

  return group(ifBreak(blockLoop, inlineLoop));
};

// Technically this is incorrect. A `for` loop actually introduces and modifies
// a local variable that then remains in the outer scope. Additionally, if the
// `each` method was somehow missing from the enumerable (it's possible...),
// then this transformation would fail. However - I've never actually seen a
// `for` loop used in production. If someone actually calls me on it, I'll fix
// this, but for now I'm leaving it.
const printFor = (path, opts, print) =>
  group(
    concat([
      path.call(print, "body", 1),
      ".each do |",
      path.call(print, "body", 0),
      "|",
      indent(concat([hardline, path.call(print, "body", 2)])),
      concat([hardline, "end"])
    ])
  );

module.exports = {
  while: printLoop("while", false),
  while_mod: printLoop("while", true),
  until: printLoop("until", false),
  until_mod: printLoop("until", true),
  for: printFor
};
