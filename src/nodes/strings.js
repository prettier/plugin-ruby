const { concat, group, hardline, indent, join, line, softline } = require("prettier").doc.builders;
const { concatBody, empty, surround } = require("../utils");

module.exports = {
  "@CHAR": (path, { preferSingleQuotes }, print) => {
    const { body } = path.getValue();

    if (body.length !== 2) {
      return body;
    }

    const quote = preferSingleQuotes ? "\'" : "\"";
    return body.length === 2 ? concat([quote, body.slice(1), quote]) : body;
  },
  heredoc: (path, opts, print) => {
    const { beginning, ending } = path.getValue();

    return concat([
      beginning,
      concat([hardline, ...path.map(print, "body")]),
      ending
    ]);
  },
  string: (path, opts, print) => path.map(print, "body"),
  string_concat: (path, opts, print) => group(concat([
    path.call(print, "body", 0),
    " \\",
    indent(concat([hardline, path.call(print, "body", 1)]))
  ])),
  string_dvar: surround("#{", "}"),
  string_embexpr: surround("#{", "}"),
  string_literal: (path, { preferSingleQuotes }, print) => {
    if (path.getValue().body[0].type === "heredoc") {
      return path.call(print, "body", 0);
    }

    const parts = path.call(print, "body", 0);

    if (parts === '') {
      return preferSingleQuotes ? "''" : "\"\"";
    }

    let delim = "\"";
    if (preferSingleQuotes && !parts.some(part => part.parts ? part.parts[0] === "#{" : part.includes("'"))) {
      delim = "\'";
    }

    return concat([delim, ...parts, delim]);
  },
  word_add: concatBody,
  word_new: empty,
  xstring: (path, opts, print) => path.map(print, "body"),
  xstring_literal: (path, opts, print) => group(concat([
    "`",
    indent(concat([softline, join(softline, path.call(print, "body", 0))])),
    concat([softline, "`"])
  ]))
};
