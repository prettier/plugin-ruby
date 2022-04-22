describe("kwargs", () => {
  test("basic", () => {
    expect("def foo(bar: baz)\nend").toMatchFormat();
  });

  test("optional", () => {
    expect("def foo(bar:)\nend").toMatchFormat();
  });

  test("double splat", () => {
    expect("def foo(bar:, **baz)\nend").toMatchFormat();
  });
});
