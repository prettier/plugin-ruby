import { getFileInfo } from "prettier";
import url from "url";
import plugin from "../../src/plugin.js";

describe("files", () => {
  const cases = ["files/Gemfile", "files/shebang", "files/test.rake"];

  test.each(cases)("infers Ruby parser from %s", async (filename) => {
    const filepath = url.fileURLToPath(new URL(filename, import.meta.url));
    const fileInfoOptions = { plugins: [plugin] };

    const { inferredParser } = await getFileInfo(filepath, fileInfoOptions);
    expect(inferredParser).toEqual("ruby");
  });
});
