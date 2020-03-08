const { long, ruby } = require("./utils");

describe("blocks", () => {
  test("empty", () => expect("loop {}").toMatchFormat());

  test("single line non-breaking", () => expect("loop { 1 }").toMatchFormat());

  test("single line breaking", () =>
    expect(`loop { ${long} }`).toChangeFormat(`loop do\n  ${long}\nend`));

  test("multi line non-breaking", () =>
    expect("loop do\n  1\nend").toMatchFormat());

  test("multi-line breaking", () =>
    expect(`loop do\n  ${long}\nend`).toMatchFormat());

  test("multi-line with comment", () =>
    expect("loop do\n  # foobar\nend").toMatchFormat());

  test("multi-line on command, no body", () =>
    expect("command 'foobar' do\nend").toMatchFormat());

  test("multi-line on command call, no body", () =>
    expect("command.call 'foobar' do\nend").toMatchFormat());

  test("multi-line on command, with body", () =>
    expect("command 'foobar' do\n  foo\nend").toMatchFormat());

  test("multi-line on command call, with body", () =>
    expect("command.call 'foobar' do\n  foo\nend").toMatchFormat());

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

    return expect(content).toMatchFormat();
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

  test("for loops get changed", () => {
    const content = ruby(`
      for i in [1, 2, 3] do
        p i
      end
    `);

    return expect(content).toChangeFormat(
      ruby(`
      [1, 2, 3].each do |i|
        p i
      end
    `)
    );
  });

  // from ruby test/ruby/test_call.rb
  test("inline do end", () =>
    expect(`assert_nil(("a".sub! "b" do end&.foo {}))`).toChangeFormat(
      ruby(`
      assert_nil(
        (
          'a'.sub! 'b' do
          end&.foo {}
        )
      )
    `)
    ));

  test("excessed_comma nodes", () => expect("proc { |x,| }").toMatchFormat());

  describe("args", () => {
    test("no body", () => expect("loop { |i| }").toMatchFormat());

    test("single line non-breaking", () =>
      expect("loop { |i| 1 }").toMatchFormat());

    test("single line breaking", () =>
      expect(`loop { |i| ${long} }`).toChangeFormat(
        `loop do |i|\n  ${long}\nend`
      ));

    test("multi-line non-breaking", () =>
      expect("loop do |i|\n  i\nend").toMatchFormat());

    test("multi-line breaking", () =>
      expect(`loop do |i|\n  ${long}\nend`).toMatchFormat());

    test("block-local args", () => expect("loop { |i; j| 1 }").toMatchFormat());

    test("splat", () => expect("loop { |*| i }").toMatchFormat());

    test("destructure", () => expect("loop { |(a, b)| i }").toMatchFormat());

    test("lots of args types", () =>
      expect("loop { |a, (b, c), d, *e| i }").toMatchFormat());

    test("does not split up args inside pipes", () =>
      expect(`loop do |${long} = 1, a${long} = 2|\nend`).toMatchFormat());
  });

  describe("to_proc transform", () => {
    test("basic inline", () =>
      expect("loop { |i| i.to_s }").toChangeFormat("loop(&:to_s)"));

    test("basic multi-line", () => {
      const content = ruby(`
        list.each do |node|
          node.print
        end
      `);

      return expect(content).toChangeFormat("list.each(&:print)");
    });

    test.skip("multi-line with comment", () => {
      const content = ruby(`
        foo.each do |bar|
          # comment
          bar.baz
        end
      `);

      return expect(content).toMatchFormat();
    });

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

    test("with args and parens", () =>
      expect("foo(bar) { |baz| baz.to_i }").toChangeFormat("foo(bar, &:to_i)"));

    test("with commands", () => {
      const content = ruby(`
        command bar do |baz|
          baz.to_i
        end
      `);

      return expect(content).toChangeFormat("command bar, &:to_i");
    });

    test("with command calls", () => {
      const content = ruby(`
        command.call bar do |baz|
          baz.to_i
        end
      `);

      return expect(content).toChangeFormat("command.call bar, &:to_i");
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

    test("does not happen when there are args to the method call", () =>
      expect("loop { |i| i.to_s(:db) }").toMatchFormat());

    test("does not happen when there are multiple args", () =>
      expect("loop { |i, j| i.to_s }").toMatchFormat());

    test("does not duplicate when inside of an aref node", () =>
      expect("foo[:bar].each { |baz| baz.to_s }").toChangeFormat(
        "foo[:bar].each(&:to_s)"
      ));
  });
});
