import { long, ruby } from "../../utils.js";

describe("blocks", () => {
  test("empty", () => {
    return expect("loop {}").toMatchFormat();
  });

  test("single line non-breaking", () => {
    return expect("loop { 1 }").toMatchFormat();
  });

  test("single line breaking", () => {
    return expect(`loop { ${long} }`).toChangeFormat(`loop do\n  ${long}\nend`);
  });

  test("multi line non-breaking", () => {
    return expect("loop do\n  1\nend").toChangeFormat("loop { 1 }");
  });

  test("multi-line breaking", () => {
    return expect(`loop do\n  ${long}\nend`).toMatchFormat();
  });

  test("multi-line with comment", () => {
    return expect("loop do\n  # foobar\nend").toMatchFormat();
  });

  test("multi-line on command, no body", () => {
    return expect(`command "foobar" do\nend`).toMatchFormat();
  });

  test("multi-line on command call, no body", () => {
    return expect(`command.call "foobar" do\nend`).toMatchFormat();
  });

  test("multi-line on command, with body", () => {
    return expect(`command "foobar" do\n  foo\nend`).toMatchFormat();
  });

  test("multi-line on command call, with body", () => {
    return expect(`command.call "foobar" do\n  foo\nend`).toMatchFormat();
  });

  test("blocks nested inside commands use braces", () => {
    const expected = ruby(`
      foo ${long} {
            ${long}
          }.bar
    `);

    return expect(`foo ${long} { ${long} }.bar`).toChangeFormat(expected);
  });

  test("breaking maintains calls on the end", () => {
    const content = ruby(`
      method.each do |foo|
        bar
        baz
      end.to_i
    `);

    const expected = ruby(`
      method
        .each do |foo|
          bar
          baz
        end
        .to_i
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("doesn't do weird things with comments", () => {
    const content = ruby(`
      foo.each do |bar|
        # comment
        bar.baz
        bar.baz
      end
    `);

    return expect(content).toMatchFormat();
  });

  describe("for loops", () => {
    test("for loops", () => {
      const content = ruby(`
        for i in [1, 2, 3]
          p i
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("multiple variables", () => {
      const content = ruby(`
        for a, b in [[1, 2], [3, 4]]
          p i
        end
      `);

      return expect(content).toMatchFormat();
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

      return expect(content).toChangeFormat(expected);
    });
  });

  test("excessed_comma nodes", () => {
    return expect("proc { |x,| }").toMatchFormat();
  });

  describe("args", () => {
    test("no body", () => {
      return expect("loop { |i| }").toMatchFormat();
    });

    test("single line non-breaking", () => {
      return expect("loop { |i| 1 }").toMatchFormat();
    });

    test("single line breaking", () => {
      return expect(`loop { |i| ${long} }`).toChangeFormat(
        `loop do |i|\n  ${long}\nend`
      );
    });

    test("multi-line non-breaking", () => {
      return expect("loop do |i|\n  i\nend").toChangeFormat("loop { |i| i }");
    });

    test("multi-line breaking", () => {
      return expect(`loop do |i|\n  ${long}\nend`).toMatchFormat();
    });

    test("block-local args", () => {
      return expect("loop { |i; j| 1 }").toMatchFormat();
    });

    test("splat", () => {
      return expect("loop { |*| i }").toMatchFormat();
    });

    test("destructure", () => {
      return expect("loop { |(a, b)| i }").toMatchFormat();
    });

    test("lots of args types", () => {
      return expect("loop { |a, (b, c), d, *e| i }").toMatchFormat();
    });

    test("does not split up args inside pipes", () => {
      return expect(`loop do |${long} = 1, a${long} = 2|\nend`).toMatchFormat();
    });
  });

  // https://github.com/prettier/plugin-ruby/issues/989
  test("comments on a do block", () => {
    const content = ruby(`
      RSpec.describe Api::V2::OAuth::TokensController, type: :api do # rubocop:disable RSpec/FilePath
        foo
      end
    `);

    return expect(content).toMatchFormat();
  });

  // https://github.com/prettier/plugin-ruby/issues/1042
  test("comments on the do block without a command", () => {
    const content = ruby(`
      let!(:some_variable) do # comment text
        nil
      end
    `);

    return expect(content).toMatchFormat();
  });
});
