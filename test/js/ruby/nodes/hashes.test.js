import { long, ruby } from "../../utils.js";

describe("hash", () => {
  test("empty", () => {
    return expect("{}").toMatchFormat();
  });

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

  test("breaking maintains calls on the end", () => {
    return expect(`{ a: ${long} }.freeze`).toChangeFormat(
      `{\n  a:\n    ${long}\n}.freeze`
    );
  });

  describe("heredocs as values", () => {
    test("as the first value", () => {
      const content = ruby(`
        { foo: <<~HERE, bar: "bar" }
          this is the heredoc
        HERE
      `);

      return expect(content).toMatchFormat();
    });

    test("as the last value", () => {
      const content = ruby(`
        { foo: "foo", bar: <<~HERE }
          this is the heredoc
        HERE
      `);

      return expect(content).toMatchFormat();
    });

    test("when exceeding line length", () => {
      const content = ruby(`
        { foo: "${long}", bar: <<~HERE }
          this is the heredoc
        HERE
      `);

      const expected = ruby(`
        {
          foo:
            "${long}",
          bar: <<~HERE
          this is the heredoc
        HERE
        }
      `);

      return expect(content).toChangeFormat(expected);
    });
  });

  describe("dynamic string keys", () => {
    test("basic", () => {
      return expect(`{ "foo": "bar" }`).toChangeFormat(`{ foo: "bar" }`);
    });

    test("with interpolation", () => {
      return expect(`{ "#{1 + 1}": 2 }`).toMatchFormat();
    });
  });

  describe("bare assoc hash", () => {
    test("commands", () => {
      return expect("foobar alpha: alpha, beta: beta").toMatchFormat();
    });

    test("command calls", () => {
      return expect("foo.bar alpha: alpha, beta: beta").toMatchFormat();
    });

    test("calls", () => {
      return expect("foobar(alpha: alpha, beta: beta)").toMatchFormat();
    });

    test("breaks contents and parens together", () => {
      const content = ruby(`
        foobar(key1: ${long.slice(0, 32)}, key2: ${long.slice(0, 32)})
      `);

      const expected = ruby(`
        foobar(
          key1: ${long.slice(0, 32)},
          key2: ${long.slice(0, 32)}
        )
      `);

      return expect(content).toChangeFormat(expected);
    });
  });

  describe("when hash labels allowed", () => {
    test("hash labels stay", () => {
      return expect(`{ a: "a", b: "b", c: "c" }`).toMatchFormat();
    });

    test("hash rockets get replaced", () => {
      return expect(`{ :a => "a", :b => "b", :c => "c" }`).toChangeFormat(
        `{ a: "a", b: "b", c: "c" }`
      );
    });

    test("hash rockets stay when needed", () => {
      return expect("{ Foo => 1, Bar => 2 }").toMatchFormat();
    });

    test("ending in equals stays", () => {
      return expect(`{ :foo= => "bar" }`).toMatchFormat();
    });

    test("starting with non-letter/non-underscore stays", () => {
      return expect(`{ :@foo => "bar" }`).toMatchFormat();
    });

    test("starting with underscore converts", () => {
      return expect(`{ :_foo => "bar" }`).toChangeFormat(`{ _foo: "bar" }`);
    });
  });

  test("prints hashes with consistent keys", () => {
    return expect(`{ a: "a", b => "b" }`).toChangeFormat(
      `{ :a => "a", b => "b" }`
    );
  });

  test("print hashes with correct braces when contents fits", () => {
    const content = ruby(`
      {
        key1: ${long.slice(0, 32)},
        key2: ${long.slice(0, 32)}
      }
    `);

    return expect(content).toMatchFormat();
  });

  test("with leading comments but none in body", () => {
    const content = ruby(`
      # leading
      {}
    `);

    return expect(content).toMatchFormat();
  });

  test("with leading comments and comments in the body", () => {
    const content = ruby(`
      # leading
      {
        # inside
        # body
      }
    `);

    return expect(content).toMatchFormat();
  });

  test("with comments just in the body", () => {
    const content = ruby(`
      {
        # inside
        # body
      }
    `);

    return expect(content).toMatchFormat();
  });

  // https://github.com/prettier/plugin-ruby/issues/758
  test("splits if the key has a comment attached", () => {
    const content = ruby(`
      items = {
        :"foo-bar"=> # Inline comment
          baz,
      }
    `);

    const expected = ruby(`
      items = {
        "foo-bar": # Inline comment
          baz
      }
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("child hashes break assoc_news if their parents break", () => {
    const content = ruby(`
      {
        ${long}: { foo: bar }
      }
    `);

    const expected = ruby(`
      {
        ${long}: {
          foo: bar
        }
      }
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("child hashes break hashes if their parents break", () => {
    const key = long.slice(0, 40);
    const content = ruby(`
      {
        ${key}: foo,
        ${key}: foo,
        ${key}: { foo: bar }
      }
    `);

    const expected = ruby(`
      {
        ${key}: foo,
        ${key}: foo,
        ${key}: {
          foo: bar
        }
      }
    `);

    return expect(content).toChangeFormat(expected);
  });
});
