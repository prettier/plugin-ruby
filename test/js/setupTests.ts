import prettier from "prettier";

import type { Code } from "./types";
import plugin from "../../src/plugin";

function normalize(code: Code) {
  const string = typeof code === "string" ? code : code.code;
  return string.replace(/\r?\n/g, "\n").trim();
}

function checkFormat(before: Code, after: Code) {
  const originalText = typeof before === "string" ? before : before.code;
  const formatted = prettier.format(originalText, {
    parser: typeof before === "string" ? "ruby" : before.parser,
    plugins: [plugin as any as string]
  });

  const expected = normalize(after);
  const received = normalize(formatted);

  return {
    pass: received === expected,
    message: () => `Expected:\n${expected}\nReceived:\n${received}`
  };
}

expect.extend({
  toChangeFormat(before: Code, after: Code) {
    return checkFormat(before, after);
  },
  toMatchFormat(before: Code) {
    return checkFormat(before, before);
  }
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toChangeFormat(after: Code): CustomMatcherResult;
      toMatchFormat(): CustomMatcherResult;
    }
  }
}
