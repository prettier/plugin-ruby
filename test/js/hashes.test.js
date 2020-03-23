const { long, ruby } = require("./utils");

describe("hash", () => {
  test("empty", () => expect("{}").toMatchFormat());

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

  test("breaking maintains calls on the end", () =>
    expect(`{ a: ${long} }.freeze`).toChangeFormat(
      `{\n  a:\n    ${long}\n}.freeze`
    ));

  test("breaking with trailing commas", () => {
    const expected = `{\n  ${long}:\n    ${long},\n}`;

    return expect(`{ ${long}: ${long} }`).toChangeFormat(expected, {
      addTrailingCommas: true
    });
  });

  describe.each(["<<-HERE", "<<~HERE"])("%s heredocs as values", (start) => {
    test("as the first value", () => {
      const content = ruby(`
        {
          foo: ${start},
            this is the heredoc
          HERE
          bar: 'bar'
        }
      `);

      return expect(content).toMatchFormat();
    });

    test("as the last value", () => {
      const content = ruby(`
        {
          foo: 'foo',
          bar: ${start}
            this is the heredoc
          HERE
        }
      `);

      return expect(content).toMatchFormat();
    });

    test("with trailing commas", () => {
      const content = ruby(`
        {
          foo: ${start},
            this is the heredoc
          HERE
        }
      `);

      return expect(content).toMatchFormat({ addTrailingCommas: true });
    });
  });

  describe("dynamic string keys", () => {
    test("basic", () => expect(`{ 'foo': 'bar' }`).toMatchFormat());

    test("with interpolation", () =>
      expect(`{ "#{1 + 1}": 2 }`).toMatchFormat());

    test("basic without hash labels", () =>
      expect(`{ :'foo' => 'bar' }`).toMatchFormat({ preferHashLabels: false }));

    test("with interpolation without hash labels", () =>
      expect(`{ :"#{1 + 1}" => 2 }`).toMatchFormat({
        preferHashLabels: false
      }));
  });

  describe("bare assoc hash", () => {
    test("commands", () =>
      expect("foobar alpha: alpha, beta: beta").toMatchFormat());

    test("command calls", () =>
      expect("foo.bar alpha: alpha, beta: beta").toMatchFormat());

    test("calls", () =>
      expect("foobar(alpha: alpha, beta: beta)").toMatchFormat());

    test("does not add trailing commas on breaking commands", () =>
      expect(`foobar ${long}: ${long}, a${long}: a${long}`).toChangeFormat(
        ruby(`
          foobar ${long}:
                   ${long},
                 a${long}:
                   a${long}
        `),
        { addTrailingCommas: true }
      ));

    test("does not add trailing commas on breaking command calls", () =>
      expect(`foo.bar ${long}: ${long}, a${long}: a${long}`).toChangeFormat(
        ruby(`
          foo.bar ${long}:
                    ${long},
                  a${long}:
                    a${long}
        `),
        { addTrailingCommas: true }
      ));

    test("does add trailing commas on breaking calls", () =>
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
      ));
  });

  describe("when hash labels allowed", () => {
    test("hash labels stay", () =>
      expect("{ a: 'a', b: 'b', c: 'c' }").toMatchFormat());

    test("hash rockets get replaced", () =>
      expect("{ :a => 'a', :b => 'b', :c => 'c' }").toChangeFormat(
        "{ a: 'a', b: 'b', c: 'c' }"
      ));

    test("hash rockets stay when needed", () =>
      expect("{ Foo => 1, Bar => 2 }").toMatchFormat());

    test("ending in equals stays", () =>
      expect("{ :foo= => 'bar' }").toMatchFormat());

    test("starting with non-letter/non-underscore stays", () =>
      expect("{ :@foo => 'bar' }").toMatchFormat());

    test("starting with underscore converts", () =>
      expect("{ :_foo => 'bar' }").toChangeFormat("{ _foo: 'bar' }"));
  });

  describe("when hash labels disallowed", () => {
    test("hash labels get replaced", () =>
      expect("{ a: 'a', b: 'b', c: 'c' }").toChangeFormat(
        "{ :a => 'a', :b => 'b', :c => 'c' }",
        {
          preferHashLabels: false
        }
      ));

    test("hash rockets stay", () =>
      expect("{ :a => 'a', :b => 'b', :c => 'c' }").toMatchFormat({
        preferHashLabels: false
      }));

    test("hash rockets stay when needed", () =>
      expect("{ Foo => 1, Bar => 2 }").toMatchFormat({
        preferHashLabels: false
      }));

    test("ending in equals stays", () =>
      expect("{ :foo= => 'bar' }").toMatchFormat({
        preferHashLabels: false
      }));

    test("starting with non-letter/non-underscore stays", () =>
      expect("{ :@foo => 'bar' }").toMatchFormat({
        preferHashLabels: false
      }));

    test("starting with underscore stays", () =>
      expect("{ :_foo => 'bar' }").toMatchFormat({
        preferHashLabels: false
      }));
  });
});
