describe("super", () => {
  test("bare", () => (
    expect("super").toMatchFormat()
  ));

  test("empty parens", () => (
    expect("super()").toMatchFormat()
  ));

  test("one arg, no parens", () => (
    expect("super 1").toMatchFormat()
  ));

  test("one arg, with parens", () => (
    expect("super(1)").toMatchFormat()
  ));

  test("multiple args, no parens", () => (
    expect("super 1, 2").toMatchFormat()
  ));

  test("multiple args, with parens", () => (
    expect("super(1, 2)").toMatchFormat()
  ));
});
