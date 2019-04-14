const { long, ruby } = require("./utils");

describe("blocks", () => {
  test("empty", () => (
    expect("loop {}").toMatchFormat()
  ));

  test("single line non-breaking", () => (
    expect("loop { 1 }").toMatchFormat()
  ));

  test("single line breaking", () => (
    expect(`loop { ${long} }`).toChangeFormat(`loop do\n  ${long}\nend`)
  ));

  test("multi line non-breaking", () => (
    expect("loop do\n  1\nend").toChangeFormat("loop { 1 }")
  ));

  test("multi-line breaking", () => (
    expect(`loop do\n  ${long}\nend`).toMatchFormat()
  ));

  test("multi-line with comment", () => (
    expect("loop do\n  # foobar\nend").toMatchFormat()
  ));

  test("multi-line on command, no body", () => (
    expect("command 'foobar' do\nend").toMatchFormat()
  ));

  test("multi-line on command call, no body", () => (
    expect("command.call 'foobar' do\nend").toMatchFormat()
  ));

  test("multi-line on command, with body", () => (
    expect("command 'foobar' do\n  foo\nend").toMatchFormat()
  ));

  test("multi-line on command call, with body", () => (
    expect("command.call 'foobar' do\n  foo\nend").toMatchFormat()
  ));

  test("breaking maintains calls on the end", () => {
    const content = ruby(`
      method.each do |foo|
        bar
        baz
      end.to_i
    `);

    return expect(content).toMatchFormat();
  });

  test("for loops get changed", () => {
    const content = ruby(`
      for i in [1, 2, 3] do
        p i
      end
    `);

    return expect(content).toChangeFormat(ruby(`
      [1, 2, 3].each do |i|
        p i
      end
    `));
  });

  // from ruby test/ruby/test_call.rb
  test("inline do end", () => (
    expect(`assert_nil(("a".sub! "b" do end&.foo {}))`).toChangeFormat(ruby(`
      assert_nil(
        (
          'a'.sub! 'b' do
          end&.foo do
          end
        )
      )
    `))
  ));

  describe("args", () => {
    test("no body", () => (
      expect("loop { |i| }").toMatchFormat()
    ));

    test("single line non-breaking", () => (
      expect("loop { |i| 1 }").toMatchFormat()
    ));

    test("single line breaking", () => (
      expect(`loop { |i| ${long} }`).toChangeFormat(
        `loop do |i|\n  ${long}\nend`
      )
    ));

    test("multi-line non-breaking", () => (
      expect("loop do |i|\n  i\nend").toChangeFormat("loop { |i| i }")
    ));

    test("multi-line breaking", () => (
      expect(`loop do |i|\n  ${long}\nend`).toMatchFormat()
    ));

    test("block-local args", () => (
      expect("loop { |i; j| 1 }").toMatchFormat()
    ));

    test("splat", () => (
      expect("loop { |*| i }").toMatchFormat()
    ));

    test("destructure", () => (
      expect("loop { |(a, b)| i }").toMatchFormat()
    ));

    test("lots of args types", () => (
      expect("loop { |a, (b, c), d, *e| i }").toMatchFormat()
    ));

    test("does not split up args inside pipes", () => (
      expect(`loop do |${long} = 1, a${long} = 2|\nend`).toMatchFormat()
    ));

    if (process.env.RUBY_VERSION >= "2.7") {
      test("number args", () => (
        expect("loop { @1 * 2 }").toMatchFormat()
      ));
    }
  });

  describe("to_proc transform", () => {
    test("basic", () => (
      expect("loop { |i| i.to_s }").toChangeFormat("loop(&:to_s)")
    ));

    test("happens for command nodes", () => {
      const content = ruby(`
        command 'foo' do |bar|
          bar.to_s
        end
      `);

      return expect(content).toChangeFormat("command 'foo', &:to_s");
    });

    test("happens for command call nodes", () => {
      const content = ruby(`
        command.call 'foo' do |bar|
          bar.to_s
        end
      `);

      return expect(content).toChangeFormat("command.call 'foo', &:to_s");
    });

    test("does not happen when there are multiple lines", () => {
      const content = ruby(`
        loop do |i|
          i.to_s
          i.next
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("does not happen when there are args to the method call", () => (
      expect("loop { |i| i.to_s(:db) }").toMatchFormat()
    ));

    test("does not happen when there are multiple args", () => (
      expect("loop { |i, j| i.to_s }").toMatchFormat()
    ));
  });
});
