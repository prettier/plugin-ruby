const { ruby } = require("./utils");

describe("calls", () => {
  describe("on heredocs", () => {
    test("squiggly no indent", () => {
      const content = ruby(`
        foo = <<~TEXT.strip
          bar
        TEXT
      `);

      return expect(content).toMatchFormat();
    });

    test("squiggly indent", () => {
      const content = ruby(`
        foo = (<<~TEXT
          bar
        TEXT
        ).strip
      `);

      return expect(content).toChangeFormat(
        ruby(`
          foo = (<<~TEXT).strip
            bar
          TEXT
        `)
      );
    });

    test("straight no indent", () => {
      const content = ruby(`
        foo = <<-TEXT.strip
        bar
        TEXT
      `);

      return expect(content).toMatchFormat();
    });
  });

  test("with a call and indented", () => {
    const content = ruby(`
      def foo
        <<-HERE.strip
          bar
        HERE
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("with a method call", () => {
    const content = ruby(`
      <<-HERE.strip.chomp
        This is a straight heredoc
        with two method calls
      HERE
    `);

    return expect(content).toMatchFormat();
  });

  test("with two calls and indented", () => {
    const content = ruby(`
      def foo
        <<~HERE.strip.chomp
          bar
        HERE
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("with a long list of calls and line length", () => {
    const content = ruby(`
      <<~HERE.strip.chomp.split.concat(['one']).join.gsub(/one|two|three|four/, 'number').gsub('®', '').reverse
        bar
      HERE
    `);

    return expect(content).toChangeFormat(
      ruby(`
        <<~HERE.strip.chomp.split.concat(%w[one]).join.gsub(
          bar
        HERE
          /one|two|three|four/,
          'number'
        ).gsub('®', '').reverse
    `)
    );
  });
});
