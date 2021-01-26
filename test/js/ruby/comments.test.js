const { ruby } = require("../utils");

describe("comments", () => {
  describe("on their own line", () => {
    test("at the beginning of the file", () => {
      const content = ruby(`
        # this is a comment at
        # the beginning of the file

        a = 1
      `);

      return expect(content).toMatchFormat();
    });

    test("at the end of the file", () => {
      const content = ruby(`
        a = 1

        # this is a comment at
        # the end of the file
      `);

      return expect(content).toMatchFormat();
    });

    const commentBlocks = [
      "loop do",
      "def foo",
      "def self.foo",
      "class Foo",
      "module Foo",
      "class << self",
      "if foo",
      "unless foo",
      "while foo",
      "until foo"
    ];

    describe.each(commentBlocks)("%s blocks", (start) => {
      test("as the only statement", () => {
        const content = ruby(`
          ${start}
            # this is the only statement
            # inside this block
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("as the first statement", () => {
        const content = ruby(`
          ${start}
            # this is the first statement
            # inside this block
            foo
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("as the last statement", () => {
        const content = ruby(`
          ${start}
            foo
            # this is the last statement
            # inside this block
          end
        `);

        return expect(content).toMatchFormat();
      });
    });

    test("if/elsif/else/end statements", () => {
      const content = ruby(`
        if a
          # this is the only comment in this if
        elsif b
          # this is the only comment in this elsif
        elsif c
          # this is a comment at the beginning of this elsif
          1
        elsif d
          2
          # this is a comment at the end of an elsif
        else
          # this is the only comment in this else
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("case/when/end statements", () => {
      const content = ruby(`
        case foo
        when bar
          # this is a comment at the beginning of a when
          1
        when baz
          2
          # this is a comment at the end of a when
        when qux
          # this is the only statement in this when
        else
          # this is the only statement in this else
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("begin/rescue/ensure/end statements", () => {
      const content = ruby(`
        begin
          # this is the only statement in this begin
        rescue FooError
          # this is the only statement in this rescue
        rescue BarError
          # this is the first statement of this rescue
          1
        rescue BazError
          2
          # this is the last statement of this rescue
        ensure
          # this is the only statement in this ensure
        end
      `);

      return expect(content).toMatchFormat();
    });

    /* eslint-disable no-useless-escape */
    test("end content", () => {
      const content = ruby(`
        a = 1

        __END__
            /‾‾‾‾‾\  /‾‾‾‾‾\  /‾‾‾‾/ /‾‾‾‾‾‾/ /‾‾‾‾‾‾/ /‾‾‾‾‾‾/ /‾‾‾‾/ /‾‾‾‾‾\
           / /‾‾/ / / /‾‾/ / / /‾‾‾  ‾‾/ /‾‾  ‾‾/ /‾‾  ‾‾/ /‾‾ / /‾‾‾ / /‾‾/ /
          /  ‾‾‾ / /  ‾‾‾_/ / _‾/     / /      / /      / /   / _‾/  /  ‾‾‾_/
         / /‾‾‾‾‾ / /‾\ \  / /__     / /      / /    __/ /_  / /__  / /‾\ \
        /_/      /_/  /_/ /____/    /_/      /_/    /_____/ /____/ /_/  /_/
      `);

      return expect(content).toMatchFormat();
    });
  });

  describe("inline", () => {
    test("basic", () =>
      expect("foo # this is an inline comment").toMatchFormat());

    test("commands", () =>
      expect("command 'foo' # this is an inline comment").toMatchFormat());

    test("command calls", () =>
      expect("command.call 'foo' # this is an inline comment").toMatchFormat());
  });

  describe("arrays", () => {
    test("on their own lines", () => {
      const content = ruby(`
        [
          # these are comments
          # inside of an array
          foo,
          # an then some more
          bar
        ]
      `);

      return expect(content).toMatchFormat();
    });
  });

  describe("hashes", () => {
    test("on their own lines", () => {
      const content = ruby(`
        {
          # these are comments
          # inside of a hash
          foo: 'bar',
          # and then some more
          bar: 'baz'
        }
      `);

      return expect(content).toMatchFormat();
    });
  });

  describe("method calls", () => {
    test("on their own lines", () => {
      const content = ruby(`
        foo.bar(
          # this is a comment at the beginning of the method call
          foo: bar,
          # this is a comment in the middle of the method call
          bar: baz
          # this is a comment at the end of the method call
        )
      `);

      return expect(content).toMatchFormat();
    });
  });

  test("causing ignored_nl", () => {
    const content = ruby(`
      foo.bar # comment
        .baz
    `);

    return expect(content).toMatchFormat();
  });

  describe("declaration style comments", () => {
    const declarations = [
      "class Foo",
      "module Foo",
      "def foo",
      "def self.foo",
      "class << foo"
    ];

    test.each(declarations)("%s inline", (declaration) => {
      const content = ruby(`
        ${declaration} # :nodoc
          bar
        end
      `);

      return expect(content).toMatchFormat();
    });
  });

  test("works with multi-byte characters", () => {
    const content = ruby(`
      [
        ['先生小'], #
        ['小']
      ]
    `);

    return expect(content).toMatchFormat();
  });
});
