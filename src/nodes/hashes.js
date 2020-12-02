const {
  concat,
  group,
  ifBreak,
  indent,
  join,
  line,
  literalline
} = require("../prettier");

const { nodeDive, prefix, skipAssignIndent } = require("../utils");

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
const isValidHashLabel = (symbolLiteral) => {
  const label = symbolLiteral.body[0].body[0].body;
  return label.match(/^[_A-Za-z]/) && !label.endsWith("=");
};

const makeLabel = (path, { preferHashLabels }, print, steps) => {
  const labelNode = nodeDive(path.getValue(), steps);
  const labelDoc = path.call.apply(path, [print].concat(steps));

  switch (labelNode.type) {
    case "@label":
      if (preferHashLabels) {
        return labelDoc;
      }
      return `:${labelDoc.slice(0, labelDoc.length - 1)} =>`;
    case "symbol_literal": {
      if (preferHashLabels && isValidHashLabel(labelNode)) {
        const symbolSteps = steps.concat("body", 0, "body", 0);

        return concat([
          path.call.apply(path, [print].concat(symbolSteps)),
          ":"
        ]);
      }
      return concat([labelDoc, " =>"]);
    }
    case "dyna_symbol":
      if (preferHashLabels) {
        return concat(labelDoc.parts.slice(1).concat(":"));
      }
      return concat([labelDoc, " =>"]);
    default:
      return concat([labelDoc, " =>"]);
  }
};

function printHash(path, { addTrailingCommas }, print) {
  const hashNode = path.getValue();

  // Hashes normally have a single assoclist_from_args child node. If it's
  // missing, then it means we're dealing with an empty hash, so we can just
  // exit here and print.
  if (hashNode.body[0] === null) {
    return "{}";
  }

  // Here we get a reference to the printed assoclist_from_args child node,
  // which handles printing all of the key-value pairs of the hash. We're
  // wrapping it in an array in case we need to append a trailing comma.
  const assocDocs = [path.call(print, "body", 0)];

  // Here we get a reference to the last key-value pair's value node, in order
  // to check if we're dealing with a heredoc. If we are, then the trailing
  // comma printing is handled from within the assoclist_from_args node
  // printing, because the trailing comma has to go after the heredoc
  // declaration.
  const assocNodes = hashNode.body[0].body[0];
  const lastAssocValueNode = assocNodes[assocNodes.length - 1].body[1];

  // If we're adding a trailing comma and the last key-value pair's value node
  // is not a heredoc node, then we can safely append the extra comma if the
  // hash ends up getting printed on multiple lines.
  if (addTrailingCommas && lastAssocValueNode.type !== "heredoc") {
    assocDocs.push(ifBreak(",", ""));
  }

  return group(
    concat([
      "{",
      indent(concat([line, concat(assocDocs)])),
      concat([line, "}"])
    ])
  );
}

module.exports = {
  assoc_new: (path, opts, print) => {
    const valueDoc = path.call(print, "body", 1);
    const parts = [makeLabel(path, opts, print, ["body", 0])];

    if (skipAssignIndent(path.getValue().body[1])) {
      parts.push(" ", valueDoc);
    } else {
      parts.push(indent(concat([line, valueDoc])));
    }

    return group(concat(parts));
  },
  assoc_splat: prefix("**"),
  assoclist_from_args: (path, opts, print) => {
    const { addTrailingCommas } = opts;

    const assocNodes = path.getValue().body[0];
    const assocDocs = [];

    assocNodes.forEach((assocNode, index) => {
      const isInner = index !== assocNodes.length - 1;
      const valueNode = assocNode.body[1];

      if (valueNode && valueNode.type === "heredoc") {
        assocDocs.push(
          makeLabel(path, opts, print, ["body", 0, index, "body", 0]),
          " ",
          valueNode.beging,
          isInner || addTrailingCommas ? "," : "",
          literalline,
          concat(path.map(print, "body", 0, index, "body", 1, "body")),
          valueNode.ending,
          isInner ? line : ""
        );
      } else {
        assocDocs.push(path.call(print, "body", 0, index));

        if (isInner) {
          assocDocs.push(concat([",", line]));
        }
      }
    });

    return group(concat(assocDocs));
  },
  bare_assoc_hash: (path, opts, print) =>
    group(join(concat([",", line]), path.map(print, "body", 0))),
  hash: printHash
};
