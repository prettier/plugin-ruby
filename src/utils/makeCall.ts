import type { Plugin, Ruby } from "../types";

type Callable = {
  body: [any, Ruby.CallOperator, ...any[]];
};

const makeCall: Plugin.Printer<Callable> = (path, opts, print) => {
  const operation = path.getValue().body[1];

  // Ignoring the next block for coverage information because it's only relevant
  // in Ruby 2.5 and below.
  /* istanbul ignore next */
  if ([".", "&."].includes(operation as any)) {
    return operation as Plugin.Doc;
  }

  return operation === "::" ? "." : path.call(print, "body", 1);
};

export default makeCall;
