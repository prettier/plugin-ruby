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

const { concat, group, hardline, indent, join, markAsRoot } = require("./prettier");

const getTagHeader = value => {
  let header = "";

  if (value.name !== "div") {
    header = `%${value.name}`;
  }

  if (value.attributes.class) {
    header = `${header}.${value.attributes.class}`;
  }

  if (value.value) {
    header = `${header}= ${value.value}`;
  }

  return header;
};

const nodes = {
  root: (path, opts, print) => markAsRoot(
    concat([join(hardline, path.map(print, "children")), hardline])
  ),
  script: (path, opts, print) => `=${path.getValue().value.text}`,
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
