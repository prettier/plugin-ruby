describe("numbers", () => {
  test("basic", () => (
    expect("123").toMatchFormat()
  ));

  test("preserves sign", () => (
    expect("-123").toMatchFormat()
  ));

  test("auto adds o for octal numbers", () => (
    expect("0123").toChangeFormat("0o123")
  ));
});
