import type { Plugin, Ruby } from "../types";

type Callable = Ruby.Call | Ruby.CommandCall | Ruby.Field;

const makeCall: Plugin.Printer<Callable> = (path, opts, print) => {
  const node = path.getValue();
  const operator = node.op;

  // Ignoring the next block for coverage information because it's only relevant
  // in Ruby 2.5 and below.
  /* istanbul ignore next */
  if ([".", "&."].includes(operator as any)) {
    return operator as Plugin.Doc;
  }

  return operator === "::" ? "." : path.call(print, "op");
};

export default makeCall;
