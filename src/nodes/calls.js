const { concat, group, indent, softline } = require("../builders");
const { makeCall } = require("../utils");

const noIndent = [
  "array",
  "hash",
  "method_add_block",
  "xstring_literal"
];

module.exports = {
  call: (path, opts, print) => {
    const receiver = path.call(print, "body", 0);
    const operator = makeCall(path, opts, print);
    let name = path.getValue().body[2];

    // You can call lambdas with a special syntax that looks like func.(*args).
    // In this case, "call" is returned for the 3rd child node.
    if (name !== "call") {
      name = path.call(print, "body", 2);
    }

    // For certain left sides of the call nodes, we want to attach directly to
    // the } or end.
    if (noIndent.includes(path.getValue().body[0].type)) {
      return concat([receiver, operator, name]);
    }

    return group(concat([receiver, indent(concat([softline, operator, name]))]));
  }
};
