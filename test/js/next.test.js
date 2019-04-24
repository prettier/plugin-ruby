describe("next", () => {
  test("bare", () => expect("next").toMatchFormat());

  test("one arg, no parens", () => expect("next 1").toMatchFormat());

  test("one arg, with parens", () =>
    expect("next(1)").toChangeFormat("next 1"));

  test("multiple args", () => expect("next 1, 2").toMatchFormat());
});
