import { long, ruby } from "../../utils.js";

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
    test("empty single quote strings stay", () => {
      return expect("''").toChangeFormat(`""`);
    });

    test("empty double quote strings change", () => {
      return expect(`""`).toMatchFormat();
    });

    test("basic strings with single quotes stay", () => {
      return expect("'abc'").toChangeFormat(`"abc"`);
    });

    test("basic strings with double quotes change", () => {
      return expect(`"abc"`).toMatchFormat();
    });

    test("double quotes with inner single quotes stay", () => {
      return expect(`"abc's"`).toMatchFormat();
    });

    describe("escape sequences", () => {
      test("single quotes stay", () => {
        return expect("'abc\\n'").toMatchFormat();
      });

      test("double quotes stay", () => {
        return expect(`"abc\\n"`).toMatchFormat();
      });

      test("interpolation within single quotes stay", () => {
        return expect(`'#{"\\n"}'`).toMatchFormat();
      });

      test("interpolation within double quotes stay", () => {
        return expect(`"#{"\\n"}"`).toMatchFormat();
      });

      test("escaped double quotes are not unquoted", () => {
        return expect("'abc \\\"def\\\" ghi'").toMatchFormat();
      });
    });
  });

  describe("with double quotes", () => {
    test("empty single quote strings change", () => {
      return expect("''").toChangeFormat(`""`);
    });

    test("empty double quote strings stay", () => {
      return expect(`""`).toMatchFormat();
    });

    test("basic strings with single quotes change", () => {
      return expect("'abc'").toChangeFormat(`"abc"`);
    });

    test("basic strings with double quotes stay", () => {
      return expect(`"abc"`).toMatchFormat();
    });

    test("double quotes with inner single quotes stay", () => {
      return expect(`"abc's"`).toMatchFormat();
    });

    test("double quotes do not get escaped if it results in more quotes", () => {
      return expect(`'"foo"'`).toMatchFormat();
    });

    describe("escape sequences", () => {
      test("single quotes stay", () => {
        return expect("'abc\\n'").toMatchFormat();
      });

      test("double quotes stay", () => {
        return expect(`"abc\\n"`).toMatchFormat();
      });

      test("interpolation within single quotes stay", () => {
        return expect(`'#{"\\n"}'`).toMatchFormat();
      });

      test("interpolation within double quotes stay", () => {
        return expect(`"#{"\\n"}"`).toMatchFormat();
      });
    });
  });

  describe("with %{} quotes", () => {
    test("matches correctly", () => {
      return expect("%{foo\\n#{bar}\\nbaz}").toMatchFormat();
    });
  });

  test("concatenation", () => {
    return expect(`"abc" \\\n  "def" \\\n  "ghi"`).toMatchFormat();
  });

  describe("interpolation", () => {
    test("with keywords", () => {
      return expect(`"abc #{super} abc"`).toMatchFormat();
    });

    test("at the beginning of the string", () => {
      return expect(`"#{abc} abc"`).toMatchFormat();
    });

    test("very interpolated", () => {
      return expect(`"abc #{"abc #{abc} abc"} abc"`).toMatchFormat();
    });

    test("long strings with interpolation do not break", () => {
      return expect(`"${long} #{foo[:bar]} ${long}"`).toMatchFormat();
    });

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
    test("single chars get changed", () => {
      return expect("?a").toChangeFormat(`"a"`);
    });

    test("single chars get changed with double quotes", () => {
      return expect("?a").toChangeFormat(`"a"`);
    });

    test("control escape sequences stay", () => {
      return expect("?\\C-a").toMatchFormat();
    });

    test("meta escape sequences stay", () => {
      return expect("?\\M-a").toMatchFormat();
    });

    test("meta and control sequences stay", () => {
      return expect("?\\M-\\C-a").toMatchFormat();
    });
  });

  describe("xstrings", () => {
    test("backtick literals", () => {
      return expect("`abc`").toMatchFormat();
    });

    test("breaking backtick literals", () => {
      return expect(`\`${long}\``).toMatchFormat();
    });

    test("breaking backtick literals with method chains", () => {
      return expect(`\`${long}\`.to_s`).toMatchFormat();
    });

    test("%x literals", () => {
      return expect("%x[abc]").toChangeFormat("`abc`");
    });

    test("breaking %x literals", () => {
      return expect(`%x[${long}]`).toChangeFormat(`\`${long}\``);
    });

    test("breaking %x literals with method chains", () => {
      return expect(`%x[${long}].to_s`).toChangeFormat(`\`${long}\`.to_s`);
    });
  });

  describe("symbols", () => {
    test("basic", () => {
      return expect(":abc").toMatchFormat();
    });

    test("with single quotes", () => {
      return expect(":'abc'").toChangeFormat(`:"abc"`);
    });

    test("with double quotes", () => {
      return expect(`:"abc"`).toMatchFormat();
    });

    test("with double quotes with double quotes desired", () => {
      return expect(`:"abc"`).toMatchFormat();
    });

    test("with real interpolation and double quotes", () => {
      return expect(`:"abc#{foo}abc"`).toMatchFormat();
    });

    test("%s literal", () => {
      return expect("%s[abc]").toChangeFormat(`:"abc"`);
    });

    test("%s literal with false interpolation", () => {
      return expect("%s[abc#{d}]").toChangeFormat(`:'abc#{d}'`);
    });

    test("%s literal as hash key", () => {
      return expect("{ %s[abc] => d }").toChangeFormat(`{ abc: d }`);
    });

    test("symbol literal as a hash key", () => {
      return expect("{ '\\d' => 1 }").toMatchFormat();
    });

    test("%s literal with newlines", () => {
      const content = ruby(`
        a = %s[
          a
        ]
      `);

      return expect(content).toMatchFormat();
    });

    test("gets correct quotes", () => {
      const content = `where("lint_tool_configs.plugin": plugins + %w[core])`;

      return expect(content).toMatchFormat();
    });
  });

  test.each(["@v", "@@v", "$v"])("%s dvar", (interp) => {
    return expect(`"#${interp}"`).toChangeFormat(`"#{${interp}}"`);
  });
});
