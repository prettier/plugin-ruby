import prettier from "prettier";

import type { Plugin } from "../../src/types";
import type { Code } from "./types";
import plugin from "../../src/plugin";

type Config = Partial<Plugin.Options>;

function normalizeCode(code: Code) {
  return (typeof code === "string" ? code : code.code).trim();
}

function checkFormat(before: Code, after: Code, config: Config) {
  const originalText = (before as any).code || before;
  const formatted = prettier.format(originalText, {
    parser: (before as any).parser || "ruby",
    originalText,
    plugins: [plugin as any as string],
    ...config
  });

  return {
    pass: normalizeCode(formatted) === normalizeCode(after),
    message: () => `Expected:\n${after}\nReceived:\n${formatted}`
  };
}

expect.extend({
  toChangeFormat(before: Code, after: Code, config: Config = {}) {
    return checkFormat(before, (after as any).code || after, config);
  },
  toMatchFormat(before: Code, config: Config = {}) {
    return checkFormat(before, (before as any).code || before, config);
  }
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toChangeFormat(after: Code, config?: Config): CustomMatcherResult;
      toMatchFormat(config?: Config): CustomMatcherResult;
    }
  }
}
