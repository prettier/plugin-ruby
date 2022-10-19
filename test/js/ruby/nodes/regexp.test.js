import { ruby } from "../../utils.js";

describe("regexp", () => {
  test("basic", () => {
    return expect("/abc/").toMatchFormat();
  });

  test("unnecessary braces", () => {
    return expect("%r{abc}").toChangeFormat("/abc/");
  });

  test("unnecessary slashes", () => {
    return expect("%r/abc/").toChangeFormat("/abc/");
  });

  test("unnecessary brackets", () => {
    return expect("%r[abc]").toChangeFormat("/abc/");
  });

  test("unnecessary parens", () => {
    return expect("%r(abc)").toChangeFormat("/abc/");
  });

  test("necessary braces", () => {
    return expect("%r{a/b/c}").toMatchFormat();
  });

  test("interpolation", () => {
    return expect("/a#{inter}c/").toMatchFormat();
  });

  test("modifiers", () => {
    return expect("/abc/i").toMatchFormat();
  });

  test("braces and modifiers", () => {
    return expect("%r{a/b/c}mi").toMatchFormat();
  });

  test("global interpolation", () => {
    return expect("/#$&/").toChangeFormat("/#{$&}/");
  });

  test("do not change if { and / in regexp literal", () => {
    return expect("%r(a{b/c)").toMatchFormat();
  });

  test("do not change if } and / in regexp literal", () => {
    return expect("%r[a}b/c]").toMatchFormat();
  });

  test("parens with }", () => {
    return expect("%r(a}bc)").toChangeFormat("/a}bc/");
  });

  test("comments in regex", () => {
    const content = ruby(`
      /\\A
        [[:digit:]]+ # 1 or more digits before the decimal point
        (\\.         # Decimal point
        [[:digit:]]+ # 1 or more digits after the decimal point
        )? # The decimal point and following digits are optional
      \\Z/x
    `);

    return expect(content).toMatchFormat();
  });

  test("forces braces if could be ambiguous with space in command", () => {
    return expect("foo %r{ bar}").toMatchFormat();
  });

  test("forces braces if could be ambiguous with equals in command", () => {
    return expect("foo %r{= bar}").toMatchFormat();
  });

  test("do not force braces if space is in parens", () => {
    return expect("foo(/ bar/)").toMatchFormat();
  });
});
