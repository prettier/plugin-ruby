const { long, ruby } = require("./utils");

describe("conditionals", () => {
  describe("not operator", () => {
    // from ruby test/ruby/test_not.rb
    test("not operator, empty parens", () =>
      expect("assert_equal(true, (not ()))").toMatchFormat());

    test("not operator from within a ternary adds parens", () => {
      return expect("a ? not(b) : c").toMatchFormat();
    });

    test("not operator from within an if/else adds parens", () => {
      const content = ruby(`
        if a
          not b
        else
          c
        end
      `);

      return expect(content).toChangeFormat("a ? not(b) : c");
    });
  });

  describe("when inline allowed", () => {
    describe.each(["if", "unless"])("%s keyword", (keyword) => {
      test("inline stays", () => expect(`1 ${keyword} a`).toMatchFormat());

      test("multi line changes", () =>
        expect(`${keyword} a\n  1\nend`).toChangeFormat(`1 ${keyword} a`));

      test("inline breaking changes", () =>
        expect(`${long} ${keyword} ${long}`).toChangeFormat(
          `${keyword} ${long}\n  ${long}\nend`
        ));

      test("multi line breaking stays", () =>
        expect(`${keyword} ${long}\n  ${long}\nend`).toMatchFormat());

      test("not operator", () => expect(`b ${keyword} not a`).toMatchFormat());

      test("empty first body", () => {
        const content = ruby(`
          ${keyword} a
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("empty first body with present second body", () => {
        const content = ruby(`
          ${keyword} a

          else
            b
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("comment in body", () => {
        const content = ruby(`
          ${keyword} a
            # comment
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("comment on node in body", () => {
        const content = ruby(`
          ${keyword} a
            break # comment
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("breaks if the predicate is an assignment", () => {
        const content = ruby(`
          array.each do |element|
            ${keyword} index = difference.index(element)
              difference.delete_at(index)
            end
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("align long predicates", () =>
        expect(`foo ${keyword} ${long} || ${long}a`).toChangeFormat(
          ruby(`
            ${keyword} ${long} ||
                ${Array(keyword.length).fill().join(" ")}${long}a
              foo
            end
          `)
        ));

      test("wraps single lines in parens when assigning", () =>
        expect(`hash[:key] = ${keyword} false then :value end`).toChangeFormat(
          `hash[:key] = (:value ${keyword} false)`
        ));
    });
  });

  describe("when inline not allowed", () => {
    describe.each(["if", "unless"])("%s keyword", (keyword) => {
      test("inline changes", () =>
        expect(`1 ${keyword} a`).toChangeFormat(`${keyword} a\n  1\nend`, {
          inlineConditionals: false
        }));

      test("multi line stays", () =>
        expect(`${keyword} a\n  1\nend`).toMatchFormat({
          inlineConditionals: false
        }));

      test("inline breaking changes", () =>
        expect(`${long} ${keyword} ${long}`).toChangeFormat(
          `${keyword} ${long}\n  ${long}\nend`,
          {
            inlineConditionals: false
          }
        ));

      test("multi line breaking stays", () =>
        expect(`${keyword} ${long}\n  ${long}\nend`).toMatchFormat({
          inlineConditionals: false
        }));

      test("not operator", () =>
        expect(`${keyword} not a\n  b\nend`).toMatchFormat({
          inlineConditionals: false
        }));

      test("empty first body", () => {
        const content = ruby(`
          ${keyword} a
          end
        `);

        return expect(content).toMatchFormat({ inlineConditionals: false });
      });

      test("empty first body with present second body", () => {
        const content = ruby(`
          ${keyword} a

          else
            b
          end
        `);

        return expect(content).toMatchFormat({ inlineConditionals: false });
      });

      test("comment in body", () => {
        const content = ruby(`
          ${keyword} a
            # comment
          end
        `);

        return expect(content).toMatchFormat({ inlineConditionals: false });
      });

      test("comment on node in body", () => {
        const content = ruby(`
          ${keyword} a
            break # comment
          end
        `);

        return expect(content).toMatchFormat({ inlineConditionals: false });
      });

      test("align long predicates", () =>
        expect(`foo ${keyword} ${long} || ${long}a`).toChangeFormat(
          ruby(`
          ${keyword} ${long} ||
              ${Array(keyword.length).fill().join(" ")}${long}a
            foo
          end
        `)
        ));
    });
  });

  describe("ternaries", () => {
    test("non-breaking", () => expect("a ? 1 : 2").toMatchFormat());

    test("breaking", () =>
      expect(`a ? ${long} : ${long}`).toChangeFormat(
        ruby(`
        if a
          ${long}
        else
          ${long}
        end
      `)
      ));

    test("transform from if/else", () => {
      const content = ruby(`
        if a
          1
        else
          2
        end
      `);

      return expect(content).toChangeFormat("a ? 1 : 2");
    });

    test("transform for unless/else", () => {
      const content = ruby(`
        unless a
          1
        else
          2
        end
      `);

      return expect(content).toChangeFormat("a ? 2 : 1");
    });

    test("adds parens if inside of a call", () => {
      const content = ruby(`
        if a
          1
        else
          2
        end.to_s
      `);

      return expect(content).toChangeFormat("(a ? 1 : 2).to_s");
    });

    test("does not add parens if it breaks", () => {
      const content = ruby(`
        if a
          ${long}
        else
          2
        end.to_s
      `);

      return expect(content).toMatchFormat();
    });

    test("adds parens if inside of a binary", () => {
      const content = ruby(`
        if a
          1
        else
          2
        end + 1
      `);

      return expect(content).toChangeFormat("(a ? 1 : 2) + 1");
    });

    describe("unable to transform", () => {
      test("breaking", () => {
        const content = ruby(`
          if a
            ${long}
          else
            ${long}
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("command in if body", () => {
        const content = ruby(`
          if a
            b 1
          else
            b(2)
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("command in else body", () => {
        const content = ruby(`
          if a
            b(1)
          else
            b 2
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("command call in if body", () => {
        const content = ruby(`
          if a
            b.b 1
          else
            b(2)
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("command call in else body", () => {
        const content = ruby(`
          if a
            b(1)
          else
            b.b 2
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("align long predicates", () =>
        expect(`${long} || ${long}a ? foo : bar`).toChangeFormat(
          ruby(`
          if ${long} ||
               ${long}a
            foo
          else
            bar
          end
        `)
        ));

      test("lower precendence operators", () => {
        const content = ruby(`
          if x.nil?
            puts 'nil' and return
          else
            x
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("assign nodes in predicate", () => {
        const content = ruby(`
          if x = 1
            y
          else
            z
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("opassign nodes in predicate", () => {
        const content = ruby(`
          if x ||= 1
            y
          else
            z
          end
        `);

        return expect(content).toMatchFormat();
      });
    });
  });

  describe("if/elsif/else chains", () => {
    test("basic", () => {
      const content = ruby(`
        if a
          1
        elsif b
          2
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("multiple clauses", () => {
      const content = ruby(`
        if a
          1
        elsif b
          2
        elsif c
          3
        else
          4
        end
      `);

      return expect(content).toMatchFormat();
    });
  });

  describe.each(["if", "unless"])("add parens when necessary %s", (keyword) => {
    test("args", () =>
      expect(`[${keyword} foo? then bar end]`).toChangeFormat(
        `[(bar ${keyword} foo?)]`
      ));

    test("assign", () =>
      expect(`foo = ${keyword} bar? then baz end`).toChangeFormat(
        `foo = (baz ${keyword} bar?)`
      ));

    test("assoc_new", () =>
      expect(`{ foo: ${keyword} bar? then baz end }`).toChangeFormat(
        `{ foo: (baz ${keyword} bar?) }`
      ));

    test("massign", () =>
      expect(`f, o, o = ${keyword} bar? then baz end`).toChangeFormat(
        `f, o, o = (baz ${keyword} bar?)`
      ));

    test("opassign", () =>
      expect(`foo ||= ${keyword} bar? then baz end`).toChangeFormat(
        `foo ||= (baz ${keyword} bar?)`
      ));
  });
});
