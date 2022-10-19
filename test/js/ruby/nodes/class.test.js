import { long, ruby } from "../../utils.js";

describe("class", () => {
  test("basic nesting", () => {
    const content = ruby(`
      module Pret
        module Tier
          class Plugin
          end

          module Ruby
          end
        end
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("inheritance", () => {
    const content = ruby(`
      module Prettier
        class Ruby < Object
        end
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("breaking class name", () => {
    return expect(`class P${long}; end`).toChangeFormat(`class P${long}\nend`);
  });

  test("breaking module name", () => {
    return expect(`module P${long}; end`).toChangeFormat(
      `module P${long}\nend`
    );
  });

  test("class push blocks", () => {
    const content = ruby(`
      class << Prettier
        def foo
        end
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("multiple access controls", () => {
    const content = ruby(`
      class Prettier
        public

        def public_method
          # some method body
        end

        protected

        def protected_method
          # some method body
        end

        private

        def private_method
          # some method body
        end
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("method helper", () => {
    const content = ruby(`
      class Prettier
        helper def foo
          # some method body
        end
      end
    `);

    return expect(content).toMatchFormat();
  });

  describe.each(["public", "protected", "private"])(
    "%s access control",
    (keyword) => {
      test("basic", () => {
        const content = ruby(`
        class Prettier
          ${keyword}

          def method
            # some method body
          end
        end
      `);

        return expect(content).toMatchFormat();
      });

      test("inline", () => {
        const content = ruby(`
        class Prettier
          ${keyword} def method
            # some method body
          end
        end
      `);

        return expect(content).toMatchFormat();
      });
    }
  );

  describe("constant reference", () => {
    test("regular", () => {
      return expect("Pret::Tier::Ruby").toMatchFormat();
    });

    test("top-level", () => {
      return expect("::Pret::Tier::Ruby").toMatchFormat();
    });
  });
});
