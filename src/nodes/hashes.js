const { concat, group, ifBreak, indent, join, line } = require("prettier").doc.builders;
const { skipAssignIndent } = require("../utils");

module.exports = {
  assoc_new: (path, { preferHashLabels }, print) => {
    const parts = [];
    const [printedLabel, printedValue] = path.map(print, "body");

    switch (path.getValue().body[0].type) {
      case "@label":
        if (preferHashLabels) {
          parts.push(printedLabel);
        } else {
          parts.push(`:${printedLabel.slice(0, printedLabel.length - 1)} =>`);
        }
        break;
      case "symbol_literal":
        if (preferHashLabels && path.getValue().body[0].body.length === 1) {
          parts.push(concat([path.call(print, "body", 0, "body", 0, "body", 0), ":"]));
        } else {
          parts.push(concat([printedLabel, " =>"]));
        }
        break;
      case "dyna_symbol":
        if (preferHashLabels) {
          parts.push(concat(printedLabel.parts.slice(1).concat(":")));
        } else {
          parts.push(concat([printedLabel, " =>"]));
        }
        break;
      default:
        parts.push(concat([printedLabel, " =>"]));
        break;
    }

    if (skipAssignIndent(path.getValue().body[1])) {
      parts.push(" ", printedValue);
    } else {
      parts.push(indent(concat([line, printedValue])));
    }

    return group(concat(parts));
  },
  assoclist_from_args: (path, opts, print) => group(join(
    concat([",", line]),
    path.map(print, "body", 0)
  )),
  bare_assoc_hash: (path, opts, print) => group(
    join(concat([",", line]), path.map(print, "body", 0))
  ),
  hash: (path, { addTrailingCommas }, print) => {
    if (path.getValue().body[0] === null) {
      return "{}";
    }

    return group(concat([
      "{",
      indent(concat([
        line,
        concat(path.map(print, "body")),
        addTrailingCommas ? ifBreak(",", "") : ""
      ])),
      concat([line, "}"])
    ]));
  }
};
