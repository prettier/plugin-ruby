describe("errors", () => {
  test("invalid ruby", () => expect("<>").toFailFormat());

  test("alias errors throws on parsing", () => {
    expect("alias $a $1").toFailFormat(
      "can't make alias for the number variables"
    );
  });

  test("assignment errors", () => {
    expect("self = 1").toFailFormat("Can't set variable");
  });

  test("class creation errors", () => {
    expect("class foo; end").toFailFormat("class/module name must be CONSTANT");
  });

  test("argument type errors", () => {
    expect("def foo($a); end").toFailFormat(
      "formal argument cannot be a global variable"
    );
  });
});
