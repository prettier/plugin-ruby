function makeCall(path, opts, print) {
  const operation = path.getValue().body[1];

  if ([".", "&."].includes(operation)) {
    return operation;
  }

  return operation === "::" ? "." : path.call(print, "body", 1);
}

module.exports = makeCall;
