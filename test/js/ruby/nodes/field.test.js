describe("field", () => {
  test("basic", () => {
    expect("foo.x = 1").toMatchFormat();
  });

  test("replaces :: with .", () => {
    expect("foo::x = 1").toChangeFormat("foo.x = 1");
  });

  test("with lonely operator", () => {
    expect("foo&.x = 1").toMatchFormat();
  });
});
