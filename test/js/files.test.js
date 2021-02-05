const path = require("path");
const { getFileInfo } = require("prettier");

const plugin = require("../../src/plugin");

function getInferredParser(filename) {
  const filepath = path.join(__dirname, filename);

  return getFileInfo(filepath, { plugins: [plugin] }).then(
    ({ inferredParser }) => inferredParser
  );
}

describe("files", () => {
  const cases = ["files/Gemfile", "files/shebang", "files/test.rake"];

  test.each(cases)("infers Ruby parser from %s", (filename) =>
    expect(getInferredParser(filename)).resolves.toBe("ruby")
  );
});
