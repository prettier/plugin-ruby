const { align, concat, fill, group, hardline, indent, join, line } = require("../../prettier");

const getKeyValuePair = (key, value) => `"${key}" => "${value}"`;

const getAttributes = (header, attributes) => {
  const keys = Object.keys(attributes).filter(name => (
    !["class", "id"].includes(name)
  ));

  const parts = [
    getKeyValuePair(keys[0], attributes[keys[0]])
  ];

  keys.slice(1).forEach(key => {
    parts.push(",", line, getKeyValuePair(key, attributes[key]));
  });

  return group(concat(["{", align(header, fill(parts)), "}"]));
};

const getHeader = value => {
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
    parts.push(getAttributes(parts.join("").length + 1, attributes));
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

// http://haml.info/docs/yardoc/file.REFERENCE.html#element-name-
const tag = (path, opts, print) => {
  const { children, value } = path.getValue();
  const header = getHeader(value);

  if (children.length === 0) {
    return header;
  }

  return group(concat([
    header,
    indent(concat([
      hardline,
      join(hardline, path.map(print, "children"))
    ]))
  ]));
};

module.exports = tag;
