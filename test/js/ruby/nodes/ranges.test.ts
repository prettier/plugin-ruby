import { atLeastVersion } from "../../utils";

describe("ranges", () => {
  test("two dot", () => expect("1..2").toMatchFormat());

  test("negative two dot", () => expect("-2..-1").toMatchFormat());

  test("three dot", () => expect("3...4").toMatchFormat());

  test("negative three dot", () => expect("-4...-3").toMatchFormat());

  if (atLeastVersion("2.6")) {
    test("two dot with no ending", () => expect("1..").toMatchFormat());

    test("three dot with no ending", () => expect("1...").toMatchFormat());
  }

  if (atLeastVersion("2.7")) {
    test("two dot with no beginning", () => expect("..2").toMatchFormat());

    test("three dot with no beginning", () => expect("...2").toMatchFormat());
  }
});
