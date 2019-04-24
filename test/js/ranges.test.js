describe("ranges", () => {
  test("two dot", () => expect("1..2").toMatchFormat());

  test("three dot", () => expect("3...4").toMatchFormat());
});
