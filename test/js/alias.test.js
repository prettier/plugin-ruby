const { long, ruby } = require("./utils");

describe("alias", () => {
  test("bare word aliases", () => expect("alias foo bar").toMatchFormat());

  test("symbol aliases become bare word aliases", () =>
    expect("alias :foo :bar").toChangeFormat("alias foo bar"));

  test("dynamic symbols do not get transformed (left)", () =>
    expect("alias :'foo' :bar").toChangeFormat("alias :'foo' bar"));

  test("dynamic symbols do not get transformed (right)", () =>
    expect("alias :foo :'bar'").toChangeFormat("alias foo :'bar'"));

  test("global aliases", () => expect("alias $foo $bar").toMatchFormat());

  test("handles long symbols", () => {
    const expected = ruby(`
      alias ${long}
            bar
    `);

    return expect(`alias ${long} bar`).toChangeFormat(expected);
  });

  test("handles comments on the right node", () =>
    expect("alias foo bar # baz").toMatchFormat());

  test("handles comments on the left node", () => {
    const content = ruby(`
      alias foo # baz
            bar
    `);

    return expect(content).toMatchFormat();
  });

  test("handles comments on both nodes", () => {
    const content = ruby(`
      alias foo # foo
            bar # bar
    `);

    return expect(content).toMatchFormat();
  });
});
