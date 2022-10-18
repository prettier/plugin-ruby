import { atLeastVersion, atMostVersion, ruby } from "../../utils.js";

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
    "0 | 1 | 2",
    "Integer => bar",
    "Object[0, *bar, 1]",
    "^bar",
    "{ x: 0.. => px, **rest }",
    "**rest",
    "SuperPoint[x: 0.. => px]"
  ];

  if (atLeastVersion("3.0")) {
    cases.push("[*, 0, *]", "[*, 0, 1, 2, *]", "FooBar[*, 0, *]");

    test("rassign", () => {
      const content = `{ db: { user: "John" } } => { db: { user: } }`;

      return expect(content).toMatchFormat();
    });

    test("rassign with fndptn", () => {
      const content = "(1..10).to_a.shuffle => [*bef, 2..4 => thresh, *aft]";

      return expect(content).toMatchFormat();
    });
  }

  test.each(cases)("%s", (pattern) => {
    const content = ruby(`
      case foo
      in ${pattern}
        baz
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("a, b, *c, d, e", () => {
    const content = ruby(`
      case foo
      in a, b, *c, d, e
        baz
      end
    `);

    const expectedContent = ruby(`
      case foo
      in [a, b, *c, d, e]
        baz
      end
    `);

    return expect(content).toChangeFormat(expectedContent);
  });

  test("0, [1, _] => bar", () => {
    const content = ruby(`
      case foo
      in 0, [1, _] => bar
        baz
      end
    `);

    const expectedContent = ruby(`
      case foo
      in [0, [1, _] => bar]
        baz
      end
    `);

    return expect(content).toChangeFormat(expectedContent);
  });

  test("*c, d, e", () => {
    const content = ruby(`
      case foo
      in *c, d, e
        baz
      end
    `);

    const expectedContent = ruby(`
      case foo
      in [*c, d, e]
        baz
      end
    `);

    return expect(content).toChangeFormat(expectedContent);
  });

  test("_, _", () => {
    const content = ruby(`
      case foo
      in _, _
        baz
      end
    `);

    const expectedContent = ruby(`
      case foo
      in [_, _]
        baz
      end
    `);

    return expect(content).toChangeFormat(expectedContent);
  });

  test("a, b if b == a * 2", () => {
    const content = ruby(`
      case foo
      in a, b if b == a * 2
        baz
      end
    `);

    const expectedContent = ruby(`
      case foo
      in [a, b] if b == a * 2
        baz
      end
    `);

    return expect(content).toChangeFormat(expectedContent);
  });

  test("with a single array element", () => {
    const content = ruby(`
      case value
      in [element]
        matched
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("with comments in an array pattern", () => {
    const content = ruby(`
      case foo
      in 1, # 1 comment
         2 # 2 comment
        bar
      end
    `);

    const expectedContent = ruby(`
      case foo
      in [
           1, # 1 comment
           2
         ] # 2 comment
        bar
      end
    `);

    return expect(content).toChangeFormat(expectedContent);
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

    return expect(content).toMatchFormat();
  });
});
