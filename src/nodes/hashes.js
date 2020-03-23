const {
  concat,
  group,
  ifBreak,
  indent,
  join,
  line,
  literalline
} = require("../prettier");
const { prefix, skipAssignIndent } = require("../utils");

const nodeDive = (node, steps) => {
  let current = node;

  steps.forEach((step) => {
    current = current[step];
  });

  return current;
};

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

      const isStraightHeredoc = valueNode && valueNode.type === "heredoc";
      const isSquigglyHeredoc =
        valueNode &&
        valueNode.type === "string_literal" &&
        valueNode.body[0].type === "heredoc";

      if (isStraightHeredoc || isSquigglyHeredoc) {
        const heredocSteps = isStraightHeredoc
          ? ["body", 1]
          : ["body", 1, "body", 0];
        const { beging, ending } = nodeDive(assocNode, heredocSteps);

        assocDocs.push(
          makeLabel(path, opts, print, ["body", 0, index, "body", 0]),
          " ",
          beging,
          isInner || addTrailingCommas ? "," : "",
          literalline,
          concat(
            path.map.apply(
              path,
              [print, "body", 0, index].concat(heredocSteps).concat("body")
            )
          ),
          ending,
          isInner ? line : ""
        );
      } else {
        assocDocs.push(path.call(print, "body", 0, index));

        if (isInner) {
          assocDocs.push(concat([",", line]));
        } else if (addTrailingCommas) {
          assocDocs.push(ifBreak(",", ""));
        }
      }
    });

    return group(concat(assocDocs));
  },
  bare_assoc_hash: (path, opts, print) =>
    group(join(concat([",", line]), path.map(print, "body", 0))),
  hash: (path, opts, print) => {
    if (path.getValue().body[0] === null) {
      return "{}";
    }

    return group(
      concat([
        "{",
        indent(concat([line, concat(path.map(print, "body"))])),
        concat([line, "}"])
      ])
    );
  }
};
