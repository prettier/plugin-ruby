import prettier from "prettier";

import type { Plugin } from "../../src/types";
import type { Code } from "./types";
import plugin from "../../src/plugin";

function checkFormat(
  before: Code,
  after: Code,
  config: Partial<Plugin.Options>
) {
  const parser = (before as any).parser || "ruby";
  const originalText = (before as any).code || before;

  const opts = Object.assign(
    { parser, plugins: [plugin], originalText },
    config
  );

  return new Promise((resolve) => resolve(prettier.format(originalText, opts)))
    .then((formatted) => ({
      pass: (formatted as string).replace(/\r\n/g, "\n") === `${after}\n`,
      message: () => `Expected:\n${after}\nReceived:\n${formatted}`
    }))
    .catch((error) => ({
      pass: false,
      message: () => error.message
    }));
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
      toChangeFormat(
        after: Code,
        config?: Partial<Plugin.Options>
      ): Promise<CustomMatcherResult>;
      toMatchFormat(
        config?: Partial<Plugin.Options>
      ): Promise<CustomMatcherResult>;
    }
  }
}
