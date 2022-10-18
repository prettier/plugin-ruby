import { format } from "prettier";

describe("errors", () => {
  const cases = [
    "alias $a $1",
    "self = 1",
    "$` = 1",
    "class foo; end",
    "def foo(A) end",
    "def foo($a) end",
    "def foo(@a) end",
    "def foo(@@a) end",
    "<>"
  ];

  test.each(cases)("fails for %s", async (content) => {
    try {
      await format(content, { parser: "ruby", plugins: ["."] });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.loc).toBeDefined();
    }
  });
});
