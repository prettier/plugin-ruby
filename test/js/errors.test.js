describe("errors", () => {
  test("alias errors throws on parsing", () => {
    expect("alias $a $1").toFailFormat();
  });

  test("assignment errors", () => {
    expect("self = 1").toFailFormat();
  });

  test("class creation errors", () => {
    expect("class foo; end").toFailFormat();
  });

  test("argument type errors", () => {
    expect("def foo($a); end").toFailFormat();
  });
});
