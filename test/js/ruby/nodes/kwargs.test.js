describe("kwargs", () => {
  test("basic", () => {
    return expect("def foo(bar: baz)\nend").toMatchFormat();
  });

  test("optional", () => {
    return expect("def foo(bar:)\nend").toMatchFormat();
  });

  test("double splat", () => {
    return expect("def foo(bar:, **baz)\nend").toMatchFormat();
  });
});
