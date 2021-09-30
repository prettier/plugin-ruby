// eslint-disable-next-line @typescript-eslint/no-var-requires
const { existsSync, readFileSync } = require("fs");

const filepath = process.argv[process.argv.length - 1];

const timeout = setTimeout(() => {
  clearInterval(interval);
  throw new Error("Failed to get information from parse server in time.");
}, 5000);

const interval = setInterval(() => {
  if (existsSync(filepath)) {
    process.stdout.write(readFileSync(filepath).toString("utf8"));
    clearTimeout(timeout);
    clearInterval(interval);
  }
}, 100);
