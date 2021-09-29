import prettier from "prettier";

import type { Plugin } from "../../src/types";
import type { Code } from "./types";
import plugin from "../../src/plugin";

type Config = Partial<Plugin.Options>;

function normalizeCode(code: Code) {
  return (typeof code === "string" ? code : code.code).replace(/\r\n/g, "\n");
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
    pass: normalizeCode(formatted) === `${normalizeCode(after)}\n`,
    message: () => `Expected:\n${after}\nReceived:\n${formatted}`
  };
}

expect.extend({
  toChangeFormat(
    before: Code,
    after: Code,
    config: Partial<Plugin.Options> = {}
  ) {
    return checkFormat(before, (after as any).code || after, config);
  },
  toMatchFormat(before: Code, config: Partial<Plugin.Options> = {}) {
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
