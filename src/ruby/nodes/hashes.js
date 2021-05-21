const {
  concat,
  group,
  ifBreak,
  indent,
  join,
  line
} = require("../../prettier");

const {
  getTrailingComma,
  printEmptyCollection,
  skipAssignIndent
} = require("../../utils");

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

function canUseHashLabels(contentsNode) {
  return contentsNode.body.every((assocNode) => {
    if (assocNode.type === "assoc_splat") {
      return true;
    }

    switch (assocNode.body[0].type) {
      case "@label":
        return true;
      case "symbol_literal":
        return isValidHashLabel(assocNode.body[0]);
      case "dyna_symbol":
        return true;
      default:
        return false;
    }
  });
}

function printHashKeyLabel(path, print) {
  const node = path.getValue();

  switch (node.type) {
    case "@label":
      return print(path);
    case "symbol_literal":
      return concat([path.call(print, "body", 0), ":"]);
    case "dyna_symbol": {
      return concat([print(path), ":"]);
    }
  }
}

function printHashKeyRocket(path, print) {
  const node = path.getValue();
  let doc = print(path);

  if (node.type === "@label") {
    doc = concat([":", doc.slice(0, doc.length - 1)]);
  } else if (node.type === "dyna_symbol") {
    doc = concat([":", doc]);
  }

  return concat([doc, " =>"]);
}

function printAssocNew(path, opts, print) {
  const [keyNode, valueNode] = path.getValue().body;
  const { keyPrinter } = path.getParentNode();

  const parts = [path.call((keyPath) => keyPrinter(keyPath, print), "body", 0)];
  const valueDoc = path.call(print, "body", 1);

  // If we're printing a child hash then we want it to break along with its
  // parent hash, so we don't group the parts.
  if (valueNode.type === "hash") {
    parts.push(" ", valueDoc);
    return concat(parts);
  }

  if (!skipAssignIndent(valueNode) || keyNode.comments) {
    parts.push(indent(concat([line, valueDoc])));
  } else {
    parts.push(" ", valueDoc);
  }

  return group(concat(parts));
}

function printAssocSplat(path, opts, print) {
  return concat(["**", path.call(print, "body", 0)]);
}

function printHashContents(path, opts, print) {
  const node = path.getValue();

  // First determine which key printer we're going to use, so that the child
  // nodes can reference it when they go to get printed.
  node.keyPrinter =
    opts.rubyHashLabel && canUseHashLabels(path.getValue())
      ? printHashKeyLabel
      : printHashKeyRocket;

  return join(concat([",", line]), path.map(print, "body"));
}

function printHash(path, opts, print) {
  const hashNode = path.getValue();

  // Hashes normally have a single assoclist_from_args child node. If it's
  // missing, then it means we're dealing with an empty hash, so we can just
  // exit here and print.
  if (hashNode.body[0] === null) {
    return printEmptyCollection(path, opts, "{", "}");
  }

  let hashDoc = concat([
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
  ]);

  // If we're inside another hash, then we don't want to group our contents
  // because we want this hash to break along with its parent hash.
  if (path.getParentNode().type === "assoc_new") {
    return hashDoc;
  }

  return group(hashDoc);
}

module.exports = {
  assoc_new: printAssocNew,
  assoc_splat: printAssocSplat,
  assoclist_from_args: printHashContents,
  bare_assoc_hash: printHashContents,
  hash: printHash
};
