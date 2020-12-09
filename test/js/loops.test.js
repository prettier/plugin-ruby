const { long, ruby } = require("./utils");

describe.each(["while", "until"])("%s", (keyword) => {
  test("aligns predicates", () =>
    expect(`foo ${keyword} ${long} || ${long}`).toChangeFormat(
      ruby(`
      ${keyword} ${long} ||
          ${Array(keyword.length).fill().join(" ")}${long}
        foo
      end
    `)
    ));

  describe("inlines allowed", () => {
    test("transforms to inline", () =>
      expect(`${keyword} a\n  1\nend`).toChangeFormat(`1 ${keyword} a`));

    test("maintains inlines", () => expect(`1 ${keyword} a`).toMatchFormat());

    test("breaks on large predicates", () =>
      expect(`${keyword} ${long}\n  1\nend`).toMatchFormat());

    test("breaks inlines on large predicates", () =>
      expect(`1 ${keyword} ${long}`).toChangeFormat(
        `${keyword} ${long}\n  1\nend`
      ));

    test("does not break into block when modifying a begin", () => {
      const content = ruby(`
        begin
          foo
        end ${keyword} bar
      `);

      return expect(content).toMatchFormat();
    });

    test("breaks when an assignment is in the predicate", () => {
      const content = ruby(`
        ${keyword} (a = 1)
          a
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("breaks when a multi assignment is in the predicate", () => {
      const content = ruby(`
        ${keyword} (a, b = 1, 2)
          a
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("breaks the parent when there is an assignment", () => {
      const content = ruby(`
        foo do
          while foo = foo
            yield foo
          end
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("wraps single lines in parens when assigning", () =>
      expect(
        `hash[:key] = ${keyword} false do break :value end`
      ).toChangeFormat(`hash[:key] = (break :value ${keyword} false)`));

    test("empty body", () => {
      const content = ruby(`
        while foo
        end
      `);

      return expect(content).toChangeFormat("while foo; end");
    });

    test("empty body, long predicate", () => {
      const content = ruby(`
        while ${long}
        end
      `);

      return expect(content).toMatchFormat();
    });
  });

  describe("inlines not allowed", () => {
    test("maintains multiline", () =>
      expect(`${keyword} a\n  1\nend`).toMatchFormat({ rubyModifier: false }));

    test("transforms to multiline", () =>
      expect(`1 ${keyword} a`).toChangeFormat(`${keyword} a\n  1\nend`, {
        rubyModifier: false
      }));

    test("breaks on large predicates", () =>
      expect(`${keyword} ${long}\n  1\nend`).toMatchFormat({
        rubyModifier: false
      }));

    test("breaks inlines on large predicates", () =>
      expect(`1 ${keyword} ${long}`).toChangeFormat(
        `${keyword} ${long}\n  1\nend`,
        {
          rubyModifier: false
        }
      ));

    test("does not break into block when modifying a begin", () => {
      const content = ruby(`
        begin
          foo
        end ${keyword} bar
      `);

      return expect(content).toMatchFormat({ rubyModifier: false });
    });

    test("empty body", () => {
      const content = ruby(`
        while foo
        end
      `);

      return expect(content).toChangeFormat("while foo; end", {
        rubyModifier: false
      });
    });

    test("empty body, long predicate", () => {
      const content = ruby(`
        while ${long}
        end
      `);

      return expect(content).toMatchFormat({ rubyModifier: false });
    });
  });

  describe.each(["while", "until"])(
    "add parens when necessary %s",
    (keyword) => {
      test("args", () =>
        expect(`[${keyword} foo? do bar end]`).toChangeFormat(
          `[(bar ${keyword} foo?)]`
        ));

      test("assign", () =>
        expect(`foo = ${keyword} bar? do baz end`).toChangeFormat(
          `foo = (baz ${keyword} bar?)`
        ));

      test("assoc_new", () =>
        expect(`{ foo: ${keyword} bar? do baz end }`).toChangeFormat(
          `{ foo: (baz ${keyword} bar?) }`
        ));

      test("massign", () =>
        expect(`f, o, o = ${keyword} bar? do baz end`).toChangeFormat(
          `f, o, o = (baz ${keyword} bar?)`
        ));

      test("opassign", () =>
        expect(`foo ||= ${keyword} bar? do baz end`).toChangeFormat(
          `foo ||= (baz ${keyword} bar?)`
        ));
    }
  );
});
