import { long, ruby } from "../../utils";

describe("case", () => {
  test("empty case", () => {
    const content = ruby(`
      case
      when a
        1
      end
    `);

    expect(content).toMatchFormat();
  });

  test("single when", () => {
    const content = ruby(`
      case a
      when b
        1
      end
    `);

    expect(content).toMatchFormat();
  });

  test("multiple predicates, one when", () => {
    const content = ruby(`
      case a
      when b, c
        1
      end
    `);

    expect(content).toMatchFormat();
  });

  test("breaking with multiple predicates, one when", () => {
    const content = ruby(`
      case foo
      when "${long}",
           "a${long}",
           "b${long}"
        bar
      end
    `);

    expect(content).toMatchFormat();
  });

  test("breaking with multiple predicates, each one not too long", () => {
    const content = ruby(`
      case foo
      when "${long.slice(0, 40)}", "${long.slice(0, 40)}"
        bar
      end
    `);

    const expected = ruby(`
      case foo
      when "${long.slice(0, 40)}",
           "${long.slice(0, 40)}"
        bar
      end
    `);

    expect(content).toChangeFormat(expected);
  });

  test("multiple consecutive whens", () => {
    const content = ruby(`
      case a
      when b
      when c
        1
      end
    `);

    expect(content).toMatchFormat();
  });

  test("basic multiple branches", () => {
    const content = ruby(`
      case a
      when b
        1
      when c
        2
      end
    `);

    expect(content).toMatchFormat();
  });

  test("else clauses", () => {
    const content = ruby(`
      case a
      when b
        1
      else
        2
      end
    `);

    expect(content).toMatchFormat();
  });
});
