import { long, ruby } from "../../utils.js";

describe("assign", () => {
  describe("single assignment", () => {
    test("basic", () => {
      return expect("a = 1").toMatchFormat();
    });

    test("multiline", () => {
      const content = ruby(`
        a =
          begin
            1
          end
      `);

      return expect(content).toMatchFormat();
    });

    test("other operator", () => {
      return expect("a ||= b").toMatchFormat();
    });
  });

  test("heredoc", () => {
    const content = ruby(`
      text = <<-TEXT
        abcd
      TEXT
    `);

    return expect(content).toMatchFormat();
  });

  describe("breaking", () => {
    test("inline becomes multi line", () => {
      return expect(`${long} = ${long}`).toChangeFormat(`${long} =\n  ${long}`);
    });

    test("arrays don't get force indented", () => {
      return expect(`a = [${long}, ${long}, ${long}]`).toChangeFormat(
        ruby(`
          a = [
            ${long},
            ${long},
            ${long}
          ]
        `)
      );
    });

    test("hashes don't get force indented", () => {
      return expect(
        `a = { a: ${long}, b: ${long}, c: ${long} }`
      ).toChangeFormat(
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
      );
    });

    describe("assignments from quotewords and similar", () => {
      const cases = ["w", "W", "i", "I"];

      test.each(cases)("x = %s[...] is not force-indented", (literal) => {
        return expect(`a = %${literal}[${long} ${long}]`).toChangeFormat(
          ruby(`
            a = %${literal}[
              ${long}
              ${long}
            ]
          `)
        );
      });
    });

    test("chained methods on array literals don't get oddly indented", () => {
      return expect(`a = [${long}].freeze`).toChangeFormat(
        ruby(`
          a = [
            ${long}
          ].freeze
        `)
      );
    });

    test("chained methods on hash literals don't get oddly indented", () => {
      return expect(`a = { a: ${long} }.freeze`).toChangeFormat(
        ruby(`
          a = {
            a:
              ${long}
          }.freeze
        `)
      );
    });

    describe("assignment operators", () => {
      // some but not all
      const operators = ["||", "&&", "+", "*", "%", "**", "<<"];

      test.each(operators)("array %s= [...] is not force-indented", (op) => {
        return expect(`a ${op}= [${long}, ${long}, ${long}]`).toChangeFormat(
          ruby(`
            a ${op}= [
              ${long},
              ${long},
              ${long}
            ]
          `)
        );
      });

      test.each(operators)("hash %s= { ... } is not force-indented", (op) => {
        return expect(
          `a ${op}= { a: ${long}, b: ${long}, c: ${long} }`
        ).toChangeFormat(
          ruby(`
          a ${op}= {
            a:
              ${long},
            b:
              ${long},
            c:
              ${long}
          }
          `)
        );
      });
    });
  });

  describe("constants", () => {
    test("assigning to constant", () => {
      return expect(`Pret::TIER = "config"`).toMatchFormat();
    });

    test("assigning to top level constants", () => {
      return expect(`::PRETTIER = "config"`).toMatchFormat();
    });
  });
});
