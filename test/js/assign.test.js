const { long, ruby } = require("./utils");

describe("assign", () => {
  describe("single assignment", () => {
    test("basic", () => expect("a = 1").toMatchFormat());

    test("multiline", () => {
      const content = ruby(`
        a =
          begin
            1
          end
      `);

      return expect(content).toMatchFormat();
    });

    test("other operator", () => expect("a ||= b").toMatchFormat());
  });

  describe("multiple assignment", () => {
    test("multi on left, multi on right", () =>
      expect("a, b, c = 1, 2, 3").toMatchFormat());

    test("single on left, multi on right", () =>
      expect("a = 1, 2, 3").toMatchFormat());

    test("multi on left, array on right", () =>
      expect("a, b, c = [1, 2, 3]").toMatchFormat());

    test("parens on left, multi on right", () =>
      expect("(a, b, c) = 1, 2, 3").toChangeFormat("a, b, c = 1, 2, 3"));

    test("double parens on left, multi on right", () =>
      expect("((a, b, c)) = 1, 2, 3").toChangeFormat("a, b, c = 1, 2, 3"));

    test("parens on some of left, multi on right", () =>
      expect("(a, b), c = [1, 2], 3").toMatchFormat());

    test("extra commas at the end", () => expect("a, = 1").toMatchFormat());

    test("extra commas at the end with multiple", () =>
      expect("a, b, c, = 1").toMatchFormat());

    test("extra commas with parens", () =>
      expect("(a, b,), c, = 1").toMatchFormat());

    test("extra commas with doubled parens", () =>
      expect("((a, b,), c,), = 1").toMatchFormat());
  });

  describe("multiple assignment with splat", () => {
    test("after ident", () => expect("a, *b = 1, 2, 3").toMatchFormat());

    test("between idents", () =>
      expect("a, *b, c, d = 1, 2, 3").toMatchFormat());

    test("with no name", () => expect("a, * = 1, 2, 3").toMatchFormat());

    test("on right side", () => expect("a = *a").toMatchFormat());

    test("only on left side", () => expect("* = [1, 2, 3]").toMatchFormat());

    test("and then ident on left side", () =>
      expect("*, a = [1, 2, 3]").toMatchFormat());
  });

  describe("breaking", () => {
    test("inline becomes multi line", () =>
      expect(`${long} = ${long}`).toChangeFormat(`${long} =\n  ${long}`));

    test("arrays don't get force indented", () =>
      expect(`a = [${long}, ${long}, ${long}]`).toChangeFormat(
        ruby(`
        a = [
          ${long},
          ${long},
          ${long}
        ]
      `)
      ));

    test("hashes don't get force indented", () =>
      expect(`a = { a: ${long}, b: ${long}, c: ${long} }`).toChangeFormat(
        ruby(`
        a = {
          a:
            ${long},
          b:
            ${long},
          c:
            ${long}
        }
      `)
      ));

    test("chained methods on array literals don't get oddly indented", () =>
      expect(`a = [${long}].freeze`).toChangeFormat(
        ruby(`
        a = [
          ${long}
        ].freeze
      `)
      ));

    test("chained methods on hash literals don't get oddly indented", () =>
      expect(`a = { a: ${long} }.freeze`).toChangeFormat(
        ruby(`
        a = {
          a:
            ${long}
        }.freeze
      `)
      ));
  });

  describe("constants", () => {
    test("assigning to constant", () =>
      expect("Pret::TIER = 'config'").toMatchFormat());

    test("assigning to top level constants", () =>
      expect("::PRETTIER = 'config'").toMatchFormat());
  });
});
