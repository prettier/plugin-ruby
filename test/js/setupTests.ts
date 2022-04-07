import prettier from "prettier";
import type * as Prettier from "prettier";

import type { Code } from "./types";
import plugin from "../../src/plugin";

type Config = Partial<Prettier.ParserOptions<any> & {
  printer: Omit<Prettier.Printer, "printComment"> & { printComment: () => any },
  rubyArrayLiteral: boolean,
  rubyHashLabel: boolean,
  rubyModifier: boolean,
  rubySingleQuote: boolean,
  rubyToProc: boolean
}>;

function normalize(code: Code) {
  const string = typeof code === "string" ? code : code.code;
  return string.replace(/\r?\n/g, "\n").trim();
}

function checkFormat(before: Code, after: Code, config: Config) {
  const originalText = typeof before === "string" ? before : before.code;
  const formatted = prettier.format(originalText, {
    parser: typeof before === "string" ? "ruby" : before.parser,
    originalText,
    plugins: [plugin as any as string],
    ...config
  });

  const expected = normalize(after);
  const received = normalize(formatted);

  return {
    pass: received === expected,
    message: () => `Expected:\n${expected}\nReceived:\n${received}`
  };
}

expect.extend({
  toChangeFormat(before: Code, after: Code, config: Config = {}) {
    return checkFormat(before, after, config);
  },
  toMatchFormat(before: Code, config: Config = {}) {
    return checkFormat(before, before, config);
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
