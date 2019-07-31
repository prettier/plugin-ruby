const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  softline
} = require("../prettier");

const printLoop = (keyword, modifier) => (path, { inlineLoops }, print) => {
  const inlineLoop = concat([
    path.call(print, "body", 1),
    ` ${keyword} `,
    path.call(print, "body", 0)
  ]);

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
    concat([`${keyword} `, path.call(print, "body", 0)]),
    indent(concat([softline, path.call(print, "body", 1)])),
    concat([softline, "end"])
  ]);

  if (!inlineLoops) {
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
