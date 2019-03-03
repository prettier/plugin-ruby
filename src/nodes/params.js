const { concat, group, join, line } = require("prettier").doc.builders;

const printGenericRestParam = symbol => (path, opts, print) => (
  path.getValue().body[0] ? concat([symbol, path.call(print, "body", 0)]) : symbol
);

const printParams = (path, opts, print) => {
  const [reqs, optls, rest, post, kwargs, kwargRest, block] = path.getValue().body;
  let parts = [];

  if (reqs) {
    parts = parts.concat(path.map(print, "body", 0));
  }

  if (optls) {
    parts = parts.concat(optls.map((_, index) => concat([
      path.call(print, "body", 1, index, 0),
      " = ",
      path.call(print, "body", 1, index, 1)
    ])));
  }

  if (rest) {
    parts.push(path.call(print, "body", 2));
  }

  if (post) {
    parts = parts.concat(path.map(print, "body", 3));
  }

  if (kwargs) {
    parts = parts.concat(kwargs.map(([, value], index) => {
      if (!value) {
        return path.call(print, "body", 4, index, 0);
      }
      return group(join(" ", path.map(print, "body", 4, index)));
    }));
  }

  if (kwargRest) {
    parts.push(path.call(print, "body", 5));
  }

  if (block) {
    parts.push(path.call(print, "body", 6));
  }

  return group(join(concat([",", line]), parts));
};

const paramError = () => {
  throw new Error("formal argument cannot be a global variable");
};

module.exports = {
  kwrest_param: printGenericRestParam("**"),
  rest_param: printGenericRestParam("*"),
  params: printParams,
  param_error: paramError
};
