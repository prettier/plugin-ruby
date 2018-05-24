const lineNoFrom = node => {
  if (node === null) {
    return null;
  }

  if (node.lineno) {
    return node.lineno;
  }

  if (node.body) {
    for (let idx = node.body.length - 1; idx >= 0; idx -= 1) {
      const child = lineNoFrom(node.body[idx]);

      if (child) {
        return child;
      }
    }
  }

  return null;
};

module.exports = lineNoFrom;
