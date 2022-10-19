import { long, ruby } from "../../utils.js";

describe.each(["while", "until"])("%s", (keyword) => {
  test("aligns predicates", () => {
    return expect(`foo ${keyword} ${long} || ${long}`).toChangeFormat(
      ruby(`
        ${keyword} ${long} ||
            ${Array(keyword.length).fill("").join(" ")}${long}
          foo
        end
      `)
    );
  });

  describe("inlines allowed", () => {
    test("transforms to inline", () => {
      return expect(`${keyword} a\n  1\nend`).toChangeFormat(`1 ${keyword} a`);
    });

    test("maintains inlines", () => {
      return expect(`1 ${keyword} a`).toMatchFormat();
    });

    test("breaks on large predicates", () => {
      return expect(`${keyword} ${long}\n  1\nend`).toMatchFormat();
    });

    test("breaks inlines on large predicates", () => {
      return expect(`1 ${keyword} ${long}`).toChangeFormat(
        `${keyword} ${long}\n  1\nend`
      );
    });

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

    test("wraps single lines in parens when assigning", () => {
      return expect(
        `hash[:key] = ${keyword} false do break :value end`
      ).toChangeFormat(`hash[:key] = (break :value ${keyword} false)`);
    });

    test("empty body", () => {
      const content = ruby(`
        while foo
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("empty body, long predicate", () => {
      const content = ruby(`
        while ${long}
        end
      `);

      return expect(content).toMatchFormat();
    });
  });

  describe.each(["while", "until"])(
    "add parens when necessary %s",
    (keyword) => {
      test("args", () => {
        return expect(`[${keyword} foo? do bar end]`).toChangeFormat(
          `[(bar ${keyword} foo?)]`
        );
      });

      test("assign", () => {
        return expect(`foo = ${keyword} bar? do baz end`).toChangeFormat(
          `foo = (baz ${keyword} bar?)`
        );
      });

      test("assoc", () => {
        return expect(`{ foo: ${keyword} bar? do baz end }`).toChangeFormat(
          `{ foo: (baz ${keyword} bar?) }`
        );
      });

      test("massign", () => {
        return expect(`f, o, o = ${keyword} bar? do baz end`).toChangeFormat(
          `f, o, o = (baz ${keyword} bar?)`
        );
      });

      test("opassign", () => {
        return expect(`foo ||= ${keyword} bar? do baz end`).toChangeFormat(
          `foo ||= (baz ${keyword} bar?)`
        );
      });
    }
  );

  // https://github.com/prettier/plugin-ruby/issues/759
  test("handles do keyword", () => {
    const content = ruby(`
      %w[foo bar].each do |resource|
        puts resource
      
        # comment comment
        ${keyword} @client.missing?(resource) do
          sleep 1
        end
      end
    `);

    const expected = ruby(`
      %w[foo bar].each do |resource|
        puts resource
      
        # comment comment
        sleep 1 ${keyword} @client.missing?(resource)
      end
    `);

    return expect(content).toChangeFormat(expected);
  });
});
