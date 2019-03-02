const escapePattern = require("../src/escapePattern");

describe("escape sequences", () => {
  const should = value => string => (
    expect(escapePattern.test(string)).toBe(value)
  );

  const shouldMatch = should(true);
  const shouldNotMatch = should(false);

  test("identifies simple escapes", () => {
    shouldMatch("\\t");
    shouldMatch("\\n");
    shouldNotMatch("\\x");
  });

  test("identifies octal bits", () => {
    shouldMatch("\\1");
    shouldMatch("\\12");
    shouldNotMatch("\\8");
  });

  test("identifies hex bits", () => {
    shouldMatch("\\x0");
    shouldMatch("\\xa");
    shouldMatch("\\xab");
    shouldNotMatch("\\xg");
  });

  test("identifies unicode char", () => {
    shouldMatch("\\uabcd");
    shouldNotMatch("\\uabcg");
  });

  test("identifies unicode chars", () => {
    shouldMatch("\\u{abcd abce abcf}");
    shouldNotMatch("\\u{abcd abce abcg}");
  });

  test("identifies controls", () => {
    shouldMatch("\\ca");
    shouldMatch("\\C-a");
    shouldNotMatch("\\c🎉");
  });

  test("identifies metas", () => {
    shouldMatch("\\M-a");
    shouldNotMatch("\\M-🎉");
  });

  test("identifies meta controls", () => {
    shouldMatch("\\M-\\C-a");
    shouldMatch("\\M-\\ca");
    shouldMatch("\\c\\M-a");
  });

  test("identifies deletes", () => {
    shouldMatch("\\c?");
    shouldMatch("\\C-?");
    shouldNotMatch("\\d?");
  });
});
