const prettier = require("prettier");

const format = content => () => prettier.format(content, {
  parser: "ruby", plugins: ["."]
});

test("alias errors throws on parsing", () => {
  expect(format("alias $a $1")).toThrow("Invalid ruby");
});

test("assignment errors", () => {
  expect(format("self = 1")).toThrow("Invalid ruby");
});

test("class creation errors", () => {
  expect(format("class foo; end")).toThrow("Invalid ruby");
});

test("argument type errors", () => {
  expect(format("def foo($a); end")).toThrow("Invalid ruby");
});
