const { long, ruby } = require("../../utils");

describe("lambda", () => {
  test("plain stabby lambda literal", () => expect("-> { 1 }").toMatchFormat());

  test("stabby lambda literal with args", () =>
    expect("->(a, b, c) { a + b + c }").toMatchFormat());

  test("stabby lambda literal with arg, no parens", () =>
    expect("-> a { a }").toChangeFormat("->(a) { a }"));

  test("stabby lambda with parens, no args", () =>
    expect("-> () { 1 }").toChangeFormat("-> { 1 }"));

  test("breaking stabby lambda literal", () =>
    expect(`-> { ${long} }`).toChangeFormat(`-> do\n  ${long}\nend`));

  test("breaking stabby lambda literal with args", () => {
    const content = `->(a) { a + ${long} }`;
    const expected = `->(a) do\n  a +\n    ${long}\nend`;

    return expect(content).toChangeFormat(expected);
  });

  test("stabby lambda literal within a command node", () =>
    expect("command :foo, ->(arg) { arg + arg }").toMatchFormat());

  test("stabby lambda literal that breaks within a command node", () =>
    expect(`command :foo, -> { ${long} }`).toChangeFormat(
      ruby(`
      command :foo,
              -> {
                ${long}
              }
    `)
    ));

  test("stabby lambda literal with a command call node", () =>
    expect("command.call :foo, ->(arg) { arg + arg }").toMatchFormat());

  test("stabby lambda literal that breaks with a command call node", () =>
    expect(`command.call :foo, -> { ${long} }`).toChangeFormat(
      ruby(`
      command.call :foo,
                   -> {
                     ${long}
                   }
    `)
    ));

  test("stabby lambda literal that breaks deeply within a command node", () =>
    expect(`command :foo, bar: -> { ${long} }`).toChangeFormat(
      ruby(`
      command :foo,
              bar: -> {
                ${long}
              }
    `)
    ));

  test("very long arguments list doesn't break within pipes", () => {
    const content = `command :foo, ->(${long}, a${long}, aa${long}) { true }`;

    return expect(content).toChangeFormat(
      ruby(`
      command :foo,
              ->(
                ${long},
                a${long},
                aa${long}
              ) {
                true
              }
    `)
    );
  });

  test("empty brackets", () => expect("a[]").toMatchFormat());

  test("brackets with multiple args", () =>
    expect("a[1, 2, 3]").toMatchFormat());
});
