import { atLeastVersion, long, ruby } from "../../utils.js";

describe("method", () => {
  describe("definitions", () => {
    test("shorthand for empty methods", () => {
      return expect("def foo; end").toChangeFormat("def foo\nend");
    });

    test("shorthand for empty methods with parens", () => {
      return expect("def foo(); end").toChangeFormat("def foo()\nend");
    });

    test("single arg, no parens", () => {
      return expect("def foo bar\nend").toChangeFormat("def foo(bar)\nend");
    });

    test("single arg, with parens", () => {
      return expect("def foo(bar)\nend").toMatchFormat();
    });

    test("shorthand for empty singleton methods", () => {
      return expect("def self.foo; end").toChangeFormat("def self.foo\nend");
    });

    test("shorthand for empty singleton methods with parens", () => {
      return expect("def self.foo(); end").toChangeFormat(
        "def self.foo()\nend"
      );
    });

    test("singleton, single arg, no parens", () => {
      return expect("def self.foo bar\nend").toChangeFormat(
        "def self.foo(bar)\nend"
      );
    });

    test("singleton, single arg, with parens", () => {
      return expect("def self.foo(bar)\nend").toMatchFormat();
    });

    test("shorthand with a body", () => {
      return expect("def foo(alpha); 1; end").toChangeFormat(
        "def foo(alpha)\n  1\nend"
      );
    });

    test("single splat arg with no name", () => {
      return expect("def foo(*); end").toChangeFormat("def foo(*)\nend");
    });

    test("double splat arg with no name", () => {
      return expect("def foo(**); end").toChangeFormat("def foo(**)\nend");
    });

    test("with helper method", () => {
      const content = ruby(`
        private def foo
          "bar"
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("with helper method on defs", () => {
      const content = ruby(`
        private def self.foo
          "bar"
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("every single arg type", () => {
      const content = ruby(`
        def method(req, *rest, post, kwarg:, kwarg_opt: 1, **kwarg_rest, &block)
          "foo"
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("breaking", () => {
      const content = `def foo(${long}:, a${long}:); end`;
      const expected = ruby(`
        def foo(
          ${long}:,
          a${long}:
        )
        end
      `);

      return expect(content).toChangeFormat(expected);
    });

    test("with comments on method definition", () => {
      const content = ruby(`
        def foo( # bar
          ${long}:
        )
          ${long}
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("with comments on params", () => {
      const content = ruby(`
        def method(
          req, # req comment
          *rest, # rest comment
          post, # post comment
          kwarg:, # kwarg comment
          kwarg_opt: 1, # kwarg_opt comment
          **kwarg_rest, # kwarg_rest comment
          &block # block comment
        )
          "foo"
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("with comments on optional params", () => {
      const content = ruby(`
        def method(
          optl = "value" # comment
        )
          "foo"
        end
      `);

      return expect(content).toMatchFormat();
    });

    if (atLeastVersion("2.7")) {
      test("nokw_param", () => {
        return expect("def foo(**nil); end").toChangeFormat(
          "def foo(**nil)\nend"
        );
      });

      test("args_forward", () => {
        const content = ruby(`
          def foo(...)
            bar(...)
          end
        `);

        return expect(content).toMatchFormat();
      });
    }

    if (atLeastVersion("3.0")) {
      test("args_forward with other arguments", () => {
        const content = ruby(`
          def get(...)
            request(:get, ...)
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("single-line methods", () => {
        return expect("def foo = bar").toMatchFormat();
      });

      test("single-line methods with params", () => {
        return expect("def foo(name) = bar").toMatchFormat();
      });
    }

    test("comments on kwargs", () => {
      const content = ruby(`
        def foo(
          bar:, # hello
          baz:
        )
          bar
        end
      `);

      return expect(content).toMatchFormat();
    });
  });

  describe("method calls", () => {
    test("empty parens", () => {
      return expect("foo()").toChangeFormat("foo");
    });

    test("single args", () => {
      return expect("foo(1)").toMatchFormat();
    });

    test("multi arg", () => {
      return expect("foo(1, 2)").toMatchFormat();
    });

    test("just block", () => {
      return expect("foo(&block)").toMatchFormat();
    });

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

      test("alignment for `to_not`", () => {
        const content = ruby(`
          expect(value).to_not matcher(
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
      test("plain", () => {
        return expect("foo(*bar)").toMatchFormat();
      });

      test("with multi args", () => {
        return expect("foo(1, 2, *abc)").toMatchFormat();
      });

      test("between multi args", () => {
        return expect("foo(1, 2, *abc, 3, 4)").toMatchFormat();
      });

      test("with comments", () => {
        const content = ruby(`
          foo(
            # comment
            # another comment
            # even more comment
            *values
          )
        `);

        return expect(content).toMatchFormat();
      });

      test("with trailing comments", () => {
        const content = ruby(`
          foo(
            # comment
            # another comment
            *values # a trailing comment
            # a whole other comment
          )
        `);

        return expect(content).toMatchFormat();
      });

      test("with block", () => {
        return expect("foo(*bar, &block)").toMatchFormat();
      });

      test("with comments and block", () => {
        const content = ruby(`
          foo(
            # comment
            &block
          )
        `);

        return expect(content).toMatchFormat();
      });
    });

    describe("double splat", () => {
      test("plain", () => {
        return expect("foo(**bar)").toMatchFormat();
      });

      test("with block", () => {
        return expect("foo(**bar, &block)").toMatchFormat();
      });

      test("with splat and block", () => {
        return expect("foo(*bar, **baz, &block)").toMatchFormat();
      });

      test("after kwarg", () => {
        return expect("foo(kwarg: 1, **splat)").toMatchFormat();
      });

      test("before kwarg", () => {
        return expect("foo(**splat, kwarg: 1)").toMatchFormat();
      });

      test("before kwargs", () => {
        return expect("foo(before: 1, **splat, after: 1)").toMatchFormat();
      });
    });

    describe("different operators", () => {
      test("double colon gets changed", () => {
        return expect("Foo::foo").toChangeFormat("Foo.foo");
      });

      test("lonely operator", () => {
        return expect("foo&.foo").toMatchFormat();
      });
    });

    describe("breaking", () => {
      describe("without trailing commas", () => {
        test("starting with no trailing comma stays", () => {
          return expect(`foo(${long}, a${long})`).toChangeFormat(
            `foo(\n  ${long},\n  a${long}\n)`
          );
        });

        test("with breaking ternary as first argument", () => {
          return expect(`foo bar ? ${long} : a${long}`).toChangeFormat(
            `foo(\n  if bar\n    ${long}\n  else\n    a${long}\n  end\n)`
          );
        });

        test("starting with trailing comma changes", () => {
          return expect(`foo(${long}, a${long},)`).toChangeFormat(
            `foo(\n  ${long},\n  a${long}\n)`
          );
        });

        test("with block on the end", () => {
          return expect(`foo(${long}, &block)`).toChangeFormat(
            `foo(\n  ${long},\n  &block\n)`
          );
        });

        test("on commands", () => {
          return expect(`command ${long}, a${long}`).toChangeFormat(
            ruby(`
              command ${long},
                      a${long}
            `)
          );
        });

        test("on command calls", () => {
          return expect(`command.call ${long}, a${long}`).toChangeFormat(
            ruby(`
              command.call ${long},
                           a${long}
            `)
          );
        });
      });
    });
  });
});
