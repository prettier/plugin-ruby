const prettier = require("prettier");
const { print } = require("../../../src/ruby/printer").default;

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

  test.each(cases)("fails for %s", (content) => {
    const format = () =>
      prettier.format(content, { parser: "ruby", plugins: ["."] });

    expect(format).toThrow();
  });

  test("when encountering an unsupported node type", () => {
    const path = { getValue: () => ({ type: "unsupported", body: {} }) };

    expect(() => print(path)).toThrow("Unsupported");
  });
});
