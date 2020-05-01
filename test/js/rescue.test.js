const { ruby } = require("./utils");

describe("rescue", () => {
  test("inline", () =>
    expect("a rescue nil").toChangeFormat(
      ruby(`
      begin
        a
      rescue StandardError
        nil
      end
    `)
    ));

  // from ruby spec/ruby/language/rescue_spec.rb
  test("splat errors", () => {
    const content = ruby(`
      def foo
        a
      rescue A, *B => e
        e
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("every clause", () => {
    const error = "BreakingBreakingBreakingBreakingBreakingError";
    const content = ruby(`
      begin
        1
      rescue ArgumentError
        retry
      rescue NoMethodError => exception
        puts exception
        redo
      rescue SyntaxError, NoMethodError
        2
      rescue One${error}, Two${error}, Three${error}
        3
      rescue
        4
      else
        5
      ensure
        6
      end
    `);

    return expect(content).toChangeFormat(
      ruby(`
      begin
        1
      rescue ArgumentError
        retry
      rescue NoMethodError => exception
        puts exception
        redo
      rescue SyntaxError, NoMethodError
        2
      rescue One${error},
             Two${error},
             Three${error}
        3
      rescue StandardError
        4
      else
        5
      ensure
        6
      end
    `)
    );
  });

  test("empty rescue body", () => {
    const content = ruby(`
      begin
        1
      rescue NoMethodError
      end
    `);

    return expect(content).toMatchFormat();
  });
});
