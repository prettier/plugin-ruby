import { long, ruby } from "../../utils.js";

describe("heredocs", () => {
  describe("straight", () => {
    test("basic", () => {
      const content = ruby(`
        <<-HERE
          This is a straight heredoc
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("with interpolation", () => {
      const content = ruby(`
        <<-HERE
          This is a straight heredoc
          #{interpolation}
          with interpolation
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("on an assignment", () => {
      const content = ruby(`
        abc = <<-HERE
          This is a straight heredoc on an assign
        HERE
      `);

      expect(content).toMatchFormat();
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

      expect(content).toMatchFormat();
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

      expect(content).toMatchFormat();
    });

    test("with a call and indented", () => {
      const content = ruby(`
        def foo
          <<-HERE.strip
            bar
          HERE
        end
      `);

      expect(content).toMatchFormat();
    });
  });

  describe("squiggly heredocs", () => {
    test("basic", () => {
      const content = ruby(`
        <<~HERE
          This is a squiggly heredoc
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("with interpolation", () => {
      const content = ruby(`
        <<~HERE
          This is a squiggly heredoc
          #{interpolation}
          with interpolation
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("on an assignment", () => {
      const content = ruby(`
        abc = <<~HERE
          This is a squiggly heredoc on an assign
        HERE
      `);

      expect(content).toMatchFormat();
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

      expect(content).toMatchFormat();
    });

    test("with a call and indented", () => {
      const content = ruby(`
        def foo
          <<~HERE.strip
            bar
          HERE
        end
      `);

      expect(content).toMatchFormat();
    });
  });

  describe("as an argument", () => {
    test("on calls", () => {
      const content = ruby(`
        call(1, 2, 3, <<-HERE)
          foo
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("on calls with multiple", () => {
      const content = ruby(`
        call(1, 2, 3, <<-HERE, <<-THERE)
          here
        HERE
          there
        THERE
      `);

      expect(content).toMatchFormat();
    });

    test("on commands", () => {
      const content = ruby(`
        command 1, 2, 3, <<-HERE
          foo
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("on commands with multiple", () => {
      const content = ruby(`
        command 1, 2, 3, <<-HERE, <<-THERE
          here
        HERE
          there
        THERE
      `);

      expect(content).toMatchFormat();
    });

    test("on command calls", () => {
      const content = ruby(`
        command.call 1, 2, 3, <<-HERE
          foo
        HERE
      `);

      expect(content).toMatchFormat();
    });

    test("on command calls with multiple", () => {
      const content = ruby(`
        command.call 1, 2, 3, <<-HERE, <<-THERE
          here
        HERE
          there
        THERE
      `);

      expect(content).toMatchFormat();
    });
  });

  describe("with a call attached", () => {
    test("squiggly no indent", () => {
      const content = ruby(`
        foo = <<~TEXT.strip
        bar
        TEXT
      `);

      expect(content).toMatchFormat();
    });

    test("squiggly indent", () => {
      const content = ruby(`
        foo = <<~TEXT.strip
          bar
        TEXT
      `);

      expect(content).toMatchFormat();
    });

    test("straight no indent", () => {
      const content = ruby(`
        foo = <<-TEXT.strip
        bar
        TEXT
      `);

      expect(content).toMatchFormat();
    });
  });

  test("as args w/ long hash key after heredoc", () => {
    const content = ruby(`
      foo(
        <<~FOO,
          foo
        FOO
        ${long}:
          "bar"
      )
    `);

    expect(content).toMatchFormat();
  });

  test("arg w/ block", () => {
    const content = ruby(`
      puts(<<~TEXT
        Hello
      TEXT
      ) { "sample block" }
    `);

    const expected = ruby(`
      puts(<<~TEXT) { "sample block" }
        Hello
      TEXT
    `);

    expect(content).toChangeFormat(expected);
  });

  test("in an activerecord scope arg w/ chaining", () => {
    const content = ruby(`
      scope :late_for_checkin, -> {
        select(
          <<~EOS.squish
            some complicated query here
          EOS
        )
          .data_push
          .having("something")
      }
    `);

    const expected = ruby(`
      scope :late_for_checkin,
            -> { select(<<~EOS.squish).data_push.having("something") }
            some complicated query here
          EOS
    `);

    expect(content).toChangeFormat(expected);
  });

  test("long breakable arg after heredoc literal", () => {
    const content = ruby(`
      p <<-BAR, [${long}]
        text
      BAR
    `);

    const expected = ruby(`
      p <<-BAR,
        text
      BAR
        [
          ${long}
        ]
    `);

    expect(content).toChangeFormat(expected);
  });

  test("call w/ short breakable arg after heredoc literal", () => {
    const content = ruby(`
      p(<<-BAR, ["value", "value", 125_484, 0o24024103])
        text
      BAR
    `);

    expect(content).toMatchFormat();
  });

  test("on calls", () => {
    const content = ruby(`
      call(1, 2, 3, <<-HERE) do
        foo
      HERE
        puts "more code"
      end
    `);

    const expected = ruby(`
      call(1, 2, 3, <<-HERE) { puts "more code" }
        foo
      HERE
    `);

    expect(content).toChangeFormat(expected);
  });

  test("on calls with trailing arguments", () => {
    const content = ruby(`
      call(1, <<-HERE, 2)
        foo
      HERE
    `);

    expect(content).toMatchFormat();
  });

  test("in parens args with trailing args after", () => {
    const content = ruby(`
      Foo.new(<<-ARG1, "test2")
        test1 line 1
        test1 line 2
      ARG1
    `);

    expect(content).toMatchFormat();
  });

  test("in paren args with a call", () => {
    const content = ruby(`
      Foo.new(<<~ARG1.upcase.chomp, "test2")
        test1 line 1
        test1 line 2
      ARG1
    `);

    expect(content).toMatchFormat();
  });

  test("on calls with multiple", () => {
    const content = ruby(`
      call(1, 2, 3, <<-HERE, <<-THERE)
        here
      HERE
        there
      THERE
    `);

    expect(content).toMatchFormat();
  });

  test("on commands", () => {
    const content = ruby(`
      command 1, 2, 3, <<-HERE
        foo
      HERE
    `);

    expect(content).toMatchFormat();
  });

  test("on commands with multiple", () => {
    const content = ruby(`
        command 1, 2, 3, <<-HERE, <<-THERE
          here
        HERE
          there
        THERE
      `);

    expect(content).toMatchFormat();
  });

  test("on command calls with trailing arg", () => {
    const content = ruby(`
      command.call 1, 2, 3, <<-HERE, 4
        foo
      HERE
    `);

    expect(content).toMatchFormat();
  });

  test("on command calls with multiple", () => {
    const content = ruby(`
      command.call 1, 2, 3, <<-HERE, <<-THERE
        here
      HERE
          there
      THERE
    `);

    expect(content).toMatchFormat();
  });

  test("assign with call", () => {
    const content = ruby(`
      foo = <<~TEXT.strip
        bar
      TEXT
    `);

    expect(content).toMatchFormat();
  });

  test("assign with squiggly indent", () => {
    const content = ruby(`
      foo = (<<~TEXT
        bar
      TEXT
      ).strip
    `);

    expect(content).toChangeFormat(
      ruby(`
        foo = (<<~TEXT).strip
          bar
        TEXT
      `)
    );
  });

  test("assign with straight no indent", () => {
    const content = ruby(`
      foo = <<-TEXT.strip
      bar
      TEXT
    `);

    expect(content).toMatchFormat();
  });

  test("with a call and indented", () => {
    const content = ruby(`
      def foo
        <<-HERE.strip
          bar
        HERE
      end
    `);

    expect(content).toMatchFormat();
  });

  test("with a method call", () => {
    const content = ruby(`
      <<-HERE.strip.chomp
        This is a straight heredoc
        with two method calls
      HERE
    `);

    expect(content).toMatchFormat();
  });

  test("with two calls and indented", () => {
    const content = ruby(`
      def foo
        <<~HERE.strip.chomp
          bar
        HERE
      end
    `);

    expect(content).toMatchFormat();
  });

  test("xstring", () => {
    const content = ruby(`
      <<-\`SHELL\`
        ls
      SHELL
    `);

    expect(content).toMatchFormat();
  });

  test("with a comment after the declaration", () => {
    const content = ruby(`
      <<~HERE # foo
        foo
      HERE
    `);

    expect(content).toMatchFormat();
  });

  test("with a comment after the declaration in a call", () => {
    const content = ruby(`
      list << <<~HERE # foo
        foo
      HERE
    `);

    expect(content).toMatchFormat();
  });

  test("spilling out from another node keeps subsequent formatting", () => {
    const content = ruby(`
      foo { <<~BAR.baz }
        qux
      BAR
      qaz
    `);

    expect(content).toMatchFormat();
  });
});
