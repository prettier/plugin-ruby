function globalTeardown() {
  const prettierRubyPID = process.env.PRETTIER_RUBY_PID;

  if (prettierRubyPID) {
    process.kill(-parseInt(prettierRubyPID, 10));
  }
}

export default globalTeardown;
