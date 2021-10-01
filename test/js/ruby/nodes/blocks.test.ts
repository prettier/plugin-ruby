import { long, ruby } from "../../utils";

describe("blocks", () => {
  test("empty", () => {
    expect("loop {}").toMatchFormat();
  });

  test("single line non-breaking", () => {
    expect("loop { 1 }").toMatchFormat();
  });

  test("single line breaking", () => {
    expect(`loop { ${long} }`).toChangeFormat(`loop do\n  ${long}\nend`);
  });

  test("multi line non-breaking", () => {
    expect("loop do\n  1\nend").toChangeFormat("loop { 1 }");
  });

  test("multi-line breaking", () => {
    expect(`loop do\n  ${long}\nend`).toMatchFormat();
  });

  test("multi-line with comment", () => {
    expect("loop do\n  # foobar\nend").toMatchFormat();
  });

  test("multi-line on command, no body", () => {
    expect("command 'foobar' do\nend").toMatchFormat();
  });

  test("multi-line on command call, no body", () => {
    expect("command.call 'foobar' do\nend").toMatchFormat();
  });

  test("multi-line on command, with body", () => {
    expect("command 'foobar' do\n  foo\nend").toMatchFormat();
  });

  test("multi-line on command call, with body", () => {
    expect("command.call 'foobar' do\n  foo\nend").toMatchFormat();
  });

  test("blocks nested inside commands use braces", () => {
    const expected = ruby(`
      foo ${long} {
            ${long}
          }.bar
    `);

    expect(`foo ${long} { ${long} }.bar`).toChangeFormat(expected);
  });

  test("breaking maintains calls on the end", () => {
    const content = ruby(`
      method.each do |foo|
        bar
        baz
      end.to_i
    `);

    expect(content).toMatchFormat();
  });

  test("doesn't do weird things with comments", () => {
    const content = ruby(`
      foo.each do |bar|
        # comment
        bar.baz
        bar.baz
      end
    `);

    expect(content).toMatchFormat();
  });

  describe("for loops", () => {
    test("for loops", () => {
      const content = ruby(`
        for i in [1, 2, 3]
          p i
        end
      `);

      expect(content).toMatchFormat();
    });

    test("multiple variables", () => {
      const content = ruby(`
        for a, b in [[1, 2], [3, 4]]
          p i
        end
      `);

      expect(content).toMatchFormat();
    });

    test("optional do keyword", () => {
      const content = ruby(`
        a do
          # comment
          for b in c do
            puts b
          end
        end
      `);

      const expected = ruby(`
        a do
          # comment
          for b in c
            puts b
          end
        end
      `);

      expect(content).toChangeFormat(expected);
    });
  });

  // from ruby test/ruby/test_call.rb
  test("inline do end", () => {
    expect(`assert_nil(("a".sub! "b" do end&.foo {}))`).toChangeFormat(
      ruby(`
        assert_nil(
          (
            'a'.sub! 'b' do
            end&.foo do
            end
          )
        )
      `)
    );
  });

  test("excessed_comma nodes", () => {
    expect("proc { |x,| }").toMatchFormat();
  });

  describe("args", () => {
    test("no body", () => {
      expect("loop { |i| }").toMatchFormat();
    });

    test("single line non-breaking", () => {
      expect("loop { |i| 1 }").toMatchFormat();
    });

    test("single line breaking", () => {
      expect(`loop { |i| ${long} }`).toChangeFormat(
        `loop do |i|\n  ${long}\nend`
      );
    });

    test("multi-line non-breaking", () => {
      expect("loop do |i|\n  i\nend").toChangeFormat("loop { |i| i }");
    });

    test("multi-line breaking", () => {
      expect(`loop do |i|\n  ${long}\nend`).toMatchFormat();
    });

    test("block-local args", () => {
      expect("loop { |i; j| 1 }").toMatchFormat();
    });

    test("splat", () => {
      expect("loop { |*| i }").toMatchFormat();
    });

    test("destructure", () => {
      expect("loop { |(a, b)| i }").toMatchFormat();
    });

    test("lots of args types", () => {
      expect("loop { |a, (b, c), d, *e| i }").toMatchFormat();
    });

    test("does not split up args inside pipes", () => {
      expect(`loop do |${long} = 1, a${long} = 2|\nend`).toMatchFormat();
    });
  });

  // https://github.com/prettier/plugin-ruby/issues/989
  test("comments on a do block", () => {
    const content = ruby(`
      RSpec.describe Api::V2::OAuth::TokensController, type: :api do # rubocop:disable RSpec/FilePath
        foo
      end
    `);

    expect(content).toMatchFormat();
  });
});
