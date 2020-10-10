const { ruby } = require("./utils");

describe("args", () => {
  describe("heredocs", () => {
    test("#586 - long hash key after heredoc", () => {
      const content = ruby(`
        def foo(*); end

        foo(
          <<~FOO,
            foo
          FOO
          named_argument_that_is_quite_long_so_it_doesnt_fit_on_one_line_with_the_heredoc: 'bar',
        )
      `);

      return expect(content).toChangeFormat(
        ruby(`
          def foo(*); end

          foo(
            <<~FOO,
              foo
            FOO
            named_argument_that_is_quite_long_so_it_doesnt_fit_on_one_line_with_the_heredoc:
              'bar'
          )
        `)
      );
    });

    test("#301 - heredoc arg w/ block", () => {
      const content = ruby(`
        puts(<<~TEXT
          Hello
        TEXT
        ) { "sample block" }
      `);

      return expect(content).toChangeFormat(
        ruby(`
          puts(<<~TEXT) { 'sample block' }
            Hello
          TEXT
        `)
      );
    });

    test("#301 - in an activerecord scope arg w/ chaining", () => {
      const content = ruby(`
        scope :late_for_checkin, -> {
          select(
            <<-EOS.squish
              devices.*, (
                SELECT device_readings.id
                FROM device_readings
                WHERE device_readings.device_id = devices.id
                  AND device_readings.taken_at > DATE_SUB(NOW(), INTERVAL (frequency * 2) MINUTE)
                LIMIT 1
              ) AS reading_id
            EOS
          )
            .data_push
            .having("reading_id IS NULL")
        }
      `);

      return expect(content).toChangeFormat(
        ruby(`
          scope :late_for_checkin,
                -> { select(<<-EOS.squish).data_push.having('reading_id IS NULL') }
                devices.*, (
                  SELECT device_readings.id
                  FROM device_readings
                  WHERE device_readings.device_id = devices.id
                    AND device_readings.taken_at > DATE_SUB(NOW(), INTERVAL (frequency * 2) MINUTE)
                  LIMIT 1
                ) AS reading_id
              EOS
       `)
      );
    });

    test("#586 - long breakable arg after heredoc literal", () => {
      const content = ruby(`
        p <<-BAR, ['value', 'value', 'value', 'value', 'value', 'value', 'value', 'value', 125484, 024024103]
          text
        BAR
      `);

      return expect(content).toChangeFormat(
        ruby(`
          p <<-BAR,
            text
          BAR
            [
              'value',
              'value',
              'value',
              'value',
              'value',
              'value',
              'value',
              'value',
              125_484,
              0o24024103
            ]
        `)
      );
    });

    test("#586 - call w/ short breakable arg after heredoc literal", () => {
      const content = ruby(`
        p(<<-BAR, ['value', 'value', 125_484, 0o24024103])
          text
        BAR
      `);

      return expect(content).toMatchFormat();
    });

    test("on calls", () => {
      const content = ruby(`
          call(1, 2, 3, <<-HERE) do
           foo
          HERE
            puts 'more code'
          end
        `);

      return expect(content).toChangeFormat(
        ruby(`
          call(1, 2, 3, <<-HERE) { puts 'more code' }
           foo
          HERE
        `)
      );
    });

    test("on calls with trailing arguments", () => {
      const content = ruby(`
          call(1, <<-HERE, 2)
            foo
          HERE
        `);

      return expect(content).toMatchFormat();
    });

    test("in parens args with trailing args after", () => {
      const content = ruby(`
          Foo.new(<<-ARG1, 'test2')
            test1 line 1
            test1 line 2
          ARG1
        `);

      return expect(content).toMatchFormat();
    });

    test("in paren args with a call", () => {
      const content = ruby(`
        Foo.new(<<~ARG1.upcase.chomp, 'test2')
          test1 line 1
          test1 line 2
        ARG1
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

    test("on command calls with trailing arg", () => {
      const content = ruby(`
        command.call 1, 2, 3, <<-HERE, 4
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
