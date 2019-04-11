describe("alias", () => {
  test("bare word aliases", () => (
    expect("alias foo bar").toMatchFormat()
  ));

  test("symbol aliases become bare word aliases", () => (
    expect("alias :foo :bar").toChangeFormat("alias foo bar")
  ));

  test("global aliases", () => (
    expect("alias $foo $bar").toMatchFormat()
  ));
});
