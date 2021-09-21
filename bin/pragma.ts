#!./node_modules/.bin/ts-node

import fs from "fs";
import parser from "../src/ruby/parser";

console.log(parser.hasPragma(fs.readFileSync(process.argv[2], "utf-8")));
