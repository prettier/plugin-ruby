const { long, ruby } = require("./utils");

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
        #{<<-CHILD}
        This is an interpolated straight heredoc
        CHILD
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
          #{<<~CHILD}
            This is an interpolated squiggly heredoc
          CHILD
        PARENT
      `);

      return expect(content).toMatchFormat();
    });

    test("with a call and indented", () => {
      const content = ruby(`
        def foo
          <<~HERE.strip
            bar
          HERE
        end
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

  describe("with a call attached", () => {
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
        foo = <<~TEXT.strip
          bar
        TEXT
      `);

      return expect(content).toMatchFormat();
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
});
