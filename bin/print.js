#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { formatWithCursor } from "prettier";

import plugin from "../src/plugin.js";

let parser = "ruby";
let contentIdx = 2;

if (["rbs", "haml"].includes(process.argv[contentIdx])) {
  parser = process.argv[contentIdx];
  contentIdx += 1;
}

let content;

if (existsSync(process.argv[contentIdx])) {
  content = readFileSync(process.argv[contentIdx], "utf-8");
} else if (process.argv.length === contentIdx) {
  const extension = parser === "ruby" ? "rb" : parser;
  content = readFileSync(`test.${extension}`, "utf-8");
} else {
  content = process.argv.slice(contentIdx).join(" ").replace(/\\n/g, "\n");
}

formatWithCursor(content, {
  parser,
  plugins: [plugin],
  cursorOffset: 1
}).then(({ formatted }) => console.log(formatted));
