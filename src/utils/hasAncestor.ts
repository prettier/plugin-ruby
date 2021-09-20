import type { Plugin } from "../types";

function hasAncestor(path: Plugin.Path<{ type: string }>, types: string[]) {
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

export default hasAncestor;
