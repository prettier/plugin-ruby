import { long, ruby } from "../../utils";

describe("return", () => {
  test("bare", () => {
    expect("return").toMatchFormat();
  });

  test("one arg, no parens", () => {
    expect("return 1").toMatchFormat();
  });

  test("one arg, with parens", () => {
    expect("return(1)").toChangeFormat("return 1");
  });

  test("multiple args", () => {
    expect("return 1, 2").toMatchFormat();
  });

  test("return method call", () => {
    expect("return foo :bar").toMatchFormat();
  });

  test("return with breaking", () => {
    expect(`return ${long}`).toChangeFormat(`return(\n  ${long}\n)`);
  });

  test("returning an array", () => {
    expect("return [1, 2, 3]").toChangeFormat("return 1, 2, 3");
  });

  test("returning an empty array", () => {
    expect("return []").toMatchFormat();
  });

  test("returning a single element array", () => {
    expect("return [1]").toMatchFormat();
  });

  test("returning a list that breaks", () => {
    expect(`return ${long}, ${long}`).toChangeFormat(
      `return [\n  ${long},\n  ${long}\n]`
    );
  });

  test("returning an array within parens", () => {
    expect("return([1, 2, 3])").toChangeFormat("return 1, 2, 3");
  });

  test("returning a long special array", () => {
    expect(`return %w[${long}]`).toChangeFormat(
      `return(\n  %w[\n    ${long}\n  ]\n)`
    );
  });

  test("returning two arguments, one that breaks", () => {
    expect(`return foo, ${long}`).toChangeFormat(
      `return [\n  foo,\n  ${long}\n]`
    );
  });

  test("returning two arguments, the first with parentheses", () => {
    expect("return (1), 2").toMatchFormat();
  });

  test("returning with the or keyword", () => {
    expect("return(a or b)").toMatchFormat();
  });

  test("returning with the not keyword", () => {
    expect("return(not a)").toMatchFormat();
  });

  test("comment inside of return parentheses", () => {
    const content = ruby(`
      return(
        # foo
        bar
      )
    `);

    expect(content).toMatchFormat();
  });

  test("returning multiple statements", () => {
    const content = ruby(`
      return(
        foo
        bar
      )
    `);

    expect(content).toMatchFormat();
  });
});
