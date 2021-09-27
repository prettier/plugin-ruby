import type { Plugin, HAML } from "../types";
import prettier from "../prettier";
import embed from "./embed";

const {
  align,
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  makeString,
  softline
} = prettier;

const docTypes = {
  basic: "Basic",
  frameset: "Frameset",
  mobile: "Mobile",
  rdfa: "RDFa",
  strict: "Strict",
  xml: "XML"
} as const;

const docVersions = ["1.1", "5"];

// Prints out a hash key according to the configured prettier options.
function printHashKey(key: string, opts: Plugin.Options) {
  let quoted = key;
  const joiner = opts.rubyHashLabel ? ":" : " =>";

  if (key.includes(":") || key.includes("-")) {
    const quote = opts.rubySingleQuote ? "'" : '"';
    quoted = `${quote}${key}${quote}`;
  }

  return `${opts.rubyHashLabel ? "" : ":"}${quoted}${joiner}`;
}

// Prints out the value inside of a hash key-value pair according to the
// configured prettier options.
function printHashValue(value: string | number, opts: Plugin.Options) {
  if (typeof value !== "string") {
    return value.toString();
  }

  // This is a very special syntax created by the parser to let us know that
  // this should be printed literally instead of as a string.
  if (value.startsWith("&")) {
    return value.slice(1);
  }

  const quote =
    opts.rubySingleQuote && !value.includes("#{") && !value.includes("'")
      ? "'"
      : '"';

  return makeString(value, quote);
}

// This will print an attributes object to a Doc node. It handles nesting on
// multiple levels and will print out according to whether or not the version of
// HAML being used supports multi-line attributes.
function printAttributes(
  object: HAML.TagAttrs,
  opts: Plugin.Options & { supportsMultiline: boolean; headerLength: number },
  level = 0
) {
  if (typeof object !== "object") {
    return printHashValue(object, opts);
  }

  const boundary = level === 0 ? softline : line;
  const parts: Plugin.Doc[] = Object.keys(object).map((key) => [
    printHashKey(key, opts),
    " ",
    printAttributes(object[key], opts, level + 1)
  ]);

  // If we have support for multi-line attributes laid out like a regular hash,
  // then we print them that way here.
  if (opts.supportsMultiline) {
    return group([
      "{",
      indent(group([boundary, join([",", line], parts)])),
      boundary,
      "}"
    ]);
  }

  // Otherwise, if we only have one attribute, then just print it inline
  // regardless of how long it is.
  if (parts.length === 0) {
    return group(["{", parts[0], "}"]);
  }

  // Otherwise, depending on how long the line is it will split the content into
  // multi-line attributes that old Haml understands.
  return group([
    "{",
    parts[0],
    ",",
    align(opts.headerLength + 1, [line, join([",", line], parts.slice(1))]),
    "}"
  ]);
}

// A utility function used in a silent script that is meant to determine if a
// child node is a continuation of a parent node (as in a when clause within a
// case statement or an else clause within an if).
function isContinuation(
  parentNode: HAML.SilentScript,
  childNode: HAML.AnyNode
) {
  if (childNode.type !== "silent_script") {
    return false;
  }

  const parent = parentNode.value.keyword;
  const child = childNode.value.keyword;

  return (
    (parent === "case" && ["when", "else"].includes(child)) ||
    (["if", "unless"].includes(parent) && ["elsif", "else"].includes(child))
  );
}

const printer: Plugin.PrinterConfig<HAML.AnyNode> = {
  embed,
  // This is our printer's main print function that will switch on the type of
  // node and print it out by returning a Doc tree.
  print(path, opts, print) {
    const node = path.getValue();

    switch (node.type) {
      // https://haml.info/docs/yardoc/file.REFERENCE.html#html-comments-
      case "comment": {
        const { value } = node;
        const parts = ["/"];

        if (value.revealed) {
          parts.push("!");
        }

        if (value.conditional) {
          parts.push(value.conditional);
        } else if (value.text) {
          parts.push(" ", value.text);
        }

        return printWithChildren(node, group(parts));
      }
      // https://haml.info/docs/yardoc/file.REFERENCE.html#doctype-
      case "doctype": {
        const { value } = node;
        const parts = ["!!!"];

        if (value.type in docTypes) {
          parts.push(docTypes[value.type as keyof typeof docTypes]);
        } else if (value.version && docVersions.includes(value.version)) {
          parts.push(value.version);
        } else {
          parts.push(value.type);
        }

        if (value.encoding) {
          parts.push(value.encoding);
        }

        return group(join(" ", parts));
      }
      // https://haml.info/docs/yardoc/file.REFERENCE.html#filters
      case "filter":
        return group([
          ":",
          node.value.name,
          indent([hardline, join(hardline, node.value.text.trim().split("\n"))])
        ]);
      // https://haml.info/docs/yardoc/file.REFERENCE.html#haml-comments--
      case "haml_comment": {
        const { value } = node;
        const parts: Plugin.Doc[] = ["-#"];

        if (value.text) {
          if (opts.originalText.split("\n")[node.line - 1].trim() === "-#") {
            const lines = value.text.trim().split("\n");

            parts.push(indent([hardline, join(hardline, lines)]));
          } else {
            parts.push(" ", value.text.trim());
          }
        }

        return parts;
      }
      // https://haml.info/docs/yardoc/file.REFERENCE.html#plain-text
      case "plain":
        return node.value.text;
      // The root node in the AST that we build in the parser.
      case "root": {
        const nodePath = path as Plugin.Path<typeof node>;

        return [join(hardline, nodePath.map(print, "children")), hardline];
      }
      // https://haml.info/docs/yardoc/file.REFERENCE.html#inserting_ruby
      case "script": {
        const { value } = node;
        const parts = [];

        if (value.escape_html) {
          parts.unshift("&");
        }

        if (value.preserve) {
          parts.push("~");
        } else if (!value.interpolate) {
          parts.push("=");
        }

        if (value.escape_html && !value.preserve && value.interpolate) {
          parts.push(" ", value.text.trim().slice(1, -1));
        } else {
          parts.push(" ", value.text.trim());
        }

        return printWithChildren(node, group(parts));
      }
      // https://haml.info/docs/yardoc/file.REFERENCE.html#running-ruby--
      case "silent_script": {
        const parts: Plugin.Doc[] = [`- ${node.value.text.trim()}`];

        if (node.children.length > 0) {
          const nodePath = path as Plugin.Path<typeof node>;

          parts.push(
            nodePath.map((childPath) => {
              const child = childPath.getValue();
              const concated = [hardline, print(childPath)];

              return isContinuation(node, child) ? concated : indent(concated);
            }, "children")
          );
        }

        return group(parts);
      }
      // https://haml.info/docs/yardoc/file.REFERENCE.html#element-name-
      case "tag": {
        const { value } = node;
        const { attributes, dynamic_attributes } = value;
        const parts = [];

        // If we have a tag that isn't a div, then we need to print out that
        // name of that tag first. If it is a div, first we'll check if there
        // are any other things that would force us to print out the div
        // explicitly, and otherwise we'll leave it off.
        if (value.name !== "div") {
          parts.push(`%${value.name}`);
        }

        // If we have a class attribute, then we're going to print that here
        // using the special class syntax.
        if (attributes.class) {
          parts.push(`.${attributes.class.replace(/ /g, ".")}`);
        }

        // If we have an id attribute, then we're going to print that here using
        // the special id syntax.
        if (attributes.id) {
          parts.push(`#${attributes.id}`);
        }

        // If we're using dynamic attributes on this tag, then they come in as a
        // string that looks like the output of Hash#inspect from Ruby. So here
        // we're going to split it all up and print it out nicely.
        if (dynamic_attributes.new) {
          const docs: Plugin.Doc[] = [];

          dynamic_attributes.new
            .slice(1, -2)
            .split(",")
            .forEach((pair, index) => {
              if (index !== 0) {
                docs.push(line);
              }
              docs.push(join("=", pair.slice(1).split('" => ')));
            });

          parts.push(
            group(["(", align(parts.join("").length + 1, fill(docs)), ")"])
          );
        }

        // If there are any static attributes that are not class or id (because
        // we already took care of those), then we're going to print them out
        // here.
        const staticAttributes = Object.keys(attributes).filter(
          (name) => !["class", "id"].includes(name)
        );

        if (staticAttributes.length > 0) {
          const docs = staticAttributes.reduce((accum, key) => {
            const doc = `${printHashKey(key, opts)} ${printHashValue(
              attributes[key],
              opts
            )}`;

            return accum.length === 0 ? [doc] : [...accum, ",", line, doc];
          }, [] as Plugin.Doc[]);

          parts.push(
            group(["{", align(parts.join("").length + 1, fill(docs)), "}"])
          );
        }

        // If there are dynamic attributes that don't use the newer syntax, then
        // we're going to print them out here.
        if (dynamic_attributes.old) {
          if (parts.length === 0) {
            parts.push("%div");
          }

          if (typeof dynamic_attributes.old === "string") {
            parts.push(dynamic_attributes.old);
          } else {
            // This is kind of a total hack in that I don't think you're
            // really supposed to directly use `path.stack`, but it's the
            // easiest way to get the root node without having to know how
            // many levels deep we are.
            const root = path.stack[0] as HAML.Root;

            parts.push(
              printAttributes(dynamic_attributes.old, {
                ...opts,
                supportsMultiline: root.supports_multiline,
                headerLength: parts.join("").length
              })
            );
          }
        }

        // https://haml.info/docs/yardoc/file.REFERENCE.html#object-reference-
        if (value.object_ref) {
          if (parts.length === 0) {
            parts.push("%div");
          }
          parts.push(value.object_ref);
        }

        // https://haml.info/docs/yardoc/file.REFERENCE.html#whitespace-removal--and-
        if (value.nuke_outer_whitespace) {
          parts.push(">");
        }

        if (value.nuke_inner_whitespace) {
          parts.push("<");
        }

        // https://haml.info/docs/yardoc/file.REFERENCE.html#empty-void-tags-
        if (value.self_closing) {
          parts.push("/");
        }

        if (value.value) {
          let contents: Plugin.Doc[];

          if (value.parse && value.value.match(/#[{$@]/)) {
            // There's a weird case here where if the value includes
            // interpolation and it's marked as { parse: true }, then we don't
            // actually want the = prefix, and we want to remove extra escaping.
            contents = [
              ifBreak("", " "),
              value.value.slice(1, -1).replace(/\\"/g, '"')
            ];
          } else if (value.parse) {
            contents = ["= ", value.value];
          } else {
            contents = [ifBreak("", " "), value.value];
          }

          return printWithChildren(
            node,
            group([group(parts), indent([softline, ...contents])])
          );
        }

        // In case none of the other if statements have matched and we're
        // printing a div, we need to explicitly add it back into the array.
        if (parts.length === 0 && value.name === "div") {
          parts.push("%div");
        }

        return printWithChildren(node, group(parts));
      }
      default:
        throw new Error(`Unsupported node encountered: ${(node as any).type}`);
    }

    // It's common to a couple of nodes to attach nested child nodes on the
    // children property. This utility prints them out grouped together with
    // their parent node docs.
    function printWithChildren(
      node: HAML.Comment | HAML.Script | HAML.Tag,
      docs: Plugin.Doc
    ) {
      if (node.children.length === 0) {
        return docs;
      }

      const nodePath = path as Plugin.Path<typeof node>;

      return group([
        docs,
        indent([hardline, join(hardline, nodePath.map(print, "children"))])
      ]);
    }
  },
  // This function handles adding the format pragma to a source string. This is
  // an optional workflow for incremental adoption.
  insertPragma(text) {
    return `-# @format${text.startsWith("-#") ? "\n" : "\n\n"}${text}`;
  }
};

export default printer;
