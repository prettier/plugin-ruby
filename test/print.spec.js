const print = require("../src/print");

test("when encountering an unsupported node type", () => {
    const path = { getValue: () => ({ type: "unsupported", body: {} }) };

    expect(() => print(path)).toThrow("Unsupported");
});
