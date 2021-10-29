import type { Ruby } from "../types";

function getChildNodes(node: Ruby.AnyNode): (Ruby.AnyNode | null)[] {
  switch (node.type) {
    case "BEGIN":
      return [node.lbrace, node.stmts];
    case "END":
      return [node.lbrace, node.stmts];
    case "access_ctrl":
      return [node.value];
    case "alias":
      return [node.left, node.right];
    case "aref":
      return [node.collection, node.index];
    case "aref_field":
      return [node.collection, node.index];
    case "assign":
      return [node.target, node.value];
    case "assoc_new":
      return [node.key, node.value];
    case "assoc_splat":
      return [node.value];
    case "assoclist_from_args":
      return node.assocs;
    case "bare_assoc_hash":
      return node.assocs;
    case "begin":
      return [node.bodystmt];
    case "binary":
      return [node.left, node.right];
    case "block_var":
      return [node.params, ...node.locals];
    case "blockarg":
      return [node.name];
    case "brace_block":
      return [node.lbrace, node.block_var, node.stmts];
    case "break":
      return [node.args];
    case "case":
      return [node.value, node.consequent];
    case "class":
      return [node.constant, node.superclass, node.bodystmt];
    case "command":
      return [node.message, node.args];
    case "command_call":
      return [node.receiver, node.message, node.args];
    case "const_path_field":
      return [node.parent, node.constant];
    case "const_path_ref":
      return [node.parent, node.constant];
    case "const_ref":
      return [node.constant];
    case "def":
      return [node.name, node.params, node.bodystmt];
    case "defined":
      return [node.value];
    case "defs":
      return [node.target, node.operator, node.name, node.params, node.bodystmt];
    case "defsl":
      return [node.name, node.paren, node.stmt];
    case "do_block":
      return [node.keyword, node.block_var, node.bodystmt];
    case "dot2":
      return [node.left, node.right];
    case "dot3":
      return [node.left, node.right];
    case "dyna_symbol":
      return node.body;
    case "else":
      return [node.stmts];
    case "elsif":
      return [node.predicate, node.stmts, node.consequent];
    case "ensure":
      return [node.keyword, node.stmts];
    case "excessed_comma":
      return [];
    case "fcall":
      return [node.value];
    case "hash":
      return [node.contents];
    case "module":
      return [node.constant, node.bodystmt];
    case "next":
      return [node.args];
    case "opassign":
      return [node.target, node.operator, node.value];
    case "program":
      return [node.stmts];
    case "rassign":
      return [node.value, node.operator, node.pattern];
    case "return":
      return [node.args];
    case "sclass":
      return [node.target, node.bodystmt];
    case "top_const_field":
      return [node.constant];
    case "top_const_ref":
      return [node.constant];
    case "var_alias":
      return [node.left, node.right];
    case "var_field":
      return [node.value];
    case "var_ref":
      return [node.value];
    case "vcall":
      return [node.value];


    case "heredoc":
      return [node.beging];
    case "aryptn": {
      const parts: (Ruby.AnyNode | null)[] = [node.body[0]];

      return parts
        .concat(node.body[1])
        .concat(node.body[2])
        .concat(node.body[3]);
    }
    case "hshptn": {
      const pairs = node.body[1];
      const values = pairs.reduce(
        (left: any, right: any) => left.concat(right),
        []
      );

      return [node.body[0]].concat(values).concat(node.body[2]);
    }
    case "params": {
      const [reqs, optls, rest, post, kwargs, kwargRest, block] = node.body;
      let parts: (Ruby.AnyNode | null)[] = reqs || [];

      (optls || []).forEach((optl: any) => {
        parts = parts.concat(optl);
      });

      if (rest) {
        parts.push(rest);
      }

      parts = parts.concat(post || []);

      (kwargs || []).forEach((kwarg: any) => {
        if (kwarg[1]) {
          parts = parts.concat(kwarg);
        } else {
          parts.push(kwarg[0]);
        }
      });

      if (kwargRest && kwargRest !== "nil") {
        parts.push(kwargRest);
      }

      if (block) {
        parts.push(block);
      }

      return parts;
    }
    case "paren":
      return [node.lparen, node.body[0]];
    default: {
      if (Array.isArray(node.body)) {
        return node.body.filter(
          (child: any) => child && typeof child === "object"
        );
      }
      return [];
    }
  }
}

export default getChildNodes;
