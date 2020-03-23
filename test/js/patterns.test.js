const { ruby } = require("./utils");

describe("patterns", () => {
  if (process.env.RUBY_VERSION <= "2.7") {
    test("pattern matching does not exist before ruby 2.7", () => {
      // this is here because test files must contain at least one test, so for
      // earlier versions of ruby this is just going to chill here
    });

    return;
  }

  describe("value pattern", () => {
    const cases = [
      "0",
      "-1..1",
      "Integer",
      "bar",
      "_, _",
      "0 | 1 | 2",
      "Integer => bar",
      "Object[0, *bar, 1]",
      "a, b, *c, d, e",
      "0, [1, _] => bar"
    ];

    test.each(cases)("%s", (pattern) => {
      const content = ruby(`
        case foo
        in ${pattern}
          baz
        end
      `);

      return expect(content).toMatchFormat();
    });

    // Skipping this for now as it doesn't appear that there's a way to get the
    // caret operator. More investigation needed.
    test.skip("works with pinning", () => {
      const content = ruby(`
        case foo
        in ^bar
          baz
        end
      `);

      return expect(content).toMatchFormat();
    });
  });
});
