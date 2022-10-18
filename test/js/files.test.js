import { getFileInfo } from "prettier";
import url from "url";
import plugin from "../../src/plugin.js";

async function getInferredParser(filename) {
  const filepath = url.fileURLToPath(new URL(filename, import.meta.url));
  const fileInfoOptions = { plugins: [plugin] };

  const { inferredParser } = await getFileInfo(filepath, fileInfoOptions);
  return inferredParser;
}

describe("files", () => {
  const cases = ["files/Gemfile", "files/shebang", "files/test.rake"];

  test.each(cases)("infers Ruby parser from %s", (filename) =>
    expect(getInferredParser(filename)).resolves.toBe("ruby")
  );
});
