import fs from "fs";

// If a parse server was successfully spawned, then its process ID will be in
// the PRETTIER_RUBY_PID environment variable. At the end of the test suite we
// should send a kill signal to it.
function globalTeardown() {
  const serverPID = process.env.PRETTIER_RUBY_PID;
  const connectionFilepath = process.env.PRETTIER_RUBY_FILE;

  if (serverPID) {
    try {
      const pid = process.platform === "win32" ? serverPID : -serverPID;
      process.kill(pid, "SIGINT");
    } catch (error) {
      console.error("Failed to kill the parser process in globalTeardown.");
      throw error;
    }
  }

  if (fs.existsSync(connectionFilepath)) {
    fs.unlinkSync(connectionFilepath);
  }
}

export default globalTeardown;
