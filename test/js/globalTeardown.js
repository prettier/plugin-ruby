// If a parse server was successfully spawned, then its process ID will be in
// the PRETTIER_RUBY_PID environment variable. At the end of the test suite we
// should send a kill signal to it.
function globalTeardown() {
  const serverPID = process.env.PRETTIER_RUBY_PID;

  if (serverPID) {
    try {
      process.kill(parseInt(serverPID, 10), "SIGINT");
    } catch (e) {
      throw new Error("Failed to kill the parser process in globalTeardown.");
    }
  }
}

export default globalTeardown;
