const {
  concat,
  hardline,
  indent,
  literalline,
  mapDoc,
  markAsRoot,
  stripTrailingHardline
} = require("../prettier");

const parsers = {
  css: "css",
  javascript: "babel",
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

const embed = (path, print, textToDoc, _opts) => {
  const node = path.getValue();
  if (node.type !== "filter") {
    return null;
  }

  const parser = parsers[node.value.name];
  if (!parser) {
    return null;
  }

  return markAsRoot(
    concat([
      ":",
      node.value.name,
      indent(
        concat([
          hardline,
          replaceNewlines(
            stripTrailingHardline(textToDoc(node.value.text, { parser }))
          )
        ])
      )
    ])
  );
};

module.exports = embed;
