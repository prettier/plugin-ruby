import path from "path";
import { FileInfoOptions, getFileInfo } from "prettier";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require("../../src/plugin");

function getInferredParser(filename: string) {
  const filepath = path.join(__dirname, filename);
  const fileInfoOptions = { plugins: [plugin] } as any as FileInfoOptions;

  return getFileInfo(filepath, fileInfoOptions).then(
    ({ inferredParser }) => inferredParser
  );
}

describe("files", () => {
  const cases = ["files/Gemfile", "files/shebang", "files/test.rake"];

  test.each(cases)("infers Ruby parser from %s", (filename) =>
    expect(getInferredParser(filename)).resolves.toBe("ruby")
  );
});
