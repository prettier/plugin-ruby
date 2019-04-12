const { long, ruby } = require("./utils");

describe("hash", () => {
  test("empty", () => (
    expect("{}").toMatchFormat()
  ));

  test("breaking", () => {
    const content = ruby(`
      {
        ${long}:
          ${long},
        ${long}: {
          ${long}:
            ${long}
        }
      }
    `);

    return expect(content).toMatchFormat();
  });

  test("breaking with trailing commas", () => {
    const expected = `{\n  ${long}:\n    ${long},\n}`;

    return expect(`{ ${long}: ${long} }`).toChangeFormat(expected, {
      addTrailingCommas: true
    });
  });

  test.skip("dynamic symbol hash key", () => (
    expect(`{ 'foo': 'bar' }`).toMatchFormat()
  ));

  describe("bare assoc hash", () => {
    test("commands", () => (
      expect("foobar alpha: alpha, beta: beta").toMatchFormat()
    ));

    test("command calls", () => (
      expect("foo.bar alpha: alpha, beta: beta").toMatchFormat()
    ));

    test("calls", () => (
      expect("foobar(alpha: alpha, beta: beta)").toMatchFormat()
    ));

    test("does not add trailing commas on breaking commands", () => (
      expect(`foobar ${long}: ${long}, a${long}: a${long}`).toChangeFormat(
        ruby(`
          foobar ${long}:
                   ${long},
                 a${long}:
                   a${long}
        `),
        { addTrailingCommas: true }
      )
    ));

    test("does not add trailing commas on breaking command calls", () => (
      expect(`foo.bar ${long}: ${long}, a${long}: a${long}`).toChangeFormat(
        ruby(`
          foo.bar ${long}:
                    ${long},
                  a${long}:
                    a${long}
        `),
        { addTrailingCommas: true }
      )
    ));

    test("does add trailing commas on breaking calls", () => (
      expect(`foobar(${long}: ${long}, a${long}: a${long})`).toChangeFormat(
        ruby(`
          foobar(
            ${long}:
              ${long},
            a${long}:
              a${long},
          )
        `),
        { addTrailingCommas: true }
      )
    ));
  });

  describe("when hash labels allowed", () => {
    test("hash labels stay", () => (
      expect("{ a: 'a', b: 'b', c: 'c' }").toMatchFormat()
    ));

    test("hash rockets get replaced", () => (
      expect("{ :a => 'a', :b => 'b', :c => 'c' }").toChangeFormat(
        "{ a: 'a', b: 'b', c: 'c' }"
      )
    ));

    test("hash rockets stay when needed", () => (
      expect("{ Foo => 1, Bar => 2 }").toMatchFormat()
    ));
  });

  describe("when hash labels disallowed", () => {
    test("hash labels get replaced", () => (
      expect("{ a: 'a', b: 'b', c: 'c' }").toChangeFormat(
        "{ :a => 'a', :b => 'b', :c => 'c' }",
        { preferHashLabels: false }
      )
    ));

    test("hash rockets stay", () => (
      expect("{ :a => 'a', :b => 'b', :c => 'c' }").toMatchFormat({
        preferHashLabels: false
      })
    ));

    test("hash rockets stay when needed", () => (
      expect("{ Foo => 1, Bar => 2 }").toMatchFormat({
        preferHashLabels: false
      })
    ));
  });
});
