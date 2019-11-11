const { align, concat, fill, group, hardline, indent, join, line, markAsRoot } = require("../prettier");

const getAttributesKeyPair = (key, value) => `"${key}" => "${value}"`;

const getAttributesHash = (header, attributes) => {
  const keys = Object.keys(attributes).filter(name => !["class", "id"].includes(name));
  const parts = [getAttributesKeyPair(keys[0], attributes[keys[0]])];

  keys.slice(1).forEach(key => {
    parts.push(",", line, getAttributesKeyPair(key, attributes[key]));
  });

  return group(concat(["{", align(header, fill(parts)), "}"]));
};

const getTagHeader = value => {
  const { attributes } = value;
  const parts = [];

  if (value.name !== "div") {
    parts.push(`%${value.name}`);
  }

  if (attributes.class) {
    parts.push(`.${attributes.class.replace(" ", ".")}`);
  }

  if (attributes.id) {
    parts.push(`#${attributes.id}`);
  }

  if (Object.keys(attributes).some(name => name !== "class" && name !== "id")) {
    parts.push(getAttributesHash(parts.join("").length + 1, attributes));
  }

  if (value.nuke_outer_whitespace) {
    parts.push(">");
  }

  if (value.nuke_inner_whitespace) {
    parts.push("<");
  }

  if (value.self_closing) {
    parts.push("/");
  }

  if (value.value) {
    const prefix = value.parse ? "=" : "";
    parts.push(`${prefix} ${value.value}`);
  } else if (value.dynamic_attributes.old) {
    parts.push(value.dynamic_attributes.old);
  } else if (value.object_ref) {
    if (parts.length === 0) {
      parts.push("%div");
    }
    parts.push(value.object_ref);
  }

  // In case none of the other if statements have matched and we're printing a
  // div, we need to explicitly add it back into the array.
  if (parts.length === 0 && value.name === "div") {
    parts.push("%div");
  }

  return group(concat(parts));
};

const doctypes = {
  "1.1": "1.1",
  "5": "5",
  basic: "Basic",
  frameset: "Frameset",
  mobile: "Mobile",
  rdfa: "RDFa",
  strict: "Strict",
  xml: "XML"
};

const nodes = {
  comment: (path, opts, print) => {
    const { children, value } = path.getValue();
    const parts = ["/"];

    if (value.revealed) {
      parts.push("!");
    }

    if (value.conditional) {
      parts.push(value.conditional);
    } else if (value.text) {
      parts.push(" ", value.text);
    }

    if (children.length > 0) {
      parts.push(indent(concat([
        hardline,
        join(hardline, path.map(print, "children"))
      ])));
    }

    return group(concat(parts));
  },
  doctype: (path, _opts, _print) => {
    const { value } = path.getValue();
    const parts = ["!!!"];

    if (value.type in doctypes) {
      parts.push(doctypes[value.type]);
    } else if (value.version in doctypes) {
      parts.push(doctypes[value.version]);
    }

    if (value.encoding) {
      parts.push(value.encoding);
    }

    return join(" ", parts);
  },
  filter: (path, _opts, _print) => {
    const { value } = path.getValue();

    return group(concat([
      ":",
      value.name,
      indent(concat([
        hardline,
        join(hardline, value.text.trim().split("\n"))
      ]))
    ]));
  },
  haml_comment: (path, opts, _print) => {
    const node = path.getValue();
    const parts = ["-#"];

    if (node.value.text) {
      if (opts.originalText.split("\n")[node.line - 1].trim() === "-#") {
        const lines = node.value.text.trim().replace("\n", "\n  ");

        parts.push(indent(concat([hardline, lines])));
      } else {
        parts.push(" ", node.value.text.trim());
      }
    }

    return concat(parts);
  },
  plain: (path, _opts, _print) => path.getValue().value.text,
  root: (path, opts, print) => markAsRoot(concat([
    join(hardline, path.map(print, "children")), hardline
  ])),
  script: (path, opts, print) => {
    const { children, value } = path.getValue();
    const parts = [];

    if (value.escape_html) {
      parts.unshift("&");
    }

    if (!value.interpolate) {
      parts.push("=");
    }

    parts.push(" ", value.text.trim());

    if (children.length > 0) {
      parts.push(indent(concat([
        hardline,
        join(hardline, path.map(print, "children"))
      ])));
    }

    return group(concat(parts));
  },
  silent_script: (path, opts, print) => {
    const { children, value } = path.getValue();
    const parts = [`- ${value.text.trim()}`];

    if (children.length > 0) {
      const scripts = path.map(print, "children");

      if (value.keyword === "case") {
        parts.push(join("", scripts.map((script, index) => {
          const concated = concat([hardline, script]);

          return index % 2 === 0 ? concated : indent(concated);
        })));
      } else {
        parts.push(indent(concat([hardline, join(hardline, scripts)])));
      }
    }

    return group(concat(parts));
  },
  tag: (path, opts, print) => {
    const { children, value } = path.getValue();
    const tagHeader = getTagHeader(value);

    if (children.length === 0) {
      return tagHeader;
    }

    return group(concat([
      tagHeader,
      indent(concat([
        hardline,
        join(hardline, path.map(print, "children"))
      ]))
    ]));
  }
};

const print = (path, opts, _print) => {
  const { type } = path.getValue();

  if (!(type in nodes)) {
    throw new Error(`Unsupported node encountered: ${type}`);
  }

  return nodes[type](path, opts, print);
};

module.exports = print;
