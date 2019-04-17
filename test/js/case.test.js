const { long, ruby } = require("./utils");

describe("case", () => {
  test("empty case", () => (
    expect("case\nwhen a\n  1\nend").toMatchFormat()
  ));

  test("single when", () => (
    expect("case a\nwhen b\n  1\nend").toMatchFormat()
  ));

  test("multiple predicates, one when", () => (
    expect("case a\nwhen b, c\n  1\nend").toMatchFormat()
  ));

  test("breaking with multiple predicates, one when", () => {
    const content = ruby(`
      case foo
      when '${long}',
           'a${long}',
           'b${long}'
        bar
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("multiple consecutive whens", () => (
    expect("case a\nwhen b\nwhen c\n  1\nend").toMatchFormat()
  ));

  test("basic multiple branches", () => (
    expect("case a\nwhen b\n  1\nwhen c\n  2\nend").toMatchFormat()
  ));

  test("else clauses", () => (
    expect("case a\nwhen b\n  1\nelse\n  2\nend").toMatchFormat()
  ));
});
