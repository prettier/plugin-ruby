const { long, ruby } = require("./utils");

describe("method", () => {
  describe("definitions", () => {
    test("shorthand for empty methods", () =>
      expect("def foo; end").toMatchFormat());

    test("shorthand for empty methods with parens", () =>
      expect("def foo(); end").toMatchFormat());

    test("single arg, no parens", () =>
      expect("def foo bar\nend").toChangeFormat("def foo(bar); end"));

    test("single arg, with parens", () =>
      expect("def foo(bar)\nend").toChangeFormat("def foo(bar); end"));

    test("shorthand for empty singleton methods", () =>
      expect("def self.foo; end").toMatchFormat());

    test("shorthand for empty singleton methods with parens", () =>
      expect("def self.foo(); end").toMatchFormat());

    test("singleton, single arg, no parens", () =>
      expect("def self.foo bar\nend").toChangeFormat("def self.foo(bar); end"));

    test("singleton, single arg, with parens", () =>
      expect("def self.foo(bar)\nend").toChangeFormat(
        "def self.foo(bar); end"
      ));

    test("shorthand with a body", () =>
      expect("def foo(alpha); 1; end").toChangeFormat(
        "def foo(alpha)\n  1\nend"
      ));

    test("single splat arg with no name", () =>
      expect("def foo(*); end").toMatchFormat());

    test("double splat arg with no name", () =>
      expect("def foo(**); end").toMatchFormat());

    test("with helper method", () => {
      const content = ruby(`
        private def foo
          'bar'
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("with helper method on defs", () => {
      const content = ruby(`
        private def self.foo
          'bar'
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("every single arg type", () => {
      const content = ruby(`
        def method(req, *rest, post, kwarg:, kwarg_opt: 1, **kwarg_rest, &block)
          'foo'
        end
      `);

      return expect(content).toMatchFormat();
    });

    if (process.env.RUBY_VERSION >= "2.7") {
      test("nokw_param", () => expect("def foo(**nil); end").toMatchFormat());

      test("args_forward", () => {
        const content = ruby(`
          def foo(...)
            bar(...)
          end
        `);

        return expect(content).toMatchFormat();
      });
    }

    test("breaking", () =>
      expect(`def foo(${long}:, a${long}:); end`).toChangeFormat(
        ruby(`
        def foo(
          ${long}:,
          a${long}:
        ); end
      `)
      ));

    test("def/begin transform", () => {
      const content = ruby(`
        def foo
          begin
            try_something
          rescue SomeError => error
            handle_error(error)
          ensure
            this_always_happens
          end
        end
      `);

      const expected = ruby(`
        def foo
          try_something
        rescue SomeError => error
          handle_error(error)
        ensure
          this_always_happens
        end
      `);

      return expect(content).toChangeFormat(expected);
    });
  });

  describe("method calls", () => {
    test("empty parens", () => expect("foo()").toChangeFormat("foo"));

    test("single args", () => expect("foo(1)").toMatchFormat());

    test("multi arg", () => expect("foo(1, 2)").toMatchFormat());

    test("just block", () => expect("foo(&block)").toMatchFormat());

    describe("commands", () => {
      test("alignment", () => {
        const content = ruby(`
          command.call some_method(
                         ${long}
                       )
        `);

        return expect(content).toMatchFormat();
      });

      test("alignment for `to`", () => {
        const content = ruby(`
          expect(value).to matcher(
            ${long}
          )
        `);

        return expect(content).toMatchFormat();
      });

      test("alignment for `not_to`", () => {
        const content = ruby(`
          expect(value).not_to matcher(
            ${long}
          )
        `);

        return expect(content).toMatchFormat();
      });

      test("just block", () => {
        const content = ruby(`
          def curry(&block)
            new &block
          end
        `);

        return expect(content).toMatchFormat();
      });
    });

    describe("single splat", () => {
      test("plain", () => expect("foo(*bar)").toMatchFormat());

      test("with multi args", () => expect("foo(1, 2, *abc)").toMatchFormat());

      test("between multi args", () =>
        expect("foo(1, 2, *abc, 3, 4)").toMatchFormat());

      test("with block", () => expect("foo(*bar, &block)").toMatchFormat());
    });

    describe("double splat", () => {
      test("plain", () => expect("foo(**bar)").toMatchFormat());

      test("with block", () => expect("foo(**bar, &block)").toMatchFormat());

      test("with splat and block", () =>
        expect("foo(*bar, **baz, &lock)").toMatchFormat());

      test("after kwarg", () =>
        expect("foo(kwarg: 1, **splat)").toMatchFormat());

      test("before kwarg", () =>
        expect("foo(**splat, kwarg: 1)").toMatchFormat());

      test("before kwargs", () =>
        expect("foo(before: 1, **splat, after: 1)").toMatchFormat());
    });

    describe("different operators", () => {
      test("double colon gets changed", () =>
        expect("Foo::foo").toChangeFormat("Foo.foo"));

      test("lonely operator", () => expect("foo&.foo").toMatchFormat());
    });

    describe("breaking", () => {
      describe("without trailing commas", () => {
        test("starting with no trailing comma stays", () =>
          expect(`foo(${long}, a${long})`).toChangeFormat(
            `foo(\n  ${long},\n  a${long}\n)`
          ));

        test("starting with trailing comma changes", () =>
          expect(`foo(${long}, a${long},)`).toChangeFormat(
            `foo(\n  ${long},\n  a${long}\n)`
          ));

        test("with block on the end", () =>
          expect(`foo(${long}, &block)`).toChangeFormat(
            `foo(\n  ${long},\n  &block\n)`
          ));

        test("on commands", () =>
          expect(`command ${long}, a${long}`).toChangeFormat(
            ruby(`
            command ${long},
                    a${long}
          `)
          ));

        test("on command calls", () =>
          expect(`command.call ${long}, a${long}`).toChangeFormat(
            ruby(`
            command.call ${long},
                         a${long}
          `)
          ));
      });

      describe("with trailing commas", () => {
        test("starting with no trailing comma changes", () =>
          expect(`foo(${long}, a${long})`).toChangeFormat(
            `foo(\n  ${long},\n  a${long},\n)`,
            {
              addTrailingCommas: true
            }
          ));

        test("starting with trailing comma stays", () =>
          expect(`foo(${long}, a${long},)`).toChangeFormat(
            `foo(\n  ${long},\n  a${long},\n)`,
            {
              addTrailingCommas: true
            }
          ));

        test("with block on the end", () =>
          expect(`foo(${long}, &block)`).toChangeFormat(
            `foo(\n  ${long},\n  &block\n)`,
            {
              addTrailingCommas: true
            }
          ));

        test("on commands", () =>
          expect(`command ${long}, a${long}`).toChangeFormat(
            ruby(`
              command ${long},
                      a${long}
            `),
            { addTrailingCommas: true }
          ));

        test("on command calls", () =>
          expect(`command.call ${long}, a${long}`).toChangeFormat(
            ruby(`
              command.call ${long},
                           a${long}
            `),
            { addTrailingCommas: true }
          ));
      });
    });
  });
});
