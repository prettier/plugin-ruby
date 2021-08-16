// If the statements are just a single if/unless, in block or modifier form, or a ternary
function containsSingleConditional(statements) {
  return (
    statements.body.length === 1 &&
    ["if", "if_mod", "ifop", "unless", "unless_mod"].includes(
      statements.body[0].type
    )
  );
}

module.exports = containsSingleConditional;
