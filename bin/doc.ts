#!./node_modules/.bin/ts-node

import fs from "fs";
import prettier from "prettier";

import plugin from "../src/plugin";

const debug = (prettier as any).__debug;

const code = fs.existsSync(process.argv[2])
  ? fs.readFileSync(process.argv[2], "utf-8")
  : process.argv.slice(2).join(" ").replace(/\\n/g, "\n");

const doc = debug.printToDoc(code, { parser: "ruby", plugins: [plugin] });
console.log(debug.formatDoc(doc));
