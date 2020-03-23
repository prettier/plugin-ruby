const { concat, group, join, line } = require("../prettier");
const { literal } = require("../utils");

const printGenericRestParam = (symbol) => (path, opts, print) =>
  path.getValue().body[0]
    ? concat([symbol, path.call(print, "body", 0)])
    : symbol;

const printParams = (path, opts, print) => {
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

  // You can put an extra comma at the end of block args between pipes to
  // change what it does. Below is the difference:
  //
  // [[1, 2], [3, 4]].each { |x| p x } # prints [1, 2] then [3, 4]
  // [[1, 2], [3, 4]].each { |x,| p x } # prints 1 then 3
  //
  // In ruby 2.5, the excessed comma is indicated by having a 0 in the rest
  // param position. In ruby 2.6+ it's indicated by having an "excessed_comma"
  // node in the rest position. Seems odd, but it's true.
  const comma = rest === 0 || (rest && rest.type === "excessed_comma");

  return group(concat([join(concat([",", line]), parts), comma ? "," : ""]));
};

const paramError = () => {
  throw new Error("formal argument cannot be a global variable");
};

module.exports = {
  args_forward: literal("..."),
  kwrest_param: printGenericRestParam("**"),
  rest_param: printGenericRestParam("*"),
  params: printParams,
  param_error: paramError
};
