import { haml } from "../utils";

describe("plain", () => {
  const specialChars = ["%", ".", "#", "/", "!", "=", "&", "~", "-", "\\", ":"];

  test.each(specialChars)("escapes starting %s", (specialChar) => {
    return expect(haml(`\\${specialChar}`)).toMatchFormat();
  });

  test("does not unnecessarily escape other characters", () => {
    return expect(haml("foo")).toMatchFormat();
  });
});
