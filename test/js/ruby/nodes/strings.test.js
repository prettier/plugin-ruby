const { long, ruby } = require("../../utils");

describe("strings", () => {
  describe("%-literals with escape sequences in the middle", () => {
    const cases = [
      ["(", ")"],
      ["[", "]"],
      ["{", "}"],
      ["<", ">"],
      ["|", "|"]
    ];

    test.each(cases)("%%%s%s", (stringStart, stringEnd) =>
      expect(`%${stringStart}a\\bc${stringEnd}`).toMatchFormat()
    );

    test.each(cases)("%q%s%s", (stringStart, stringEnd) =>
      expect(`%q${stringStart}a\\bc${stringEnd}`).toMatchFormat()
    );

    test.each(cases)("%Q%s%s", (stringStart, stringEnd) =>
      expect(`%Q${stringStart}a\\bc${stringEnd}`).toMatchFormat()
    );
  });

  describe("with single quotes", () => {
    test("empty single quote strings stay", () => expect("''").toMatchFormat());

    test("empty double quote strings change", () =>
      expect(`""`).toChangeFormat("''"));

    test("basic strings with single quotes stay", () =>
      expect("'abc'").toMatchFormat());

    test("basic strings with double quotes change", () =>
      expect(`"abc"`).toChangeFormat("'abc'"));

    test("double quotes with inner single quotes stay", () =>
      expect(`"abc's"`).toMatchFormat());

    describe("escape sequences", () => {
      test("single quotes stay", () => expect("'abc\\n'").toMatchFormat());

      test("double quotes stay", () => expect(`"abc\\n"`).toMatchFormat());

      test("interpolation within single quotes stay", () =>
        expect(`'#{"\\n"}'`).toMatchFormat());

      test("interpolation within double quotes stay", () =>
        expect(`"#{"\\n"}"`).toMatchFormat());

      test("escaped double quotes are not unquoted", () =>
        expect("'abc \\\"def\\\" ghi'").toMatchFormat());
    });
  });

  describe("with double quotes", () => {
    test("empty single quote strings change", () =>
      expect("''").toChangeFormat(`""`, { rubySingleQuote: false }));

    test("empty double quote strings stay", () =>
      expect(`""`).toMatchFormat({ rubySingleQuote: false }));

    test("basic strings with single quotes change", () =>
      expect("'abc'").toChangeFormat(`"abc"`, { rubySingleQuote: false }));

    test("basic strings with double quotes stay", () =>
      expect(`"abc"`).toMatchFormat({ rubySingleQuote: false }));

    test("double quotes with inner single quotes stay", () =>
      expect(`"abc's"`).toMatchFormat({ rubySingleQuote: false }));

    test("double quotes get escaped", () =>
      expect(`'"foo"'`).toChangeFormat(`"\\"foo\\""`, {
        rubySingleQuote: false
      }));

    describe("escape sequences", () => {
      test("single quotes stay", () => expect("'abc\\n'").toMatchFormat());

      test("double quotes stay", () => expect(`"abc\\n"`).toMatchFormat());

      test("interpolation within single quotes stay", () =>
        expect(`'#{"\\n"}'`).toMatchFormat());

      test("interpolation within double quotes stay", () =>
        expect(`"#{"\\n"}"`).toMatchFormat());
    });
  });

  describe("with %{} quotes", () => {
    test("matches correctly", () =>
      expect("%{foo\\n#{bar}\\nbaz}").toMatchFormat());
  });

  test("concatenation", () =>
    expect(`'abc' \\\n  'def' \\\n  'ghi'`).toMatchFormat());

  describe("interpolation", () => {
    test("with keywords", () => expect(`"abc #{super} abc"`).toMatchFormat());

    test("at the beginning of the string", () =>
      expect(`"#{abc} abc"`).toMatchFormat());

    test("very interpolated", () =>
      expect(`"abc #{"abc #{abc} abc"} abc"`).toMatchFormat());

    test("long strings with interpolation do not break", () =>
      expect(`"${long} #{foo[:bar]} ${long}"`).toMatchFormat());

    test("long strings with interpolation that were broken do break", () => {
      const content = ruby(`
        <<~HERE
          #{
          ${long}
        }
        HERE
      `);

      return expect(content).toMatchFormat();
    });

    test("within a heredoc there is no indentation", () => {
      const content = ruby(`
        <<~HERE
          #{${long}}
        HERE
      `);

      return expect(content).toMatchFormat();
    });
  });

  describe("char literals", () => {
    test("single chars get changed", () => expect("?a").toChangeFormat("'a'"));

    test("single chars get changed with double quotes", () =>
      expect("?a").toChangeFormat(`"a"`, { rubySingleQuote: false }));

    test("control escape sequences stay", () =>
      expect("?\\C-a").toMatchFormat());

    test("meta escape sequences stay", () => expect("?\\M-a").toMatchFormat());

    test("meta and control sequences stay", () =>
      expect("?\\M-\\C-a").toMatchFormat());
  });

  describe("xstrings", () => {
    test("backtick literals", () => expect("`abc`").toMatchFormat());

    test("breaking backtick literals", () =>
      expect(`\`${long}\``).toMatchFormat());

    test("breaking backtick literals with method chains", () =>
      expect(`\`${long}\`.to_s`).toMatchFormat());

    test("%x literals", () => expect("%x[abc]").toChangeFormat("`abc`"));

    test("breaking %x literals", () =>
      expect(`%x[${long}]`).toChangeFormat(`\`${long}\``));

    test("breaking %x literals with method chains", () =>
      expect(`%x[${long}].to_s`).toChangeFormat(`\`${long}\`.to_s`));
  });

  describe("symbols", () => {
    test("basic", () => expect(":abc").toMatchFormat());

    test("with single quotes", () => expect(":'abc'").toMatchFormat());

    test("with double quotes", () => expect(`:"abc"`).toChangeFormat(":'abc'"));

    test("with double quotes with double quotes desired", () =>
      expect(`:"abc"`).toMatchFormat({ rubySingleQuote: false }));

    test("with false interpolation and single quotes, no rubySingleQuote", () =>
      expect(":'abc#{foo}abc'").toMatchFormat({ rubySingleQuote: false }));

    test("with real interpolation and double quotes", () =>
      expect(`:"abc#{foo}abc"`).toMatchFormat());

    test("with real interpolation and double quotes, rubySingleQuote", () =>
      expect(`:"abc#{foo}abc"`).toMatchFormat({ rubySingleQuote: true }));

    test("%s literal", () => expect("%s[abc]").toChangeFormat(":'abc'"));

    test("%s literal with false interpolation", () =>
      expect("%s[abc#{d}]").toChangeFormat(":'abc#{d}'"));

    test("%s literal as hash key", () =>
      expect("{ %s[abc] => d }").toChangeFormat("{ 'abc': d }"));

    test("%s literal as hash key, no rubySingleQuote", () =>
      expect("{ %s[abc] => d }").toChangeFormat(`{ "abc": d }`, {
        rubySingleQuote: false
      }));

    test("symbol literal as a hash key", () =>
      expect("{ '\\d' => 1 }").toMatchFormat());

    test("%s literal with newlines", () => {
      const content = ruby(`
        a = %s[
          a
        ]
      `);

      return expect(content).toMatchFormat();
    });

    test("gets correct quotes", () => {
      const content = "where('lint_tool_configs.plugin': plugins + %w[core])";

      return expect(content).toMatchFormat();
    });
  });

  test.each(["@v", "@@v", "$v"])("%s dvar", (interp) => {
    expect(`"#${interp}"`).toChangeFormat(`"#{${interp}}"`);
  });
});
