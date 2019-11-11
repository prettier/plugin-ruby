const { spawnSync } = require("child_process");
const path = require("path");

const parse = (text, _parsers, _opts) => {
  const child = spawnSync("ruby", [path.join(__dirname, "./haml.rb")], {
    input: text
  });

  const error = child.stderr.toString();
  if (error) {
    throw new Error(error);
  }

  const response = child.stdout.toString();
  return JSON.parse(response);
};

const { align, concat, fill, group, hardline, indent, join, line, markAsRoot } = require("./prettier");

const getAttributesKeyPair = (key, value) => `"${key}" => "${value}"`;

const getAttributesHash = (header, attributes) => {
  const keys = Object.keys(attributes).filter(name => !["class", "id"].includes(name));
  const parts = [getAttributesKeyPair(keys[0], attributes[keys[0]])];

  keys.slice(1).forEach((key, index) => {
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

  if (value.value) {
    const prefix = value.parse ? "=" : "";
    parts.push(`${prefix} ${value.value}`);
  } else if (value.dynamic_attributes.old) {
    parts.push(value.dynamic_attributes.old);
  }

  return group(concat(parts));
};

const nodes = {
  root: (path, opts, print) => markAsRoot(
    concat([join(hardline, path.map(print, "children")), hardline])
  ),
  script: (path, opts, print) => `=${path.getValue().value.text}`,
  silent_script: (path, opts, print) => `-${path.getValue().value.text}`,
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

const print = (path, opts, print) => {
  const { type } = path.getValue();

  if (!(type in nodes)) {
    throw new Error(`Unsupported node encountered: ${type}`);
  }

  return nodes[type](path, opts, print);
};

module.exports = {
  parse,
  print
};
