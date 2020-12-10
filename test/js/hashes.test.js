const { long, ruby } = require("./utils");

describe("hash", () => {
  test("empty", () => expect("{}").toMatchFormat());

  test("empty with comments", () => {
    const content = ruby(`
      {
        # foo
        # bar
      }
    `);

    return expect(content).toMatchFormat();
  });

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
      trailingComma: "all"
    });
  });

  describe("heredocs as values", () => {
    test("as the first value", () => {
      const content = ruby(`
        { foo: <<~HERE, bar: 'bar' }
          this is the heredoc
        HERE
      `);

      return expect(content).toMatchFormat();
    });

    test("as the last value", () => {
      const content = ruby(`
        { foo: 'foo', bar: <<~HERE }
          this is the heredoc
        HERE
      `);

      return expect(content).toMatchFormat();
    });

    test("with trailing commas", () => {
      const content = ruby(`
        {
          foo:
            ${long},
          bar: <<~HERE,
            this is the heredoc
          HERE
        }
      `);

      return expect(content).toMatchFormat({ trailingComma: "all" });
    });

    test("when exceeding line length", () => {
      const content = ruby(`
        { foo: '${long}', bar: <<~HERE }
          this is the heredoc
        HERE
      `);

      const expected = ruby(`
        {
          foo:
            '${long}',
          bar: <<~HERE
          this is the heredoc
        HERE
        }
      `);

      return expect(content).toChangeFormat(expected);
    });
  });

  describe("dynamic string keys", () => {
    test("basic", () => expect(`{ 'foo': 'bar' }`).toMatchFormat());

    test("with interpolation", () =>
      expect(`{ "#{1 + 1}": 2 }`).toMatchFormat());

    test("basic without hash labels", () =>
      expect(`{ :'foo' => 'bar' }`).toMatchFormat({ rubyHashLabel: false }));

    test("with interpolation without hash labels", () =>
      expect(`{ :"#{1 + 1}" => 2 }`).toMatchFormat({ rubyHashLabel: false }));
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
        { trailingComma: "all" }
      ));

    test("does not add trailing commas on breaking command calls", () =>
      expect(`foo.bar ${long}: ${long}, a${long}: a${long}`).toChangeFormat(
        ruby(`
          foo.bar ${long}:
                    ${long},
                  a${long}:
                    a${long}
        `),
        { trailingComma: "all" }
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
        { trailingComma: "all" }
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
          rubyHashLabel: false
        }
      ));

    test("hash rockets stay", () =>
      expect("{ :a => 'a', :b => 'b', :c => 'c' }").toMatchFormat({
        rubyHashLabel: false
      }));

    test("hash rockets stay when needed", () =>
      expect("{ Foo => 1, Bar => 2 }").toMatchFormat({
        rubyHashLabel: false
      }));

    test("ending in equals stays", () =>
      expect("{ :foo= => 'bar' }").toMatchFormat({
        rubyHashLabel: false
      }));

    test("starting with non-letter/non-underscore stays", () =>
      expect("{ :@foo => 'bar' }").toMatchFormat({
        rubyHashLabel: false
      }));

    test("starting with underscore stays", () =>
      expect("{ :_foo => 'bar' }").toMatchFormat({
        rubyHashLabel: false
      }));
  });

  test("prints hashes with consistent keys", () =>
    expect("{ a: 'a', b => 'b' }").toChangeFormat("{ :a => 'a', b => 'b' }"));

  test("print hashes with correct braces when contents fits", () => {
    const content = ruby(`
      {
        key1: ${long.slice(0, 32)},
        key2: ${long.slice(0, 32)}
      }
    `);

    return expect(content).toMatchFormat();
  });
});
