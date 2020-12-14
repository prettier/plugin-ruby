const { ruby } = require("../utils");

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
      "0, [1, _] => bar",
      "^bar",
      "x: 0.. => px, **rest",
      "SuperPoint[x: 0.. => px]",
      "a, b if b == a * 2"
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
  });
});
