import type { Plugin, Ruby } from "../types";

type Callable = Ruby.Call | Ruby.CommandCall | Ruby.Field;

const makeCall: Plugin.Printer<Callable> = (path, opts, print) => {
  const node = path.getValue();
  const operator = node.type === "command_call" ? node.operator : node.body[1];

  // Ignoring the next block for coverage information because it's only relevant
  // in Ruby 2.5 and below.
  /* istanbul ignore next */
  if ([".", "&."].includes(operator as any)) {
    return operator as Plugin.Doc;
  }

  if (operator === "::") {
    return ".";
  } else if (node.type === "command_call") {
    return path.call(print, "operator");
  } else {
    const nodePath = path as Plugin.Path<typeof node>;
    return nodePath.call(print, "body", 1);
  }
};

export default makeCall;
