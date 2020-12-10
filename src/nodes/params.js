const { concat, group, join, indent, line, softline } = require("../prettier");
const { literal } = require("../utils");

function printRestParam(symbol) {
  return function printRestParamWithSymbol(path, opts, print) {
    return path.getValue().body[0]
      ? concat([symbol, path.call(print, "body", 0)])
      : symbol;
  };
}

function printParams(path, opts, print) {
  const [
    reqs,
    optls,
    rest,
    post,
    kwargs,
    kwargRest,
    block
  ] = path.getValue().body;
  let parts = [];

  if (reqs) {
    parts = parts.concat(path.map(print, "body", 0));
  }

  if (optls) {
    parts = parts.concat(
      optls.map((_, index) =>
        concat([
          path.call(print, "body", 1, index, 0),
          " = ",
          path.call(print, "body", 1, index, 1)
        ])
      )
    );
  }

  if (rest && rest.type !== "excessed_comma") {
    parts.push(path.call(print, "body", 2));
  }

  if (post) {
    parts = parts.concat(path.map(print, "body", 3));
  }

  if (kwargs) {
    parts = parts.concat(
      kwargs.map(([, value], index) => {
        if (!value) {
          return path.call(print, "body", 4, index, 0);
        }
        return group(join(" ", path.map(print, "body", 4, index)));
      })
    );
  }

  if (kwargRest) {
    parts.push(kwargRest === "nil" ? "**nil" : path.call(print, "body", 5));
  }

  if (block) {
    parts.push(path.call(print, "body", 6));
  }

  const contents = [join(concat([",", line]), parts)];

  // You can put an extra comma at the end of block args between pipes to
  // change what it does. Below is the difference:
  //
  // [[1, 2], [3, 4]].each { |x| p x } # prints [1, 2] then [3, 4]
  // [[1, 2], [3, 4]].each { |x,| p x } # prints 1 then 3
  //
  // In ruby 2.5, the excessed comma is indicated by having a 0 in the rest
  // param position. In ruby 2.6+ it's indicated by having an "excessed_comma"
  // node in the rest position. Seems odd, but it's true.
  if (rest === 0 || (rest && rest.type === "excessed_comma")) {
    contents.push(",");
  }

  // If the parent node is a paren then we skipped printing the parentheses so
  // that we could handle them here and get nicer formatting.
  if (["lambda", "paren"].includes(path.getParentNode().type)) {
    return group(
      concat(["(", indent(concat([softline].concat(contents))), softline, ")"])
    );
  }

  return group(concat(contents));
}

module.exports = {
  args_forward: literal("..."),
  kwrest_param: printRestParam("**"),
  rest_param: printRestParam("*"),
  params: printParams
};
