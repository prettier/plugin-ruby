import { readFileSync } from "fs";
import { platform } from "os";
import { atLeastVersion, rbs } from "../utils";

function testCases(name, transform) {
  const buffer = readFileSync(new URL(`${name}.txt`, import.meta.url));
  const sources = buffer.toString().slice(0, -1).split(/\r?\n/);

  sources.forEach((source) => {
    test(source, () => {
      return expect(rbs(transform(source))).toMatchFormat();
    });
  });
}

function describeCases(name, transform) {
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

      return expect(content).toMatchFormat();
    });

    test("interface with type params", () => {
      const content = rbs(`
        interface _Foo[A, B]
        end
      `);

      return expect(content).toMatchFormat();
    });

    if (atLeastVersion("3.1")) {
      test("interface with bounded type param", () => {
        const content = rbs(`
          interface _Foo[A < B]
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("interface with fancy bounded type params", () => {
        const content = rbs(`
          interface _Foo[U < singleton(::Hash), V < W[X, Y]]
          end
        `);

        return expect(content).toMatchFormat();
      });
    }

    test("class", () => {
      const content = rbs(`
        class Foo
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("class with type params", () => {
      const content = rbs(`
        class Foo[A, B]
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("class with complicated type params", () => {
      const content = rbs(`
        class Foo[unchecked in A, unchecked out B, in C, out D, unchecked E, unchecked F, G, H]
        end
      `);

      return expect(content).toMatchFormat();
    });

    if (atLeastVersion("3.1")) {
      test("class with bounded type param", () => {
        const content = rbs(`
          class Foo[A < B]
          end
        `);

        return expect(content).toMatchFormat();
      });

      test("class with fancy bounded type params", () => {
        const content = rbs(`
          class Foo[U < singleton(::Hash), V < W[X, Y]]
          end
        `);

        return expect(content).toMatchFormat();
      });
    }

    test("class with annotations", () => {
      const content = rbs(`
        %a{This is an annotation.}
        class Foo
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("class with annotations that cannot be switched to braces", () => {
      const content = rbs(`
        %a<This is {an} annotation.>
        class Foo
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("class with comments", () => {
      const content = rbs(`
        # This is a comment.
        class Foo
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("class with superclass", () => {
      const content = rbs(`
        class Foo < Bar
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("module", () => {
      const content = rbs(`
        module Foo
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("module with type params", () => {
      const content = rbs(`
        module Foo[A, B]
        end
      `);

      return expect(content).toMatchFormat();
    });

    test("module with self types", () => {
      const content = rbs(`
        module Foo : A
        end
      `);

      return expect(content).toMatchFormat();
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

      return expect(content).toChangeFormat(expected);
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
      return expect(rbs("T: +1")).toChangeFormat("T: 1");
    });

    test("uses default quotes", () => {
      return expect(rbs(`T: "foo"`)).toMatchFormat();
    });

    test("changes quotes to match", () => {
      return expect(rbs("T: 'foo'")).toChangeFormat(`T: "foo"`);
    });

    test("keeps string the same when there is an escape sequence", () => {
      return expect(rbs(`T: "super \\a duper"`)).toMatchFormat();
    });

    test("unescapes double quotes when using single quotes", () => {
      return expect(rbs(`T: "super \\" duper"`)).toChangeFormat(
        `T: "super \\" duper"`
      );
    });

    test("unescapes single quotes when using double quotes", () => {
      return expect(rbs(`T: 'super \\' duper'`)).toChangeFormat(
        `T: 'super \\' duper'`
      );
    });

    test("maintains escape sequences when using double quotes", () => {
      return expect(
        rbs(`T: "escape sequences \\a\\b\\e\\f\\n\\r"`)
      ).toMatchFormat();
    });

    test("maintains not escape sequences when using single quotes", () => {
      return expect(
        rbs(`T: 'escape sequences \\a\\b\\e\\f\\n\\r'`)
      ).toMatchFormat();
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
      return expect(rbs("T: :foo ?")).toChangeFormat("T: :foo?");
    });
  });

  describeCases("plain", (source) => `T: ${source}`);

  describe("proc", () => {
    testCases("proc", (source) => `T: ${source}`);

    test("drops optional parentheses when there are no params", () => {
      return expect(rbs("T: ^() -> void")).toChangeFormat("T: ^-> void");
    });

    test("drops optional parentheses with block param when there are no params to the block", () => {
      return expect(rbs("T: ^{ () -> void } -> void")).toChangeFormat(
        "T: ^{ -> void } -> void"
      );
    });
  });

  describeCases("record", (source) => `T: ${source}`);

  // For some reason these tests are failing on windows on Ruby < 3.0. I'm not
  // sure why, but I'm leaving it here for now.
  if (platform() !== "win32" || atLeastVersion("3.0")) {
    describe("non-ASCII", () => {
      test("emoji", () => {
        return expect(rbs(`T: { "🌼" => Integer }`)).toMatchFormat();
      });

      test("kanji", () => {
        return expect(rbs(`T: { "日本語" => Integer }`)).toMatchFormat();
      });
    });
  }

  describeCases("tuple", (source) => `T: ${source}`);
});
