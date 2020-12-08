const {
  concat,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line
} = require("../prettier");

const { getTrailingComma, prefix, skipAssignIndent } = require("../utils");

// When attempting to convert a hash rocket into a hash label, you need to take
// care because only certain patterns are allowed. Ruby source says that they
// have to match keyword arguments to methods, but don't specify what that is.
// After some experimentation, it looks like it's:
//
// * Starts with a letter (either case) or an underscore
// * Does not end in equal
//
// This function represents that check, as it determines if it can convert the
// symbol node into a hash label.
function isValidHashLabel(symbolLiteral) {
  const label = symbolLiteral.body[0].body;
  return label.match(/^[_A-Za-z]/) && !label.endsWith("=");
}

function printHashKey(path, { rubyHashLabel }, print) {
  const labelNode = path.getValue().body[0];
  const labelDoc = path.call(print, "body", 0);

  switch (labelNode.type) {
    case "@label":
      if (rubyHashLabel) {
        return labelDoc;
      }
      return `:${labelDoc.slice(0, labelDoc.length - 1)} =>`;
    case "symbol_literal": {
      if (rubyHashLabel && isValidHashLabel(labelNode)) {
        return concat([path.call(print, "body", 0, "body", 0), ":"]);
      }
      return concat([labelDoc, " =>"]);
    }
    case "dyna_symbol":
      if (rubyHashLabel) {
        return concat(labelDoc.parts.slice(1).concat(":"));
      }
      return concat([labelDoc, " =>"]);
    default:
      return concat([labelDoc, " =>"]);
  }
}

function printAssocNew(path, opts, print) {
  const valueDoc = path.call(print, "body", 1);
  const parts = [printHashKey(path, opts, print)];

  if (skipAssignIndent(path.getValue().body[1])) {
    parts.push(" ", valueDoc);
  } else {
    parts.push(indent(concat([line, valueDoc])));
  }

  return group(concat(parts));
}

function printEmptyHashWithComments(path, opts) {
  const hashNode = path.getValue();

  const printComment = (commentPath, index) => {
    hashNode.comments[index].printed = true;
    return opts.printer.printComment(commentPath);
  };

  return concat([
    "{",
    indent(
      concat([hardline, join(hardline, path.map(printComment, "comments"))])
    ),
    line,
    "}"
  ]);
}

function printHash(path, opts, print) {
  const hashNode = path.getValue();

  // Hashes normally have a single assoclist_from_args child node. If it's
  // missing, then it means we're dealing with an empty hash, so we can just
  // exit here and print.
  if (hashNode.body[0] === null) {
    return hashNode.comments ? printEmptyHashWithComments(path, opts) : "{}";
  }

  return group(
    concat([
      "{",
      indent(
        concat([
          line,
          path.call(print, "body", 0),
          getTrailingComma(opts) ? ifBreak(",", "") : ""
        ])
      ),
      line,
      "}"
    ])
  );
}

function printHashContents(path, opts, print) {
  return group(join(concat([",", line]), path.map(print, "body")));
}

module.exports = {
  assoc_new: printAssocNew,
  assoc_splat: prefix("**"),
  assoclist_from_args: printHashContents,
  bare_assoc_hash: printHashContents,
  hash: printHash
};
