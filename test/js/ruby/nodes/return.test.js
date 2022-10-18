import { long, ruby } from "../../utils.js";

describe("return", () => {
  test("bare", () => {
    return expect("return").toMatchFormat();
  });

  test("one arg, no parens", () => {
    return expect("return 1").toMatchFormat();
  });

  test("one arg, with parens", () => {
    return expect("return(1)").toChangeFormat("return 1");
  });

  test("multiple args", () => {
    return expect("return 1, 2").toMatchFormat();
  });

  test("return method call", () => {
    return expect("return foo :bar").toMatchFormat();
  });

  test("return with breaking", () => {
    return expect(`return ${long}`).toChangeFormat(`return(\n  ${long}\n)`);
  });

  test("returning an array", () => {
    return expect("return [1, 2, 3]").toChangeFormat("return 1, 2, 3");
  });

  test("returning an empty array", () => {
    return expect("return []").toMatchFormat();
  });

  test("returning a single element array", () => {
    return expect("return [1]").toMatchFormat();
  });

  test("returning a list that breaks", () => {
    return expect(`return ${long}, ${long}`).toChangeFormat(
      `return [\n  ${long},\n  ${long}\n]`
    );
  });

  test("returning an array within parens", () => {
    return expect("return([1, 2, 3])").toChangeFormat("return 1, 2, 3");
  });

  test("returning a long special array", () => {
    return expect(`return %w[${long}]`).toChangeFormat(
      `return(\n  %w[\n    ${long}\n  ]\n)`
    );
  });

  test("returning two arguments, one that breaks", () => {
    return expect(`return foo, ${long}`).toChangeFormat(
      `return [\n  foo,\n  ${long}\n]`
    );
  });

  test("returning two arguments, the first with parentheses", () => {
    return expect("return (1), 2").toMatchFormat();
  });

  test("returning with the or keyword", () => {
    return expect("return(a or b)").toMatchFormat();
  });

  test("returning with the not keyword", () => {
    return expect("return(not a)").toMatchFormat();
  });

  test("comment inside of return parentheses", () => {
    const content = ruby(`
      return(
        # foo
        bar
      )
    `);

    return expect(content).toMatchFormat();
  });

  test("returning multiple statements", () => {
    const content = ruby(`
      return(
        foo
        bar
      )
    `);

    return expect(content).toMatchFormat();
  });

  test("returning a value with a modifier if", () => {
    const content = ruby(`
      return :inactive if given_date.before?(first_event_date)
    `);

    return expect(content).toMatchFormat();
  });
});
