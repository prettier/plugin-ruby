const {
  align,
  concat,
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline
} = require("../prettier");
const embed = require("./embed");

const docTypes = {
  basic: "Basic",
  frameset: "Frameset",
  mobile: "Mobile",
  rdfa: "RDFa",
  strict: "Strict",
  xml: "XML"
};

const docVersions = ["1.1", "5"];

// Prints out a hash key according to the configured prettier options.
function printHashKey(key, opts) {
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
function printHashValue(value, opts) {
  if (typeof value !== "string") {
    return value.toString();
  }

  // This is a very special syntax created by the parser to let us know that
  // this should be printed literally instead of as a string.
  if (value.startsWith("&")) {
    return value.slice(1);
  }

  const quote = opts.rubySingleQuote && !value.includes("#{") ? "'" : '"';
  return `${quote}${value}${quote}`;
}

// This will print an attributes object to a Doc node. It handles nesting on
// multiple levels and will print out according to whether or not the version of
// HAML being used supports multi-line attributes.
function printAttributes(object, opts, level = 0) {
  if (typeof object !== "object") {
    return printHashValue(object, opts);
  }

  const boundary = level === 0 ? softline : line;
  const parts = Object.keys(object).map((key) =>
    concat([
      printHashKey(key, opts),
      " ",
      printAttributes(object[key], opts, level + 1)
    ])
  );

  // If we have support for multi-line attributes laid out like a regular hash,
  // then we print them that way here.
  if (opts.supportsMultiline) {
    return group(
      concat([
        "{",
        indent(group(concat([boundary, join(concat([",", line]), parts)]))),
        boundary,
        "}"
      ])
    );
  }

  // Otherwise, if we only have one attribute, then just print it inline
  // regardless of how long it is.
  if (parts.length === 0) {
    return group(concat(["{", parts[0], "}"]));
  }

  // Otherwise, depending on how long the line is it will split the content into
  // multi-line attributes that old Haml understands.
  return group(
    concat([
      "{",
      parts[0],
      ",",
      align(
        opts.headerLength + 1,
        concat([line, join(concat([",", line]), parts.slice(1))])
      ),
      "}"
    ])
  );
}

// A utility function used in a silent script that is meant to determine if a
// child node is a continuation of a parent node (as in a when clause within a
// case statement or an else clause within an if).
function isContinuation(parentNode, childNode) {
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

// This is our printer's main print function that will switch on the type of
// node and print it out by returning a Doc tree.
function printNode(path, opts, print) {
  const node = path.getValue();
  const { value } = node;

  switch (node.type) {
    case "comment":
      return printComment();
    case "doctype":
      return printDoctype();
    case "filter":
      return printFilter();
    case "haml_comment":
      return printHamlComment();
    case "plain":
      return printPlain();
    case "root":
      return printRoot();
    case "script":
      return printScript();
    case "silent_script":
      return printSilentScript();
    case "tag":
      return printTag();
    default:
      throw new Error(`Unsupported node encountered: ${node.type}`);
  }

  // It's common to a couple of nodes to attach nested child nodes on the
  // children property. This utility prints them out grouped together with their
  // parent node docs.
  function printWithChildren(docs) {
    if (node.children.length === 0) {
      return docs;
    }

    return group(
      concat([
        docs,
        indent(concat([hardline, join(hardline, path.map(print, "children"))]))
      ])
    );
  }

  // https://haml.info/docs/yardoc/file.REFERENCE.html#html-comments-
  function printComment() {
    const parts = ["/"];

    if (value.revealed) {
      parts.push("!");
    }

    if (value.conditional) {
      parts.push(value.conditional);
    } else if (value.text) {
      parts.push(" ", value.text);
    }

    return printWithChildren(group(concat(parts)));
  }

  // https://haml.info/docs/yardoc/file.REFERENCE.html#doctype-
  function printDoctype() {
    const parts = ["!!!"];

    if (value.type in docTypes) {
      parts.push(docTypes[value.type]);
    } else if (docVersions.includes(value.version)) {
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
  function printFilter() {
    return group(
      concat([
        ":",
        value.name,
        indent(
          concat([hardline, join(hardline, value.text.trim().split("\n"))])
        )
      ])
    );
  }

  // https://haml.info/docs/yardoc/file.REFERENCE.html#haml-comments--
  function printHamlComment() {
    const parts = ["-#"];

    if (value.text) {
      if (opts.originalText.split("\n")[node.line - 1].trim() === "-#") {
        const lines = value.text.trim().split("\n");

        parts.push(indent(concat([hardline, join(hardline, lines)])));
      } else {
        parts.push(" ", value.text.trim());
      }
    }

    return concat(parts);
  }

  // https://haml.info/docs/yardoc/file.REFERENCE.html#plain-text
  function printPlain() {
    return value.text;
  }

  // The root node in the AST that we build in the parser.
  function printRoot() {
    return concat([join(hardline, path.map(print, "children")), hardline]);
  }

  // https://haml.info/docs/yardoc/file.REFERENCE.html#inserting_ruby
  function printScript() {
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

    return printWithChildren(group(concat(parts)));
  }

  // https://haml.info/docs/yardoc/file.REFERENCE.html#running-ruby--
  function printSilentScript() {
    const parts = [`- ${value.text.trim()}`];

    if (node.children.length > 0) {
      parts.push(
        concat(
          path.map((childPath) => {
            const child = childPath.getValue();
            const concated = concat([hardline, print(childPath)]);

            return isContinuation(node, child) ? concated : indent(concated);
          }, "children")
        )
      );
    }

    return group(concat(parts));
  }

  // https://haml.info/docs/yardoc/file.REFERENCE.html#element-name-
  function printTag() {
    const { attributes, dynamic_attributes } = value;
    const parts = [];

    // If we have a tag that isn't a div, then we need to print out that name of
    // that tag first. If it is a div, first we'll check if there are any other
    // things that would force us to print out the div explicitly, and otherwise
    // we'll leave it off.
    if (value.name !== "div") {
      parts.push(`%${value.name}`);
    }

    // If we have a class attribute, then we're going to print that here using
    // the special class syntax.
    if (attributes.class) {
      parts.push(`.${attributes.class.replace(/ /g, ".")}`);
    }

    // If we have an id attribute, then we're going to print that here using the
    // special id syntax.
    if (attributes.id) {
      parts.push(`#${attributes.id}`);
    }

    // If we're using dynamic attributes on this tag, then they come in as a
    // string that looks like the output of Hash#inspect from Ruby. So here
    // we're going to split it all up and print it out nicely.
    if (dynamic_attributes.new) {
      const pairs = dynamic_attributes.new
        .slice(1, -2)
        .split(",")
        .map((pair) => join("=", pair.slice(1).split('" => ')));

      parts.push(
        group(
          concat([
            "(",
            align(parts.join("").length + 1, fill(join(line, pairs).parts)),
            ")"
          ])
        )
      );
    }

    // If there are any static attributes that are not class or id (because we
    // already took care of those), then we're going to print them out here.
    const staticAttributes = Object.keys(attributes).filter(
      (name) => !["class", "id"].includes(name)
    );

    if (staticAttributes.length > 0) {
      const docs = staticAttributes.reduce((accum, key) => {
        const doc = `${printHashKey(key, opts)} ${printHashValue(
          attributes[key],
          opts
        )}`;

        return accum.length === 0 ? [doc] : accum.concat(",", line, doc);
      }, []);

      parts.push(
        group(concat(["{", align(parts.join("").length + 1, fill(docs)), "}"]))
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
        const attrOptions = {
          // This is kind of a total hack in that I don't think you're really
          // supposed to directly use `path.stack`, but it's the easiest way to
          // get the root node without having to know how many levels deep we
          // are.
          supportsMultiline: path.stack[0].supports_multiline,
          headerLength: parts.join("").length
        };

        parts.push(
          printAttributes(
            dynamic_attributes.old,
            Object.assign({}, opts, attrOptions)
          )
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
      const prefix = value.parse ? "= " : ifBreak("", " ");

      return printWithChildren(
        group(
          concat([
            group(concat(parts)),
            indent(concat([softline, prefix, value.value]))
          ])
        )
      );
    }

    // In case none of the other if statements have matched and we're printing
    // a div, we need to explicitly add it back into the array.
    if (parts.length === 0 && value.name === "div") {
      parts.push("%div");
    }

    return printWithChildren(group(concat(parts)));
  }
}

// This function handles adding the format pragma to a source string. This is an
// optional workflow for incremental adoption.
function insertPragma(text) {
  return `-# @format${text.startsWith("-#") ? "\n" : "\n\n"}${text}`;
}

module.exports = {
  embed,
  print: printNode,
  insertPragma
};
