const fs = require("fs");
const path = require("path");

const { ruby } = require("../utils");

function testCases(name, transform) {
  const buffer = fs.readFileSync(path.resolve(__dirname, `${name}.txt`));
  const sources = buffer.toString().slice(0, -1).split("\n");

  sources.forEach((source) => {
    test(source, () =>
      expect(transform(source)).toMatchFormat({ parser: "rbs" })
    );
  });
}

function describeCases(name, transform) {
  describe(name, () => {
    testCases(name, transform);
  });
}

describe("rbs", () => {
  if (process.env.RUBY_VERSION <= "3.0") {
    test("RBS did not exist before ruby 3.0", () => {
      // this is here because test files must contain at least one test, so for
      // earlier versions of ruby this is just going to chill here
    });

    return;
  }

  describeCases("combination", (source) => `T: ${source}`);

  describeCases("constant", (source) => `T: ${source}`);

  describe("declaration", () => {
    testCases("declaration", (source) => source);

    test("interface", () => {
      const content = ruby(`
        interface _Foo
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("interface with type params", () => {
      const content = ruby(`
        interface _Foo[A, B]
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("class", () => {
      const content = ruby(`
        class Foo
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("class with type params", () => {
      const content = ruby(`
        class Foo[A, B]
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("class with complicated type params", () => {
      const content = ruby(`
        class Foo[unchecked in A, unchecked out B, in C, out D, unchecked E, unchecked F, G, H]
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("class with annotations", () => {
      const content = ruby(`
        %a{This is an annotation.}
        class Foo
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("class with annotations that cannot be switched to braces", () => {
      const content = ruby(`
        %a<This is {an} annotation.>
        class Foo
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("class with comments", () => {
      const content = ruby(`
        # This is a comment.
        class Foo
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("class with superclass", () => {
      const content = ruby(`
        class Foo < Bar
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("module", () => {
      const content = ruby(`
        module Foo
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("module with type params", () => {
      const content = ruby(`
        module Foo[A, B]
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("module with self types", () => {
      const content = ruby(`
        module Foo : A
        end
      `);

      return expect(content).toMatchFormat({ parser: "rbs" });
    });

    test("multiple empty lines", () => {
      const content = ruby(`
        class Foo
          A: 1
          B: 2


          C: 3
        end
      `);

      const expected = ruby(`
        class Foo
          A: 1
          B: 2

          C: 3
        end
      `);

      return expect(content).toChangeFormat(expected, { parser: "rbs" });
    });
  });

  describeCases("generic", (source) =>
    ruby(`
      class T
        def t: ${source}
      end
    `)
  );

  describeCases("interface", (source) => `T: ${source}`);

  describe("literal", () => {
    testCases("literal", (source) => `T: ${source}`);

    test("+1 drops the plus sign", () =>
      expect("T: +1").toChangeFormat("T: 1", { parser: "rbs" }));

    test("uses default quotes", () =>
      expect("T: 'foo'").toMatchFormat({ parser: "rbs" }));

    test("changes quotes to match", () =>
      expect("T: 'foo'").toChangeFormat(`T: "foo"`, {
        rubySingleQuote: false,
        parser: "rbs"
      }));

    test("keeps string the same when there is an escape sequence", () =>
      expect(`T: "super \\" duper"`).toMatchFormat({ parser: "rbs" }));

    test("unescapes single quotes when using double quotes", () =>
      expect(`T: 'super \\' duper'`).toChangeFormat(`T: "super ' duper"`, {
        rubySingleQuote: false,
        parser: "rbs"
      }));

    test("maintains escape sequences when using double quotes", () =>
      expect(`T: "escape sequences \\a\\b\\e\\f\\n\\r\\t\\v"`).toMatchFormat({
        parser: "rbs"
      }));

    test("maintains not escape sequences when using single quotes", () =>
      expect(`T: 'escape sequences \\a\\b\\e\\f\\n\\r\\t\\v'`).toMatchFormat({
        parser: "rbs"
      }));
  });

  describeCases("member", (source) =>
    ruby(`
      class T
        ${source}
      end
    `)
  );

  describeCases("method", (source) =>
    ruby(`
      class T
        ${source}
      end
    `)
  );

  describe("optional", () => {
    testCases("optional", (source) => `T: ${source}`);

    test("removes optional space before question mark", () =>
      expect("T: :foo ?").toChangeFormat("T: :foo?", { parser: "rbs" }));
  });

  describe("plain", () => {
    testCases("plain", (source) => `T: ${source}`);

    test("any gets transformed into untyped", () =>
      expect("T: any").toChangeFormat("T: untyped", { parser: "rbs" }));
  });

  describe("proc", () => {
    testCases("proc", (source) => `T: ${source}`);

    test("drops optional parentheses when there are no params", () =>
      expect("T: ^() -> void").toChangeFormat("T: ^-> void", {
        parser: "rbs"
      }));

    test("drops optional parentheses with block param when there are no params to the block", () =>
      expect(
        "T: ^{ () -> void } -> void"
      ).toChangeFormat("T: ^{ -> void } -> void", { parser: "rbs" }));
  });

  describeCases("record", (source) => `T: ${source}`);

  describeCases("tuple", (source) => `T: ${source}`);
});
