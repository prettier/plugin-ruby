// eslint-disable-next-line @typescript-eslint/no-var-requires
const { existsSync, readFileSync } = require("fs");

// This is how long to wait for the parser to spin up. For the most part, 5
// seconds is plenty of time. But in some environments, it may be necessary to
// increase this value.
const timeoutMs = parseInt(process.env.PRETTIER_RUBY_TIMEOUT_MS || "5000", 10);

const filepath = process.argv[process.argv.length - 1];

const timeout = setTimeout(() => {
  clearInterval(interval);
  throw new Error(`Failed to get information from parse server in time. If this
    happens repeatedly, try increasing the PRETTIER_RUBY_TIMEOUT_MS environment
    variable beyond 5000.`);
}, timeoutMs);

const interval = setInterval(() => {
  if (existsSync(filepath)) {
    process.stdout.write(readFileSync(filepath).toString("utf8"));
    clearTimeout(timeout);
    clearInterval(interval);
  }
}, 100);
