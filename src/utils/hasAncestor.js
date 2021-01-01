function hasAncestor(path, types) {
  let parent = 0;
  let parentNode = path.getParentNode();

  while (parentNode) {
    if (types.includes(parentNode.type)) {
      return true;
    }

    parent += 1;
    parentNode = path.getParentNode(parent);
  }

  return false;
}

module.exports = hasAncestor;
