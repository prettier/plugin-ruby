import { format } from "prettier";
import plugin from "../../src/plugin.js";

function normalize(code) {
  const string = typeof code === "string" ? code : code.code;
  return string.replace(/\r?\n/g, "\n").trim();
}

function checkFormat(before, after) {
  const originalText = typeof before === "string" ? before : before.code;
  const formatted = format(originalText, {
    parser: typeof before === "string" ? "ruby" : before.parser,
    plugins: [plugin]
  });

  const expected = normalize(after);
  const received = normalize(formatted);

  return {
    pass: received === expected,
    message: () => `Expected:\n${expected}\nReceived:\n${received}`
  };
}

expect.extend({
  toChangeFormat(before, after) {
    return checkFormat(before, after);
  },
  toMatchFormat(before) {
    return checkFormat(before, before);
  }
});
