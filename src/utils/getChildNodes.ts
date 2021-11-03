import type { Ruby } from "../types";

type ChildNode = Ruby.AnyNode | null;

function throwBadNode(node: never): never;
function throwBadNode(node: Ruby.AnyNode) {
  throw new Error(`Unknown node ${node.type}`);
}

function getChildNodes(node: Ruby.AnyNode): ChildNode[] {
  switch (node.type) {
    case "@CHAR":
    case "@__end__":
    case "@backref":
    case "@backtick":
    case "@const":
    case "@cvar":
    case "@float":
    case "@gvar":
    case "@heredoc_beg":
    case "@ident":
    case "@imaginary":
    case "@int":
    case "@ivar":
    case "@kw":
    case "@label":
    case "@lbrace":
    case "@lparen":
    case "@op":
    case "@period":
    case "@rational":
    case "@tstring_content":
      return [];
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
    case "arg_paren":
      return [node.args];
    case "args_forward":
      return [];
    case "array":
      return [node.cnts];
    case "aryptn":
      return [node.constant, ...node.reqs, node.rest, ...node.posts];
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
    case "call": {
      const childNodes: ChildNode[] = [node.receiver];

      if (node.operator !== "::") {
        childNodes.push(node.operator);
      }

      if (node.message !== "call") {
        childNodes.push(node.message);
      }

      return childNodes;
    }
    case "case":
      return [node.value, node.cons];
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
      return [node.pred, node.stmts, node.cons];
    case "ensure":
      return [node.keyword, node.stmts];
    case "excessed_comma":
      return [];
    case "fcall":
      return [node.value];
    case "field": {
      const childNodes: ChildNode[] = [node.parent];

      if (node.operator !== "::") {
        childNodes.push(node.operator);
      }

      childNodes.push(node.name);
      return childNodes;
    }
    case "fndptn":
      return [node.constant, node.left, ...node.values, node.right];
    case "for":
      return [node.iterator, node.enumerable, node.stmts];
    case "hash":
      return [node.cnts];
    case "hshptn": {
      const childNodes: ChildNode[] = [node.constant];

      node.keywords.forEach(([key, value]) => {
        childNodes.push(key, value);
      });

      childNodes.push(node.kwrest);
      return childNodes;
    }
    case "if":
      return [node.pred, node.stmts, node.cons];
    case "ifop":
      return [node.pred, node.tthy, node.flsy];
    case "if_mod":
      return [node.stmt, node.pred];
    case "in":
      return [node.pttn, node.stmts, node.cons];
    case "kwrest_param":
      return [node.name];
    case "lambda":
      return [node.params, node.stmts];
    case "massign":
      return [node.tgt, node.val];
    case "mlhs":
      return node.parts;
    case "mlhs_add_post":
      return [node.star, node.mlhs];
    case "mlhs_add_star":
      return [node.mlhs, node.star];
    case "mlhs_paren":
      return [node.cnts];
    case "module":
      return [node.constant, node.bodystmt];
    case "next":
      return [node.args];
    case "opassign":
      return [node.target, node.operator, node.value];
    case "paren":
      return [node.lparen, node.cnts];
    case "program":
      return [node.stmts];
    case "qsymbols":
      return [];
    case "qwords":
      return [];
    case "rassign":
      return [node.value, node.operator, node.pattern];
    case "redo":
      return [];
    case "regexp_literal":
      return node.parts;
    case "rescue":
      return [node.extn, node.stmts, node.cons];
    case "rescue_ex":
      return [node.extns, node.var];
    case "rescue_mod":
      return [node.stmt, node.val];
    case "rest_param":
      return [node.name];
    case "retry":
      return [];
    case "return":
      return [node.args];
    case "return0":
      return [];
    case "sclass":
      return [node.target, node.bodystmt];
    case "string_concat":
      return [node.left, node.right];
    case "string_dvar":
      return [node.var];
    case "string_embexpr":
      return [node.stmts];
    case "super":
      return [node.args];
    case "symbols":
      return [];
    case "top_const_field":
      return [node.constant];
    case "top_const_ref":
      return [node.constant];
    case "unary":
      return [node.val];
    case "undef":
      return node.syms;
    case "unless":
      return [node.pred, node.stmts, node.cons];
    case "unless_mod":
      return [node.stmt, node.pred];
    case "until":
      return [node.pred, node.stmts];
    case "until_mod":
      return [node.stmt, node.pred];
    case "var_alias":
      return [node.left, node.right];
    case "var_field":
      return [node.value];
    case "var_ref":
      return [node.value];
    case "vcall":
      return [node.value];
    case "void_stmt":
      return [];
    case "when":
      return [node.args, node.stmts, node.cons];
    case "while":
      return [node.pred, node.stmts];
    case "while_mod":
      return [node.stmt, node.pred];
    case "word":
      return node.parts;
    case "words":
      return [];
    case "xstring_literal":
      return node.parts;
    case "yield":
      return [node.args];
    case "yield0":
      return [];
    case "zsuper":
      return [];



    case "heredoc":
      return [node.beging];
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



    case "args":
    case "args_add_block":
    case "args_add_star":
    case "bodystmt":
    case "method_add_arg":
    case "method_add_block":
    case "mrhs":
    case "mrhs_add_star":
    case "mrhs_new_from_args":
    case "stmts":
    case "string_literal":
    case "symbol_literal": {
      if (Array.isArray(node.body)) {
        return node.body.filter(
          (child: any) => child && typeof child === "object"
        );
      }
      return [];
    }


    default:
      throwBadNode(node);
  }
}

export default getChildNodes;
