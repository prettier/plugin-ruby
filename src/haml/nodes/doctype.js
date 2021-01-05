const { join } = require("../../prettier");

const types = {
  basic: "Basic",
  frameset: "Frameset",
  mobile: "Mobile",
  rdfa: "RDFa",
  strict: "Strict",
  xml: "XML"
};

const versions = ["1.1", "5"];

// https://haml.info/docs/yardoc/file.REFERENCE.html#doctype-
function doctype(path, _opts, _print) {
  const { value } = path.getValue();
  const parts = ["!!!"];

  if (value.type in types) {
    parts.push(types[value.type]);
  } else if (versions.includes(value.version)) {
    parts.push(value.version);
  } else {
    parts.push(value.type);
  }

  if (value.encoding) {
    parts.push(value.encoding);
  }

  return join(" ", parts);
}

module.exports = doctype;
