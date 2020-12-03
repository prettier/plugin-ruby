const {
  concat,
  group,
  ifBreak,
  indent,
  join,
  line,
  softline
} = require("../prettier");

// Checks that every argument within this args node is a string_literal node
// that has no spaces or interpolations. This means we're dealing with an array
// that looks something like:
//
//     ['a', 'b', 'c']
//
function isStringArray(args) {
  return args.body.every((arg) => {
    // We want to verify that every node inside of this array is a string
    // literal. We also want to make sure none of them have comments attached.
    if (arg.type !== "string_literal" || arg.comments) {
      return false;
    }

    const string = arg.body[0];

    // If the string has multiple parts (meaning plain string content but also
    // interpolated content) then we know it's not a simple string.
    if (string.body.length !== 1) {
      return false;
    }

    const part = string.body[0];

    // If the only part of this string is not @tstring_content then it's
    // interpolated, so again we can return false.
    if (part.type !== "@tstring_content") {
      return false;
    }

    // Finally, verify that the string doesn't contain a space or an escape
    // character so that we know it can be put into a string literal array.
    return !part.body.includes(" ") && !part.body.includes("\\");
  });
}

// Checks that every argument within this args node is a symbol_literal node (as
// opposed to a dyna_symbol) so it has no interpolation. This means we're
// dealing with an array that looks something like:
//
//     [:a, :b, :c]
//
function isSymbolArray(args) {
  return args.body.every(
    (arg) => arg.type === "symbol_literal" && !arg.comments
  );
}

// Returns a list of docs for each element in a special array. These are
// effectively bare words since we know they came from either string literals or
// symbol literals.
function printSpecialArrayArgs(path, print, args) {
  return args.body.map((_arg, index) =>
    path.call(print, "body", 0, "body", index, "body", 0, "body", 0)
  );
}

// Prints out a special array literal. Accepts the parts of the array literal as
// an argument, where the first element of the parts array is a string that
// contains the special start.
function printSpecialArrayParts(parts) {
  return group(
    concat([
      parts[0],
      "[",
      indent(concat([softline, join(line, parts.slice(1))])),
      concat([softline, "]"])
    ])
  );
}

// Generates a print function with an embedded special start character for the
// specific type of array literal that we're dealing with. The print function
// returns an array as it expects to eventually be handed off to
// printSpecialArrayParts.
function printSpecialArray(start) {
  return function printSpecialArrayWithStart(path, opts, print) {
    return [start].concat(path.map(print, "body"));
  };
}

// An array node is any literal array in Ruby. This includes all of the special
// array literals as well as regular arrays. If it is a special array literal
// then it will have one child that represents the special array, otherwise it
// will have one child that contains all of the elements of the array.
function printArray(path, { addTrailingCommas }, print) {
  const args = path.getValue().body[0];

  // If there is no inner arguments node, then we're dealing with an empty
  // array, so we can go ahead and return.
  if (args === null) {
    return "[]";
  }

  // If we have an array that contains only simple string literals with no
  // spaces or interpolation, then we're going to print a %w array.
  if (isStringArray(args)) {
    const parts = printSpecialArrayArgs(path, print, args);
    return printSpecialArrayParts(["%w"].concat(parts));
  }

  // If we have an array that contains only simple symbol literals with no
  // interpolation, then we're going to print a %i array.
  if (isSymbolArray(args)) {
    const parts = printSpecialArrayArgs(path, print, args);
    return printSpecialArrayParts(["%i"].concat(parts));
  }

  // If we don't have a regular args node at this point then we have a special
  // array literal. In that case we're going to print out the body (which will
  // return to us an array with the first one being the start of the array) and
  // send that over to the printSpecialArrayParts function.
  if (!["args", "args_add_star"].includes(args.type)) {
    return printSpecialArrayParts(path.call(print, "body", 0));
  }

  // Here we have a normal array of any type of object with no special literal
  // types or anything.
  return group(
    concat([
      "[",
      indent(
        concat([
          softline,
          join(concat([",", line]), path.call(print, "body", 0)),
          addTrailingCommas ? ifBreak(",", "") : ""
        ])
      ),
      softline,
      "]"
    ])
  );
}

module.exports = {
  array: printArray,
  qsymbols: printSpecialArray("%i"),
  qwords: printSpecialArray("%w"),
  symbols: printSpecialArray("%I"),
  words: printSpecialArray("%W")
};
