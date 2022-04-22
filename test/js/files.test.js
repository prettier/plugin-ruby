const path = require("path");
const prettier = require("prettier");

const plugin = require("../../src/plugin");

function getInferredParser(filename) {
  const filepath = path.join(__dirname, filename);
  const fileInfoOptions = { plugins: [plugin] };

  return prettier.getFileInfo(filepath, fileInfoOptions).then(
    ({ inferredParser }) => inferredParser
  );
}

describe("files", () => {
  const cases = ["files/Gemfile", "files/shebang", "files/test.rake"];

  test.each(cases)("infers Ruby parser from %s", (filename) =>
    expect(getInferredParser(filename)).resolves.toBe("ruby")
  );
});
