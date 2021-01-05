const { haml } = require("../utils");

describe("doctype", () => {
  test("basic", () => expect(haml("!!! Basic")).toMatchFormat());

  test("frameset", () => expect(haml("!!! Frameset")).toMatchFormat());

  test("mobile", () => expect(haml("!!! Mobile")).toMatchFormat());

  test("rdfa", () => expect(haml("!!! RDFa")).toMatchFormat());

  test("strict", () => expect(haml("!!! Strict")).toMatchFormat());

  test("xml", () => expect(haml("!!! XML")).toMatchFormat());

  test("encoding", () => expect(haml("!!! XML iso-8859-1")).toMatchFormat());

  test("1.1", () => expect(haml("!!! 1.1")).toMatchFormat());

  test("5", () => expect(haml("!!! 5")).toMatchFormat());

  test("misc", () => expect(haml("!!! foo")).toMatchFormat());
});
