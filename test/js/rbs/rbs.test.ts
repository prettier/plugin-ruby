import fs from "fs";
import path from "path";

import { rbs } from "../utils";

function testCases(name: string, transform: (_source: string) => string) {
  const buffer = fs.readFileSync(path.resolve(__dirname, `${name}.txt`));
  const sources = buffer.toString().slice(0, -1).split(/\r?\n/);

  sources.forEach((source) => {
    test(source, () => {
      expect(rbs(transform(source))).toMatchFormat();
    });
  });
}

function describeCases(name: string, transform: (_source: string) => string) {
  describe(name, () => {
    testCases(name, transform);
  });
}

describe("rbs", () => {
  describeCases("combination", (source) => `T: ${source}`);

  describeCases("constant", (source) => `T: ${source}`);

  describe("declaration", () => {
    testCases("declaration", (source) => source);

    test("interface", () => {
      const content = rbs(`
        interface _Foo
        end
      `);

      expect(content).toMatchFormat();
    });

    test("interface with type params", () => {
      const content = rbs(`
        interface _Foo[A, B]
        end
      `);

      expect(content).toMatchFormat();
    });

    test("class", () => {
      const content = rbs(`
        class Foo
        end
      `);

      expect(content).toMatchFormat();
    });

    test("class with type params", () => {
      const content = rbs(`
        class Foo[A, B]
        end
      `);

      expect(content).toMatchFormat();
    });

    test("class with complicated type params", () => {
      const content = rbs(`
        class Foo[unchecked in A, unchecked out B, in C, out D, unchecked E, unchecked F, G, H]
        end
      `);

      expect(content).toMatchFormat();
    });

    test("class with annotations", () => {
      const content = rbs(`
        %a{This is an annotation.}
        class Foo
        end
      `);

      expect(content).toMatchFormat();
    });

    test("class with annotations that cannot be switched to braces", () => {
      const content = rbs(`
        %a<This is {an} annotation.>
        class Foo
        end
      `);

      expect(content).toMatchFormat();
    });

    test("class with comments", () => {
      const content = rbs(`
        # This is a comment.
        class Foo
        end
      `);

      expect(content).toMatchFormat();
    });

    test("class with superclass", () => {
      const content = rbs(`
        class Foo < Bar
        end
      `);

      expect(content).toMatchFormat();
    });

    test("module", () => {
      const content = rbs(`
        module Foo
        end
      `);

      expect(content).toMatchFormat();
    });

    test("module with type params", () => {
      const content = rbs(`
        module Foo[A, B]
        end
      `);

      expect(content).toMatchFormat();
    });

    test("module with self types", () => {
      const content = rbs(`
        module Foo : A
        end
      `);

      expect(content).toMatchFormat();
    });

    test("multiple empty lines", () => {
      const content = rbs(`
        class Foo
          A: 1
          B: 2


          C: 3
        end
      `);

      const expected = rbs(`
        class Foo
          A: 1
          B: 2

          C: 3
        end
      `);

      expect(content).toChangeFormat(expected);
    });
  });

  describeCases(
    "generic",
    (source) => `
      class T
        def t: ${source}
      end
    `
  );

  describeCases("interface", (source) => `T: ${source}`);

  describe("literal", () => {
    testCases("literal", (source) => `T: ${source}`);

    test("+1 drops the plus sign", () => {
      expect(rbs("T: +1")).toChangeFormat("T: 1");
    });

    test("uses default quotes", () => {
      expect(rbs("T: 'foo'")).toMatchFormat();
    });

    test("changes quotes to match", () => {
      expect(rbs("T: 'foo'")).toChangeFormat(`T: "foo"`, {
        rubySingleQuote: false
      });
    });

    test("keeps string the same when there is an escape sequence", () => {
      expect(rbs(`T: "super \\" duper"`)).toMatchFormat();
    });

    test("unescapes single quotes when using double quotes", () => {
      expect(rbs(`T: 'super \\' duper'`)).toChangeFormat(`T: "super ' duper"`, {
        rubySingleQuote: false
      });
    });

    test("maintains escape sequences when using double quotes", () => {
      expect(rbs(`T: "escape sequences \\a\\b\\e\\f\\n\\r"`)).toMatchFormat();
    });

    test("maintains not escape sequences when using single quotes", () => {
      expect(rbs(`T: 'escape sequences \\a\\b\\e\\f\\n\\r'`)).toMatchFormat();
    });
  });

  describeCases(
    "member",
    (source) => `
    class T
      ${source}
    end
  `
  );

  describeCases(
    "method",
    (source) => `
    class T
      ${source}
    end
  `
  );

  describe("optional", () => {
    testCases("optional", (source) => `T: ${source}`);

    test("removes optional space before question mark", () => {
      expect(rbs("T: :foo ?")).toChangeFormat("T: :foo?");
    });
  });

  describe("plain", () => {
    testCases("plain", (source) => `T: ${source}`);

    test("any gets transformed into untyped", () => {
      expect(rbs("T: any")).toChangeFormat("T: untyped");
    });
  });

  describe("proc", () => {
    testCases("proc", (source) => `T: ${source}`);

    test("drops optional parentheses when there are no params", () => {
      expect(rbs("T: ^() -> void")).toChangeFormat("T: ^-> void");
    });

    test("drops optional parentheses with block param when there are no params to the block", () => {
      expect(rbs("T: ^{ () -> void } -> void")).toChangeFormat(
        "T: ^{ -> void } -> void"
      );
    });
  });

  describeCases("record", (source) => `T: ${source}`);

  describeCases("tuple", (source) => `T: ${source}`);
});
