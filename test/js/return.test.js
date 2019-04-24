describe("return", () => {
  test("bare", () => expect("return").toMatchFormat());

  test("one arg, no parens", () => expect("return 1").toMatchFormat());

  test("one arg, with parens", () =>
    expect("return(1)").toChangeFormat("return 1"));

  test("multiple args", () => expect("return 1, 2").toMatchFormat());

  test("return method call", () => expect("return foo :bar").toMatchFormat());
});
