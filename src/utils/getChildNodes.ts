import type { Ruby } from "../types";

type AnyNode = Ruby.AnyNode | Ruby.VoidStmt;
type ChildNode = AnyNode | null;

function throwBadNode(node: never): never;
function throwBadNode(node: AnyNode) {
  throw new Error(`Unknown node ${node.type}`);
}

function getChildNodes(node: AnyNode): ChildNode[] {
  switch (node.type) {
    case "CHAR":
    case "__end__":
    case "backref":
    case "backtick":
    case "const":
    case "cvar":
    case "float":
    case "gvar":
    case "heredoc_beg":
    case "ident":
    case "imaginary":
    case "int":
    case "ivar":
    case "kw":
    case "label":
    case "lbrace":
    case "lparen":
    case "op":
    case "period":
    case "rational":
    case "tstring_content":
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
    case "args":
      return node.parts;
    case "args_add_block":
      return [node.args, node.block];
    case "args_forward":
      return [];
    case "arg_star":
      return [node.value];
    case "array":
      return [node.cnts];
    case "aryptn":
      return [node.constant, ...node.reqs, node.rest, ...node.posts];
    case "assign":
      return [node.target, node.value];
    case "assoc":
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
    case "bodystmt":
      return [node.stmts, node.rsc, node.els, node.ens];
    case "brace_block":
      return [node.lbrace, node.block_var, node.stmts];
    case "break":
      return [node.args];
    case "call": {
      const childNodes: ChildNode[] = [node.receiver];

      if (node.op !== "::") {
        childNodes.push(node.op);
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
    case "def_endless":
      return [node.name, node.paren, node.stmt];
    case "defined":
      return [node.value];
    case "defs":
      return [node.target, node.op, node.name, node.params, node.bodystmt];
    case "do_block":
      return [node.keyword, node.block_var, node.bodystmt];
    case "dot2":
      return [node.left, node.right];
    case "dot3":
      return [node.left, node.right];
    case "dyna_symbol":
      return node.parts;
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

      if (node.op !== "::") {
        childNodes.push(node.op);
      }

      childNodes.push(node.name);
      return childNodes;
    }
    case "fndptn":
      return [node.constant, node.left, ...node.values, node.right];
    case "for":
      return [node.index, node.collection, node.stmts];
    case "hash":
      return [node.cnts];
    case "heredoc":
      return [node.beging, ...node.parts];
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
      return [node.pattern, node.stmts, node.cons];
    case "kwrest_param":
      return [node.name];
    case "lambda":
      return [node.params, node.stmts];
    case "massign":
      return [node.target, node.value];
    case "method_add_arg":
      return [node.call, node.args];
    case "method_add_block":
      return [node.call, node.block];
    case "mlhs":
      return node.parts;
    case "mlhs_paren":
      return [node.cnts];
    case "module":
      return [node.constant, node.bodystmt];
    case "mrhs":
      return node.parts;
    case "mrhs_add_star":
      return [node.mrhs, node.star];
    case "mrhs_new_from_args":
      return [node.args];
    case "next":
      return [node.args];
    case "not":
      return [node.value];
    case "opassign":
      return [node.target, node.op, node.value];
    case "params": {
      let childNodes: ChildNode[] = [...node.reqs];

      node.opts.forEach(([key, value]) => {
        childNodes.push(key, value);
      });

      childNodes.push(node.rest);
      childNodes = childNodes.concat(node.posts);

      node.keywords.forEach(([key, value]) => {
        childNodes.push(key);

        if (value) {
          childNodes.push(value);
        }
      });

      if (node.kwrest && node.kwrest !== "nil") {
        childNodes.push(node.kwrest);
      }

      if (node.block) {
        childNodes.push(node.block);
      }

      return childNodes;
    }
    case "paren":
      return [node.lparen, node.cnts];
    case "program":
      return [node.stmts];
    case "qsymbols":
      return [];
    case "qwords":
      return [];
    case "rassign":
      return [node.value, node.op, node.pattern];
    case "redo":
      return [];
    case "regexp_literal":
      return node.parts;
    case "rescue":
      return [node.extn, node.stmts, node.cons];
    case "rescue_ex":
      return [node.extns, node.var];
    case "rescue_mod":
      return [node.stmt, node.value];
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
    case "statements":
      return node.body;
    case "string_concat":
      return [node.left, node.right];
    case "string_dvar":
      return [node.var];
    case "string_embexpr":
      return [node.stmts];
    case "string_literal":
      return node.parts;
    case "super":
      return [node.args];
    case "symbol_literal":
      return [node.value];
    case "symbols":
      return [];
    case "top_const_field":
      return [node.constant];
    case "top_const_ref":
      return [node.constant];
    case "unary":
      return [node.value];
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
    default:
      throwBadNode(node);
  }
}

export default getChildNodes;
