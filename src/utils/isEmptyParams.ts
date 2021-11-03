import type { Ruby } from "../types";

function isEmptyParams(node: Ruby.Params) {
  return (
    node.reqs.length === 0 &&
    node.opts.length === 0 &&
    !node.rest &&
    node.posts.length === 0 &&
    node.keywords.length === 0 &&
    !node.kwrest &&
    !node.block
  );
}

export default isEmptyParams;
