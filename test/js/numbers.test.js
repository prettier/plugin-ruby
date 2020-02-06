describe("numbers", () => {
  test("basic", () => expect("123").toMatchFormat());

  test("preserves sign", () => expect("-123").toMatchFormat());

  test("auto adds o for octal numbers", () =>
    expect("0123").toChangeFormat("0o123"));

  test("does not consider numbers large until they have more than 4 digits", () =>
    expect("1234").toMatchFormat());

  test("for large numbers adds underscores (mod 3 ==== 0)", () =>
    expect("123456").toChangeFormat("123_456"));

  test("for large numbers adds underscores (mod 3 === 1)", () =>
    expect("1234567").toChangeFormat("1_234_567"));

  test("for large numbers add underscores (mod 3 ==== 2)", () =>
    expect("12345678").toChangeFormat("12_345_678"));

  test("ignores numbers that already have underscores", () =>
    expect("2019_04_17_17_09_00").toMatchFormat());

  test("ignores formatting on binary numbers", () =>
    expect("0b01101001").toMatchFormat());

  test("ignores formatting on octal numbers", () =>
    expect("0o123401234").toMatchFormat());

  test("ignores formatting on hex numbers", () =>
    expect("0x123401234").toMatchFormat());
});
