function globalTeardown() {
  // Send a SIGINT over to the async parser process so that we can be sure we've
  // terminated it before we finish the test suite.
  (global as any).__ASYNC_PARSER__.kill("SIGINT");
}

export default globalTeardown;
