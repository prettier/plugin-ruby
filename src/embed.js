const {
  concat,
  indent,
  literalline,
  mapDoc,
  markAsRoot,
  stripTrailingHardline
} = require("./prettier");

const parsers = {
  css: "css",
  javascript: "babel",
  js: "babel",
  less: "less",
  markdown: "markdown",
  ruby: "ruby",
  scss: "scss"
};

const replaceNewlines = (doc) =>
  mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string" && currentDoc.includes("\n")
      ? concat(
          currentDoc
            .split(/(\n)/g)
            .map((v, i) => (i % 2 === 0 ? v : literalline))
        )
      : currentDoc
  );

const embed = (path, _print, textToDoc, _opts) => {
  const node = path.getValue();

  // Currently we only support embedded formatting on heredoc nodes
  if (node.type !== "heredoc") {
    return null;
  }

  // First, ensure that we don't have any interpolation
  const { beging, body, ending } = node;
  if (body.some((part) => part.type !== "@tstring_content")) {
    return null;
  }

  // Next, find the parser associated with this heredoc (if there is one). For
  // example, if you use <<~CSS, we'd hook it up to the css parser.
  const parser = parsers[beging.slice(3).toLowerCase()];
  if (!parser) {
    return null;
  }

  // Get the content as if it were a source string, and then pass that content
  // into the embedded parser. Get back the doc node.
  const content = body.map((part) => part.body).join("");
  const formatted = concat([
    literalline,
    replaceNewlines(stripTrailingHardline(textToDoc(content, { parser })))
  ]);

  // If we're using a squiggly heredoc, then we can properly handle indentation
  // ourselves.
  if (beging[2] === "~") {
    return concat([beging, indent(markAsRoot(formatted)), literalline, ending]);
  }

  // Otherwise, we need to just assume it's formatted correctly and return the
  // content as it is.
  return markAsRoot(concat([beging, formatted, literalline, ending]));
};

module.exports = embed;
