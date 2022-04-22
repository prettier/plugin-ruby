const { haml } = require("../utils");

describe("plain", () => {
  const specialChars = ["%", ".", "#", "/", "!", "=", "&", "~", "-", "\\", ":"];

  test.each(specialChars)("escapes starting %s", (specialChar) => {
    expect(haml(`\\${specialChar}`)).toMatchFormat();
  });

  test("does not unnecessarily escape other characters", () => {
    expect(haml("foo")).toMatchFormat();
  });
});
