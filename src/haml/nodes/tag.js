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
} = require("../../prettier");

const getDynamicAttributes = (header, attributes) => {
  const pairs = attributes
    .slice(1, -2)
    .split(",")
    .map((pair) => pair.slice(1).split('" => '));
  const parts = [concat([pairs[0][0], "=", pairs[0][1]])];

  pairs.slice(1).forEach((pair) => {
    parts.push(line, concat([pair[0], "=", pair[1]]));
  });

  return group(concat(["(", align(header + 1, fill(parts)), ")"]));
};

const getHashValue = (value, opts) => {
  if (typeof value === "string") {
    const quote = opts.preferSingleQuotes ? "'" : '"';
    return `${quote}${value}${quote}`;
  }

  return value;
};

const getHashRocket = (key, value, opts) => {
  const quote = opts.preferSingleQuotes ? "'" : '"';
  const leftSide = key.includes(":") ? `:${quote}${key}${quote}` : `:${key}`;

  return `${leftSide} => ${getHashValue(value, opts)}`;
};

const getHashLabel = (key, value, opts) => {
  const quote = opts.preferSingleQuotes ? "'" : '"';
  const leftSide = key.includes(":") ? `${quote}${key}${quote}` : key;

  return `${leftSide}: ${getHashValue(value, opts)}`;
};

const getStaticAttributes = (header, attributes, opts) => {
  const keys = Object.keys(attributes).filter(
    (name) => !["class", "id"].includes(name)
  );

  const getKeyValuePair = opts.preferHashLabels ? getHashLabel : getHashRocket;
  const parts = [getKeyValuePair(keys[0], attributes[keys[0]], opts)];

  keys.slice(1).forEach((key) => {
    parts.push(",", line, getKeyValuePair(key, attributes[key], opts));
  });

  return group(concat(["{", align(header + 1, fill(parts)), "}"]));
};

const getHeader = (value, opts) => {
  const { attributes } = value;
  const parts = [];

  if (value.name !== "div") {
    parts.push(`%${value.name}`);
  }

  if (attributes.class) {
    parts.push(`.${attributes.class.replace(/ /g, ".")}`);
  }

  if (attributes.id) {
    parts.push(`#${attributes.id}`);
  }

  if (value.dynamic_attributes.new) {
    parts.push(
      getDynamicAttributes(parts.join("").length, value.dynamic_attributes.new)
    );
  }

  if (
    Object.keys(attributes).some((name) => name !== "class" && name !== "id")
  ) {
    parts.push(getStaticAttributes(parts.join("").length, attributes, opts));
  }

  if (value.dynamic_attributes.old) {
    if (parts.length === 0) {
      parts.push("%div");
    }
    parts.push(value.dynamic_attributes.old);
  }

  if (value.object_ref) {
    if (parts.length === 0) {
      parts.push("%div");
    }
    parts.push(value.object_ref);
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
    const prefix = value.parse ? "= " : ifBreak("", " ");

    return group(
      concat([
        group(concat(parts)),
        indent(concat([softline, prefix, value.value]))
      ])
    );
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
  const header = getHeader(value, opts);

  if (children.length === 0) {
    return header;
  }

  return group(
    concat([
      header,
      indent(concat([hardline, join(hardline, path.map(print, "children"))]))
    ])
  );
};

module.exports = tag;
