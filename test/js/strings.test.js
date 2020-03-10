const { long, ruby } = require("./utils");

describe("strings", () => {
  test("with %q escaping", () => expect("%q|\\'|").toChangeFormat('"\\\'"'));

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

      test("escaped double quotes are unquoted", () =>
        expect("'abc \\\"def\\\" ghi'").toChangeFormat("'abc \"def\" ghi'"));
    });
  });

  describe("with double quotes", () => {
    test("empty single quote strings change", () =>
      expect("''").toChangeFormat(`""`, { preferSingleQuotes: false }));

    test("empty double quote strings stay", () =>
      expect(`""`).toMatchFormat({ preferSingleQuotes: false }));

    test("basic strings with single quotes change", () =>
      expect("'abc'").toChangeFormat(`"abc"`, { preferSingleQuotes: false }));

    test("basic strings with double quotes stay", () =>
      expect(`"abc"`).toMatchFormat({ preferSingleQuotes: false }));

    test("double quotes with inner single quotes stay", () =>
      expect(`"abc's"`).toMatchFormat({ preferSingleQuotes: false }));

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

    test("breaks interpolation on #{ ... } and not some inner node", () =>
      expect(`"${long} #{foo[:bar]} ${long}"`).toChangeFormat(
        ruby(`
        "${long} #{
          foo[:bar]
        } ${long}"
      `)
      ));
  });

  describe("char literals", () => {
    test("single chars get changed", () => expect("?a").toChangeFormat("'a'"));

    test("single chars get changed with double quotes", () =>
      expect("?a").toChangeFormat(`"a"`, { preferSingleQuotes: false }));

    test("control escape sequences stay", () =>
      expect("?\\C-a").toMatchFormat());

    test("meta escape sequences stay", () => expect("?\\M-a").toMatchFormat());

    test("meta and control sequences stay", () =>
      expect("?\\M-\\C-a").toMatchFormat());
  });

  describe("xstrings", () => {
    test("backtick literals", () => expect("`abc`").toMatchFormat());

    test("breaking backtick literals", () =>
      expect(`\`${long}\``).toChangeFormat(`\`${long}\``));

    test("breaking backtick literals with method chains", () =>
      expect(`\`${long}\`.to_s`).toChangeFormat(`\`${long}\`.to_s`));

    test("%x literals", () => expect("%x[abc]").toChangeFormat("`abc`"));

    test("breaking %x literals", () =>
      expect(`%x[${long}]`).toChangeFormat(`\`${long}\``));

    test("breaking %x literals with method chains", () =>
      expect(`%x[${long}].to_s`).toChangeFormat(`\`${long}\`.to_s`));
  });

  describe("dynamic symbols", () => {
    test("with single quotes", () => expect(":'abc'").toMatchFormat());

    test("with double quotes", () => expect(`:"abc"`).toMatchFormat());

    test("with false interpolation and single quotes", () =>
      expect(":'abc#{foo}abc'").toMatchFormat());

    test("with real interpolation and double quotes", () =>
      expect(`:"abc#{foo}abc"`).toMatchFormat());
  });

  describe("heredocs", () => {
    describe("straight", () => {
      test("basic", () => {
        const content = ruby(`
          <<-HERE
            This is a straight heredoc
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("with interpolation", () => {
        const content = ruby(`
          <<-HERE
            This is a straight heredoc
            #{interpolation}
            with interpolation
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("on an assignment", () => {
        const content = ruby(`
          abc = <<-HERE
            This is a straight heredoc on an assign
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("nested within another", () => {
        const content = ruby(`
          <<-PARENT
          This is a straight heredoc
          #{
            <<-CHILD
          This is an interpolated straight heredoc
          CHILD
          }
          PARENT
        `);

        return expect(content).toMatchFormat();
      });

      test("with embedded expressions", () => {
        const content = ruby(`
          <<-HERE
            ${long}
            ${long}
            #{id}
            ${long}
            ${long}
          HERE
        `);

        return expect(content).toMatchFormat();
      });
    });

    describe("squiggly heredocs", () => {
      test("basic", () => {
        const content = ruby(`
          <<~HERE
            This is a squiggly heredoc
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("with interpolation", () => {
        const content = ruby(`
          <<~HERE
            This is a squiggly heredoc
            #{interpolation}
            with interpolation
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("on an assignment", () => {
        const content = ruby(`
          abc = <<~HERE
            This is a squiggly heredoc on an assign
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("nested within another", () => {
        const content = ruby(`
          <<~PARENT
            This is a squiggly heredoc
            #{
            <<~CHILD
              This is an interpolated squiggly heredoc
              CHILD
          }
          PARENT
        `);

        return expect(content).toMatchFormat();
      });
    });

    describe("as an argument", () => {
      test("on calls", () => {
        const content = ruby(`
          call(1, 2, 3, <<-HERE)
            foo
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("on calls with multiple", () => {
        const content = ruby(`
          call(1, 2, 3, <<-HERE, <<-THERE)
            here
          HERE
            there
          THERE
        `);

        return expect(content).toMatchFormat();
      });

      test("on commands", () => {
        const content = ruby(`
          command 1, 2, 3, <<-HERE
            foo
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("on commands with multiple", () => {
        const content = ruby(`
          command 1, 2, 3, <<-HERE, <<-THERE
            here
          HERE
            there
          THERE
        `);

        return expect(content).toMatchFormat();
      });

      test("on command calls", () => {
        const content = ruby(`
          command.call 1, 2, 3, <<-HERE
            foo
          HERE
        `);

        return expect(content).toMatchFormat();
      });

      test("on command calls with multiple", () => {
        const content = ruby(`
          command.call 1, 2, 3, <<-HERE, <<-THERE
            here
          HERE
            there
          THERE
        `);

        return expect(content).toMatchFormat();
      });
    });
  });
});
