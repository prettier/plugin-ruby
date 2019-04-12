const { long } = require("./utils");

describe.each(["while", "until"])("%s", keyword => {
  describe("inlines allowed", () => {
    test("transforms to inline", () => (
      expect(`${keyword} a\n  1\nend`).toChangeFormat(`1 ${keyword} a`)
    ));

    test("maintains inlines", () => (
      expect(`1 ${keyword} a`).toMatchFormat()
    ));

    test("breaks on large predicates", () => (
      expect(`${keyword} ${long}\n  1\nend`).toMatchFormat()
    ));

    test("breaks inlines on large predicates", () => (
      expect(`1 ${keyword} ${long}`).toChangeFormat(
        `${keyword} ${long}\n  1\nend`
      )
    ));
  });

  describe("inlines not allowed", () => {
    test("maintains multiline", () => (
      expect(`${keyword} a\n  1\nend`).toMatchFormat({ inlineLoops: false })
    ));

    test("transforms to multiline", () => (
      expect(`1 ${keyword} a`).toChangeFormat(`${keyword} a\n  1\nend`, {
        inlineLoops: false
      })
    ));

    test("breaks on large predicates", () => (
      expect(`${keyword} ${long}\n  1\nend`).toMatchFormat({
        inlineLoops: false
      })
    ));

    test("breaks inlines on large predicates", () => (
      expect(`1 ${keyword} ${long}`).toChangeFormat(
        `${keyword} ${long}\n  1\nend`
      )
    ));
  });
});
