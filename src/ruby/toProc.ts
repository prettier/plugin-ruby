import type { Plugin, Ruby } from "../types";

function isPeriod(node: Ruby.CallOperator) {
  // Older versions of Ruby didn't have a @period ripper event, so we need to
  // explicitly cast to any here.
  if (node === "::" || (node as any) === ".") {
    return true;
  }

  return node.type === "period";
}

// If you have a simple block that only calls a method on the single required
// parameter that is passed to it, then you can replace that block with the
// simpler `Symbol#to_proc`. Meaning, it would go from:
//
//     [1, 2, 3].map { |i| i.to_s }
//
// to:
//
//     [1, 2, 3].map(&:to_s)
//
// This works with `do` blocks as well.
function toProc(
  path: Plugin.Path<Ruby.Args | Ruby.MethodAddBlock>,
  node: Ruby.BraceBlock | Ruby.DoBlock
) {
  // Ensure that there are variables being passed to this block.
  const params = node.block_var && node.block_var.params;
  if (!params) {
    return null;
  }

  // Ensure there is one and only one parameter, and that it is required.
  if (
    params.reqs.length !== 1 ||
    params.opts.length !== 0 ||
    params.rest ||
    params.posts.length !== 0 ||
    params.keywords.length !== 0 ||
    params.kwrest ||
    params.block
  ) {
    return null;
  }

  // Get the list of statements from the block
  let statements: Ruby.AnyNode[];

  if (node.type === "do_block") {
    // If you have any other clauses on the bodystmt, then we can't transform.
    if (node.bodystmt.rsc || node.bodystmt.els || node.bodystmt.ens) {
      return null;
    }

    statements = node.bodystmt.stmts.body;
  } else {
    statements = node.stmts.body;
  }

  // Ensure the block contains only one statement
  if (statements.length !== 1) {
    return null;
  }

  // Ensure that statement is a call and that it has no comments attached
  const [call] = statements;
  if (call.type !== "call" || call.comments) {
    return null;
  }

  // Ensure the call is a method of the block argument
  if (
    call.receiver.type !== "var_ref" ||
    call.receiver.value.value !== params.reqs[0].value ||
    !isPeriod(call.op) ||
    call.message === "call" ||
    call.message.type !== "ident"
  ) {
    return null;
  }

  // Ensure that we're not inside of a hash that is being passed to a key that
  // corresponds to `:if` or `:unless` to avoid problems with callbacks with
  // Rails. For more context, see:
  // https://github.com/prettier/plugin-ruby/issues/449
  let parentNode = null;

  if (path.getValue().type === "method_add_block") {
    parentNode = path.getParentNode();
  } else {
    parentNode = path.getParentNode(2);
  }

  if (parentNode && parentNode.type === "assoc") {
    const assocNode = parentNode as Ruby.Assoc;
    const key = assocNode.key;

    if (key.type === "label" && ["if:", "unless:"].includes(key.value)) {
      return null;
    }

    if (
      key.type === "symbol_literal" &&
      ["if", "unless"].includes(key.value.value)
    ) {
      return null;
    }
  }

  return `&:${call.message.value}`;
}

export default toProc;
