import { atLeastVersion } from "../../utils.js";

describe("ranges", () => {
  test("two dot", () => {
    return expect("1..2").toMatchFormat();
  });

  test("negative two dot", () => {
    return expect("-2..-1").toMatchFormat();
  });

  test("three dot", () => {
    return expect("3...4").toMatchFormat();
  });

  test("negative three dot", () => {
    return expect("-4...-3").toMatchFormat();
  });

  if (atLeastVersion("2.6")) {
    test("two dot with no ending", () => {
      return expect("1..").toMatchFormat();
    });

    test("three dot with no ending", () => {
      return expect("1...").toMatchFormat();
    });
  }

  if (atLeastVersion("2.7")) {
    test("two dot with no beginning", () => {
      return expect("..2").toMatchFormat();
    });

    test("three dot with no beginning", () => {
      return expect("...2").toMatchFormat();
    });
  }
});
