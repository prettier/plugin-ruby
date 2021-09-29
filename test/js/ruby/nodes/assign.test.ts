import { long, ruby } from "../../utils";

describe("assign", () => {
  describe("single assignment", () => {
    test("basic", () => {
      expect("a = 1").toMatchFormat();
    });

    test("multiline", () => {
      const content = ruby(`
        a =
          begin
            1
          end
      `);

      expect(content).toMatchFormat();
    });

    test("other operator", () => {
      expect("a ||= b").toMatchFormat();
    });
  });

  test("heredoc", () => {
    const content = ruby(`
      text = <<-TEXT
        abcd
      TEXT
    `);

    expect(content).toMatchFormat();
  });

  describe("breaking", () => {
    test("inline becomes multi line", () => {
      expect(`${long} = ${long}`).toChangeFormat(`${long} =\n  ${long}`);
    });

    test("arrays don't get force indented", () => {
      expect(`a = [${long}, ${long}, ${long}]`).toChangeFormat(
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
      );
    });

    test("chained methods on array literals don't get oddly indented", () => {
      expect(`a = [${long}].freeze`).toChangeFormat(
        ruby(`
          a = [
            ${long}
          ].freeze
        `)
      );
    });

    test("chained methods on hash literals don't get oddly indented", () => {
      expect(`a = { a: ${long} }.freeze`).toChangeFormat(
        ruby(`
          a = {
            a:
              ${long}
          }.freeze
        `)
      );
    });
  });

  describe("constants", () => {
    test("assigning to constant", () => {
      expect("Pret::TIER = 'config'").toMatchFormat();
    });

    test("assigning to top level constants", () => {
      expect("::PRETTIER = 'config'").toMatchFormat();
    });
  });
});
