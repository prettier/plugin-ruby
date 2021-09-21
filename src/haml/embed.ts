import type { Plugin, HAML } from "../types";
import prettier from "../prettier";

const {
  hardline,
  indent,
  literalline,
  markAsRoot,
  mapDoc,
  stripTrailingHardline
} = prettier;

// This function is in here because it handles embedded parser values. I don't
// have a test that exercises it because I'm not sure for which parser it is
// necessary, but since it's in prettier core I'm keeping it here.
/* istanbul ignore next */
function replaceNewlines(doc: Plugin.Doc) {
  return mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string" && currentDoc.includes("\n")
      ? currentDoc.split(/(\n)/g).map((v, i) => (i % 2 === 0 ? v : literalline))
      : currentDoc
  );
}

const embed: Plugin.Embed<HAML.AnyNode> = (path, _print, textToDoc, opts) => {
  const node = path.getValue();

  // We're only going to embed other languages on filter nodes.
  if (node.type !== "filter") {
    return null;
  }

  let parser = node.value.name;

  // We don't want to deal with some weird recursive parser situation, so we
  // need to explicitly call out the HAML parser here and just return null.
  if (parser === "haml") {
    return null;
  }

  // In HAML the name of the JS filter is :javascript, whereas in prettier the
  // name of the JS parser is babel. Here we explicitly handle that conversion.
  if (parser === "javascript") {
    parser = "babel";
  }

  // If there aren't any plugins that look like the name of the filter, then we
  // will just exit early.
  if (
    !opts.plugins.some(
      (plugin) =>
        typeof plugin !== "string" &&
        plugin.parsers &&
        Object.prototype.hasOwnProperty.call(plugin.parsers, parser)
    )
  ) {
    return null;
  }

  // If there is a plugin that has a parser that matches the name of this
  // filter, then we're going to assume that's correct for embedding and go
  // ahead and switch to that parser.
  return markAsRoot([
    ":",
    node.value.name,
    indent([
      hardline,
      replaceNewlines(
        stripTrailingHardline(textToDoc(node.value.text, { parser }))
      )
    ])
  ]);
};

export default embed;
