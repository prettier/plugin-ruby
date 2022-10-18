import { haml } from "../utils";

describe("doctype", () => {
  test("basic", () => {
    return expect(haml("!!! Basic")).toMatchFormat();
  });

  test("frameset", () => {
    return expect(haml("!!! Frameset")).toMatchFormat();
  });

  test("mobile", () => {
    return expect(haml("!!! Mobile")).toMatchFormat();
  });

  test("rdfa", () => {
    return expect(haml("!!! RDFa")).toMatchFormat();
  });

  test("strict", () => {
    return expect(haml("!!! Strict")).toMatchFormat();
  });

  test("xml", () => {
    return expect(haml("!!! XML")).toMatchFormat();
  });

  test("encoding", () => {
    return expect(haml("!!! XML iso-8859-1")).toMatchFormat();
  });

  test("1.1", () => {
    return expect(haml("!!! 1.1")).toMatchFormat();
  });

  test("5", () => {
    return expect(haml("!!! 5")).toMatchFormat();
  });

  test("misc", () => {
    return expect(haml("!!! foo")).toMatchFormat();
  });
});
