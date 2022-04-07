#!./node_modules/.bin/ts-node

import fs from "fs";
import prettier from "prettier";

import plugin from "../src/plugin";

let parser = "ruby";
let contentIdx = 2;

if (["rbs", "haml"].includes(process.argv[contentIdx])) {
  parser = process.argv[contentIdx];
  contentIdx += 1;
}

let content;

if (fs.existsSync(process.argv[contentIdx])) {
  content = fs.readFileSync(process.argv[contentIdx], "utf-8");
} else if (process.argv.length === contentIdx) {
  const extension = parser === "ruby" ? "rb" : parser;
  content = fs.readFileSync(`test.${extension}`, "utf-8");
} else {
  content = process.argv.slice(contentIdx).join(" ").replace(/\\n/g, "\n");
}

const { formatted } = prettier.formatWithCursor(content, {
  parser,
  plugins: [plugin as any as string], // hacky, but it works
  cursorOffset: 1
} as any);

console.log(formatted);
