import { ruby } from "../../utils.js";

describe("rescue", () => {
  test("inline", () => {
    const expected = ruby(`
      begin
        a
      rescue StandardError
        nil
      end
    `);

    return expect("a rescue nil").toChangeFormat(expected);
  });

  test("rescue just variable", () => {
    const content = ruby(`
      begin
        a
      rescue => e
        nil
      end
    `);

    return expect(content).toMatchFormat();
  });

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

  // https://github.com/prettier/plugin-ruby/pull/1000
  test("errors with scope resolution operator", () => {
    const content = ruby(`
      def foo
        a
      rescue ::A
        e
      end
    `);

    return expect(content).toMatchFormat();
  });

  test.each(["begin", "def foo"])("%s with every clause", (declaration) => {
    const error = "BreakingBreakingBreakingBreakingBreakingError";
    const content = ruby(`
      ${declaration}
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
        ${declaration}
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

  test("comment inline", () => {
    const content = ruby(`
      begin
        foo
      rescue Foo # foo
        bar
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("comment inline with multiple", () => {
    const content = ruby(`
      begin
        foo
      rescue Foo, Bar # foo
        bar
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("comment inline with splat", () => {
    const content = ruby(`
      begin
        foo
      rescue Foo, *Bar # foo
        bar
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("one error with a comment", () => {
    const content = ruby(`
      begin
        foo
      rescue Discourse::InvalidAccess
        # keep going
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("two errors with a comment", () => {
    const content = ruby(`
      begin
        foo
      rescue Discourse::InvalidAccess, UserDestroyer::PostsExistError
        # keep going
      end
    `);

    return expect(content).toMatchFormat();
  });
});
