const {
  concat,
  group,
  ifBreak,
  indent,
  join,
  line,
  literalline,
  softline
} = require("../prettier");

const isStringArray = (args) =>
  args.body.every(
    (arg) =>
      arg.type === "string_literal" &&
      arg.body[0].body.length === 1 &&
      arg.body[0].body[0].type === "@tstring_content" &&
      !arg.body[0].body[0].body.includes(" ")
  );

const isSymbolArray = (args) =>
  args.body.every((arg) => arg.type === "symbol_literal");

const makeArray = (start) => (path, opts, print) =>
  [start].concat(path.map(print, "body"));

const getSpecialArrayParts = (path, print, args) =>
  args.body.map((_arg, index) =>
    path.call(print, "body", 0, "body", index, "body", 0, "body", 0)
  );

const printAref = (path, opts, print) =>
  group(
    concat([
      path.call(print, "body", 0),
      "[",
      indent(
        concat([
          softline,
          join(concat([",", line]), path.call(print, "body", 1))
        ])
      ),
      concat([softline, "]"])
    ])
  );

const printSpecialArray = (parts) =>
  group(
    concat([
      parts[0],
      "[",
      indent(concat([softline, join(line, parts.slice(1))])),
      concat([softline, "]"])
    ])
  );

// Extract out the actual elements, taking into account nesting with
// `args_add_star` nodes. The only nodes that get passed into this function are
// `args` or `args_add_star`.
const getElements = (node, elementPath) => {
  if (node.type === "args") {
    return node.body.map((element, index) => ({
      element,
      elementPath: elementPath.concat(["body", index])
    }));
  }

  return getElements(node.body[0], elementPath.concat(["body", 0])).concat(
    node.body.slice(1).map((element, index) => ({
      element,
      elementPath: elementPath.concat(["body", index + 1])
    }))
  );
};

module.exports = {
  aref: (path, opts, print) => {
    if (!path.getValue().body[1]) {
      return concat([path.call(print, "body", 0), "[]"]);
    }

    return printAref(path, opts, print);
  },
  aref_field: printAref,
  array: (path, { addTrailingCommas }, print) => {
    const args = path.getValue().body[0];

    if (args === null) {
      return "[]";
    }

    if (isStringArray(args)) {
      return printSpecialArray(
        ["%w"].concat(getSpecialArrayParts(path, print, args))
      );
    }

    if (isSymbolArray(args)) {
      return printSpecialArray(
        ["%i"].concat(getSpecialArrayParts(path, print, args))
      );
    }

    if (!["args", "args_add_star"].includes(args.type)) {
      return printSpecialArray(path.call(print, "body", 0));
    }

    const normalDocs = [];

    const elementDocs = path.call(print, "body", 0);
    const elements = getElements(path.getValue().body[0], ["body", 0]);

    // We need to manually loop through the elements in the array in order to
    // take care of heredocs printing (their commas go after the opening, as
    // opposed to at the end).
    elements.forEach(({ element, elementPath }, index) => {
      const isInner = index !== elements.length - 1;

      const isStraightHeredoc = element.type === "heredoc";
      const isSquigglyHeredoc =
        element.type === "string_literal" && element.body[0].type === "heredoc";

      if (isStraightHeredoc || isSquigglyHeredoc) {
        const heredocNode = isStraightHeredoc ? element : element.body[0];
        const heredocPath = [print].concat(elementPath);

        if (isSquigglyHeredoc) {
          heredocPath.push("body", 0);
        }

        normalDocs.push(
          heredocNode.beging,
          isInner || addTrailingCommas ? "," : "",
          literalline,
          concat(path.map.apply(path, heredocPath.concat("body"))),
          heredocNode.ending,
          isInner ? line : ""
        );
      } else {
        normalDocs.push(elementDocs[index]);

        if (isInner) {
          normalDocs.push(concat([",", line]));
        } else if (addTrailingCommas) {
          normalDocs.push(ifBreak(",", ""));
        }
      }
    });

    return group(
      concat([
        "[",
        indent(concat([softline].concat(normalDocs))),
        concat([softline, "]"])
      ])
    );
  },
  qsymbols: makeArray("%i"),
  qwords: makeArray("%w"),
  symbols: makeArray("%I"),
  words: makeArray("%W")
};
