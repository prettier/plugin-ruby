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

// http://haml.info/docs/yardoc/file.REFERENCE.html#doctype-
const doctype = (path, _opts, _print) => {
  const { value } = path.getValue();
  const parts = ["!!!"];

  if (value.type in types) {
    parts.push(types[value.type]);
  } else if (value.version in versions) {
    parts.push(versions[value.version]);
  }

  if (value.encoding) {
    parts.push(value.encoding);
  }

  return join(" ", parts);
};

module.exports = doctype;
