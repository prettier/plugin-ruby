// eslint-disable-next-line @typescript-eslint/no-var-requires
const { existsSync, readFileSync } = require("fs");

const filepath = process.argv[process.argv.length - 1];
const timeout = setInterval(() => {
  if (existsSync(filepath)) {
    process.stdout.write(readFileSync(filepath).toString("utf8"));
    clearTimeout(timeout);
  }
}, 50);
