const { ruby } = require("./utils");

describe("to_proc transform", () => {
  test("basic inline", () =>
    expect("loop { |i| i.to_s }").toChangeFormat("loop(&:to_s)", {
      toProcTransform: true
    }));

  test("basic inline with option turned off", () =>
    expect("loop { |i| i.to_s }").toMatchFormat({ toProcTransform: false }));

  test("basic multi-line", () => {
    const content = ruby(`
      list.each do |node|
        node.print
      end
    `);

    return expect(content).toChangeFormat("list.each(&:print)", {
      toProcTransform: true
    });
  });

  test("maintains to_proc if already in use when toProcTransform false", () =>
    expect("loop(&:to_s)").toMatchFormat({ toProcTransform: false }));

  test("maintains to_proc if already in use when toProcTransform true", () =>
    expect("loop(&:to_s)").toMatchFormat({ toProcTransform: true }));

  test.skip("multi-line with comment", () => {
    const content = ruby(`
      foo.each do |bar|
        # comment
        bar.baz
      end
    `);

    return expect(content).toMatchFormat({ toProcTransform: true });
  });

  test("happens for command nodes", () => {
    const content = ruby(`
      command 'foo' do |bar|
        bar.to_s
      end
    `);

    return expect(content).toChangeFormat("command 'foo', &:to_s", {
      toProcTransform: true
    });
  });

  test("happens for command call nodes", () => {
    const content = ruby(`
      command.call 'foo' do |bar|
        bar.to_s
      end
    `);

    return expect(content).toChangeFormat("command.call 'foo', &:to_s", {
      toProcTransform: true
    });
  });

  test("with args and parens", () =>
    expect("foo(bar) { |baz| baz.to_i }").toChangeFormat("foo(bar, &:to_i)", {
      toProcTransform: true
    }));

  test("with commands", () => {
    const content = ruby(`
      command bar do |baz|
        baz.to_i
      end
    `);

    return expect(content).toChangeFormat("command bar, &:to_i", {
      toProcTransform: true
    });
  });

  test("with command calls", () => {
    const content = ruby(`
      command.call bar do |baz|
        baz.to_i
      end
    `);

    return expect(content).toChangeFormat("command.call bar, &:to_i", {
      toProcTransform: true
    });
  });

  test("does not happen when there are multiple lines", () => {
    const content = ruby(`
      loop do |i|
        i.to_s
        i.next
      end
    `);

    return expect(content).toMatchFormat({ toProcTransform: true });
  });

  test("does not happen when there are args to the method call", () =>
    expect("loop { |i| i.to_s(:db) }").toMatchFormat({
      toProcTransform: true
    }));

  test("does not happen when there are multiple args", () =>
    expect("loop { |i, j| i.to_s }").toMatchFormat({ toProcTransform: true }));

  test("does not duplicate when inside of an aref node", () =>
    expect(
      "foo[:bar].each { |baz| baz.to_s }"
    ).toChangeFormat("foo[:bar].each(&:to_s)", { toProcTransform: true }));

  describe.each(["if", "unless"])(
    "does not transform when used inside hash with %s",
    (keyword) => {
      test(`hash literal with :${keyword} key`, () =>
        expect(`{ ${keyword}: ->(foo) { foo.to_s } }`).toMatchFormat({
          toProcTransform: true
        }));

      test(`hash literal with hashrocket :${keyword} key`, () =>
        expect(`{ :${keyword} => ->(foo) { foo.to_s } }`).toMatchFormat({
          preferHashLabels: false,
          toProcTransform: true
        }));

      test(`method arguments with :${keyword} key`, () =>
        expect(`bar ${keyword}: ->(foo) { foo.to_s }`).toMatchFormat({
          toProcTransform: true
        }));

      test(`method arguments with hashrocket :${keyword} key`, () =>
        expect(`bar :${keyword} => ->(foo) { foo.to_s }`).toMatchFormat({
          preferHashLabels: false,
          toProcTransform: true
        }));
    }
  );
});
