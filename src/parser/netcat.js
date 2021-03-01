// A simple fallback when no netcat-compatible adapter is found on the system.
// On average, this is 2-3x slower than netcat, but still much faster than
// spawning a new Ruby process.

const { createConnection } = require("net");

const sock = process.argv[process.argv.length - 1];
const client = createConnection(sock, () => process.stdin.pipe(client));

client.on("data", (data) => process.stdout.write(data));
client.on("error", (error) => {
  console.error(error);
});
