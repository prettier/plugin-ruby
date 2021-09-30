import { atLeastVersion, atMostVersion, ruby } from "../../utils";

describe("patterns", () => {
  if (atMostVersion("2.7")) {
    test("pattern matching does not exist before ruby 2.7", () => {
      // this is here because test files must contain at least one test, so for
      // earlier versions of ruby this is just going to chill here
    });

    return;
  }

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
    "*c, d, e",
    "0, [1, _] => bar",
    "^bar",
    "x: 0.. => px, **rest",
    "**rest",
    "SuperPoint[x: 0.. => px]",
    "a, b if b == a * 2"
  ];

  if (atLeastVersion("3.0")) {
    cases.push("[*, 0, *]", "[*, 0, 1, 2, *]", "FooBar[*, 0, *]");

    test("rassign", () => {
      const content = "{ db: { user: 'John' } } => { db: { user: } }";

      expect(content).toMatchFormat();
    });

    test("rassign with fndptn", () => {
      const content = "(1..10).to_a.shuffle => [*bef, 2..4 => thresh, *aft]";

      expect(content).toMatchFormat();
    });
  }

  test.each(cases)("%s", (pattern) => {
    const content = ruby(`
      case foo
      in ${pattern}
        baz
      end
    `);

    expect(content).toMatchFormat();
  });

  test("with comments in an array pattern", () => {
    const content = ruby(`
      case foo
      in 1, # 1 comment
         2 # 2 comment
        bar
      end
    `);

    expect(content).toMatchFormat();
  });

  test("with comments in an array pattern", () => {
    const content = ruby(`
      case foo
      in foo:, # foo comment
         bar: # bar comment
        bar
      end
    `);

    expect(content).toMatchFormat();
  });

  test("multiple clauses", () => {
    const content = ruby(`
      case foo
      in bar
        1
      in baz
        2
      end
    `);

    expect(content).toMatchFormat();
  });
});
