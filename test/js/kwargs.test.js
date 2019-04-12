describe("kwargs", () => {
  test("basic", () => (
    expect("def foo(bar: baz); end").toMatchFormat()
  ));

  test("optional", () => (
    expect("def foo(bar:); end").toMatchFormat()
  ));

  test("double splat", () => (
    expect("def foo(bar:, **baz); end").toMatchFormat()
  ));
});
