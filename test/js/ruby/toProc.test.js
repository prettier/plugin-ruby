const { ruby } = require("../utils");

describe("to_proc transform", () => {
  test("basic inline", () =>
    expect("loop { |i| i.to_s }").toChangeFormat("loop(&:to_s)", {
      rubyToProc: true
    }));

  test("basic inline with option turned off", () =>
    expect("loop { |i| i.to_s }").toMatchFormat({ rubyToProc: false }));

  test("basic multi-line", () => {
    const content = ruby(`
      list.each do |node|
        node.print
      end
    `);

    return expect(content).toChangeFormat("list.each(&:print)", {
      rubyToProc: true
    });
  });

  test("maintains to_proc if already in use when rubyToProc false", () =>
    expect("loop(&:to_s)").toMatchFormat({ rubyToProc: false }));

  test("maintains to_proc if already in use when rubyToProc true", () =>
    expect("loop(&:to_s)").toMatchFormat({ rubyToProc: true }));

  test("multi-line with comment", () => {
    const content = ruby(`
      foo.each do |bar|
        # comment
        bar.baz
      end
    `);

    return expect(content).toMatchFormat({ rubyToProc: true });
  });

  test("happens for command nodes", () => {
    const content = ruby(`
      command 'foo' do |bar|
        bar.to_s
      end
    `);

    return expect(content).toChangeFormat("command 'foo', &:to_s", {
      rubyToProc: true
    });
  });

  test("happens for command call nodes", () => {
    const content = ruby(`
      command.call 'foo' do |bar|
        bar.to_s
      end
    `);

    return expect(content).toChangeFormat("command.call 'foo', &:to_s", {
      rubyToProc: true
    });
  });

  test("with args and parens", () =>
    expect("foo(bar) { |baz| baz.to_i }").toChangeFormat("foo(bar, &:to_i)", {
      rubyToProc: true
    }));

  test("with commands", () => {
    const content = ruby(`
      command bar do |baz|
        baz.to_i
      end
    `);

    return expect(content).toChangeFormat("command bar, &:to_i", {
      rubyToProc: true
    });
  });

  test("with command calls", () => {
    const content = ruby(`
      command.call bar do |baz|
        baz.to_i
      end
    `);

    return expect(content).toChangeFormat("command.call bar, &:to_i", {
      rubyToProc: true
    });
  });

  test("when inside of an aref node", () => {
    const content = "foo[:bar].each { |baz| baz.to_s }";
    const expected = "foo[:bar].each(&:to_s)";

    return expect(content).toChangeFormat(expected, { rubyToProc: true });
  });

  describe("when not to transform", () => {
    test("when called with &.", () => {
      const content = "loop { |i| i&.to_s }";

      expect(content).toMatchFormat({ rubyToProc: true });
    });

    test("when there are multiple lines", () => {
      const content = ruby(`
        loop do |i|
          i.to_s
          i.next
        end
      `);

      return expect(content).toMatchFormat({ rubyToProc: true });
    });

    test("when there is a rescue, else, or ensure", () => {
      const content = ruby(`
        loop do |i|
          i.to_s
        rescue Foo
          foo
        end
      `);

      return expect(content).toMatchFormat({ rubyToProc: true });
    });

    test("when there are args to the method call", () => {
      const content = "loop { |i| i.to_s(:db) }";

      expect(content).toMatchFormat({ rubyToProc: true });
    });

    test("when there are multiple args", () => {
      const content = "loop { |i, j| i.to_s }";

      return expect(content).toMatchFormat({ rubyToProc: true });
    });

    test("when we're inside an if:", () => {
      const content = "{ if: proc { |i| i.to_s } }";

      return expect(content).toMatchFormat({ rubyToProc: true });
    });

    test("when we're inside an :if =>", () => {
      const content = "{ :if => proc { |i| i.to_s } }";
      const expected = "{ if: proc { |i| i.to_s } }";

      return expect(content).toChangeFormat(expected, { rubyToProc: true });
    });

    test("when we're inside a regular hash", () => {
      const content = "{ when: proc { |i| i.to_s } }";
      const expected = "{ when: proc(&:to_s) }";

      return expect(content).toChangeFormat(expected, { rubyToProc: true });
    });

    test("when we're inside a regular hash", () => {
      const content = "{ when: proc { |i| i.to_s } }";
      const expected = "{ when: proc(&:to_s) }";

      return expect(content).toChangeFormat(expected, { rubyToProc: true });
    });

    test("when there are no variables", () =>
      expect("loop { i.to_s }").toMatchFormat({ rubyToProc: true }));
  });

  describe.each(["if", "unless"])(
    "does not transform when used inside hash with %s",
    (keyword) => {
      test(`hash literal with :${keyword} key`, () =>
        expect(`{ ${keyword}: ->(foo) { foo.to_s } }`).toMatchFormat({
          rubyToProc: true
        }));

      test(`hash literal with hashrocket :${keyword} key`, () =>
        expect(`{ :${keyword} => ->(foo) { foo.to_s } }`).toMatchFormat({
          rubyHashLabel: false,
          rubyToProc: true
        }));

      test(`method arguments with :${keyword} key`, () =>
        expect(`bar ${keyword}: ->(foo) { foo.to_s }`).toMatchFormat({
          rubyToProc: true
        }));

      test(`method arguments with hashrocket :${keyword} key`, () =>
        expect(`bar :${keyword} => ->(foo) { foo.to_s }`).toMatchFormat({
          rubyHashLabel: false,
          rubyToProc: true
        }));
    }
  );
});
