describe("plain", () => {
  const specialChars = ["%", ".", "#", "/", "!", "=", "&", "~", "-", "\\", ":"];

  test.each(specialChars)("escapes starting %s", (specialChar) => {
    expect(`\\${specialChar}`).toMatchHamlFormat();
  });

  test("does not unnecessarily escape other characters", () => {
    expect("foo").toMatchHamlFormat();
  });
});
