#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { __debug } from "prettier";
import plugin from "../src/plugin.js";

const code = existsSync(process.argv[2])
  ? readFileSync(process.argv[2], "utf-8")
  : process.argv.slice(2).join(" ").replace(/\\n/g, "\n");

const doc = __debug.printToDoc(code, { parser: "ruby", plugins: [plugin] });
console.log(__debug.formatDoc(doc));
