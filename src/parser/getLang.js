// In order to properly parse ruby code, we need to tell the ruby process to
// parse using UTF-8. Unfortunately, the way that you accomplish this looks
// differently depending on your platform.
/* istanbul ignore next */
function getLang() {
  const { env, platform } = process;
  const envValue = env.LC_ALL || env.LC_CTYPE || env.LANG;

  // If an env var is set for the locale that already includes UTF-8 in the
  // name, then assume we can go with that.
  if (envValue && envValue.includes("UTF-8")) {
    return envValue;
  }

  // Otherwise, we're going to guess which encoding to use based on the system.
  // This is probably not the best approach in the world, as you could be on
  // linux and not have C.UTF-8, but in that case you're probably passing an env
  // var for it. This object below represents all of the possible values of
  // process.platform per:
  // https://nodejs.org/api/process.html#process_process_platform
  return {
    aix: "C.UTF-8",
    darwin: "en_US.UTF-8",
    freebsd: "C.UTF-8",
    linux: "C.UTF-8",
    openbsd: "C.UTF-8",
    sunos: "C.UTF-8",
    win32: ".UTF-8"
  }[platform];
}

module.exports = getLang;
