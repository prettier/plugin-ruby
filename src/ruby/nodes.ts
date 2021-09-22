import type { Plugin, Ruby } from "../types";

import { printAlias } from "./nodes/alias";
import { printAref, printArefField } from "./nodes/aref";
import {
  printArgParen,
  printArgs,
  printArgsAddBlock,
  printArgsAddStar,
  printBlockArg
} from "./nodes/args";
import { printArray, printWord } from "./nodes/arrays";
import {
  printAssign,
  printOpAssign,
  printVarField,
  printVarRef
} from "./nodes/assign";
import { printBlockVar, printBraceBlock, printDoBlock } from "./nodes/blocks";
import {
  printCall,
  printCallContainer,
  printMethodAddArg,
  printMethodAddBlock
} from "./nodes/calls";
import { printCase, printWhen } from "./nodes/case";
import { printClass, printModule, printSClass } from "./nodes/class";
import { printCommand, printCommandCall } from "./nodes/commands";
import {
  printElse,
  printElsif,
  printIf,
  printIfModifier,
  printTernary,
  printUnless,
  printUnlessModifier
} from "./nodes/conditionals";
import {
  printConstPath,
  printConstRef,
  printDefined,
  printField,
  printTopConst
} from "./nodes/constants";
import { printBreak, printNext, printYield, printYield0 } from "./nodes/flow";
import {
  printAssocNew,
  printAssocSplat,
  printHash,
  printHashContents
} from "./nodes/hashes";
import { printHeredoc } from "./nodes/heredocs";
import { printBEGIN, printEND } from "./nodes/hooks";
import { printInt } from "./nodes/ints";
import { printLambda } from "./nodes/lambdas";
import {
  printFor,
  printUntil,
  printUntilModifer,
  printWhile,
  printWhileModifier
} from "./nodes/loops";
import {
  printMAssign,
  printMLHS,
  printMLHSAddPost,
  printMLHSAddStar,
  printMLHSParen,
  printMRHS,
  printMRHSAddStar,
  printMRHSNewFromArgs
} from "./nodes/massign";
import {
  printAccessControl,
  printDef,
  printSingleLineMethod
} from "./nodes/methods";
import {
  printBinary,
  printDot2,
  printDot3,
  printUnary
} from "./nodes/operators";
import {
  printArgsForward,
  printKeywordRestParam,
  printParams,
  printRestParam
} from "./nodes/params";
import {
  printAryPtn,
  printFndPtn,
  printHshPtn,
  printIn,
  printRAssign
} from "./nodes/patterns";
import { printRegexpLiteral } from "./nodes/regexp";
import {
  printBegin,
  printEnsure,
  printRedo,
  printRescue,
  printRescueEx,
  printRescueMod,
  printRetry
} from "./nodes/rescue";
import { printReturn, printReturn0 } from "./nodes/return";
import {
  printBodyStmt,
  printComment,
  printEndContent,
  printParen,
  printProgram,
  printStmts
} from "./nodes/statements";
import {
  printChar,
  printDynaSymbol,
  printStringConcat,
  printStringDVar,
  printStringEmbExpr,
  printStringLiteral,
  printSymbolLiteral,
  printXStringLiteral
} from "./nodes/strings";
import { printSuper, printZSuper } from "./nodes/super";
import { printUndef } from "./nodes/undef";

const nodes: Partial<{
  [_T in Ruby.AnyNode["type"] | "@comment"]: Plugin.Printer<any>;
}> = {
  "@__end__": printEndContent,
  "@CHAR": printChar,
  "@comment": printComment,
  "@int": printInt,
  access_ctrl: printAccessControl,
  alias: printAlias,
  aref: printAref,
  aref_field: printArefField,
  arg_paren: printArgParen,
  args: printArgs,
  args_add_block: printArgsAddBlock,
  args_add_star: printArgsAddStar,
  args_forward: printArgsForward,
  array: printArray,
  aryptn: printAryPtn,
  assign: printAssign,
  assoc_new: printAssocNew,
  assoc_splat: printAssocSplat,
  assoclist_from_args: printHashContents,
  bare_assoc_hash: printHashContents,
  BEGIN: printBEGIN,
  begin: printBegin,
  binary: printBinary,
  blockarg: printBlockArg,
  block_var: printBlockVar,
  bodystmt: printBodyStmt,
  brace_block: printBraceBlock,
  break: printBreak,
  call: printCall,
  case: printCase,
  class: printClass,
  command: printCommand,
  command_call: printCommandCall,
  const_path_field: printConstPath,
  const_path_ref: printConstPath,
  const_ref: printConstRef,
  def: printDef,
  defs: printDef,
  defsl: printSingleLineMethod,
  defined: printDefined,
  do_block: printDoBlock,
  dot2: printDot2,
  dot3: printDot3,
  dyna_symbol: printDynaSymbol,
  else: printElse,
  elsif: printElsif,
  END: printEND,
  ensure: printEnsure,
  fcall: printCallContainer,
  fndptn: printFndPtn,
  field: printField,
  for: printFor,
  hash: printHash,
  heredoc: printHeredoc,
  hshptn: printHshPtn,
  if: printIf,
  ifop: printTernary,
  if_mod: printIfModifier,
  in: printIn,
  kwrest_param: printKeywordRestParam,
  lambda: printLambda,
  massign: printMAssign,
  method_add_arg: printMethodAddArg,
  method_add_block: printMethodAddBlock,
  mlhs: printMLHS,
  mlhs_add_post: printMLHSAddPost,
  mlhs_add_star: printMLHSAddStar,
  mlhs_paren: printMLHSParen,
  mrhs: printMRHS,
  mrhs_add_star: printMRHSAddStar,
  mrhs_new_from_args: printMRHSNewFromArgs,
  module: printModule,
  next: printNext,
  opassign: printOpAssign,
  params: printParams,
  paren: printParen,
  program: printProgram,
  rassign: printRAssign,
  redo: printRedo,
  regexp_literal: printRegexpLiteral,
  rescue: printRescue,
  rescue_ex: printRescueEx,
  rescue_mod: printRescueMod,
  rest_param: printRestParam,
  retry: printRetry,
  return: printReturn,
  return0: printReturn0,
  sclass: printSClass,
  stmts: printStmts,
  string_concat: printStringConcat,
  string_dvar: printStringDVar,
  string_embexpr: printStringEmbExpr,
  string_literal: printStringLiteral,
  super: printSuper,
  symbol_literal: printSymbolLiteral,
  top_const_field: printTopConst,
  top_const_ref: printTopConst,
  unary: printUnary,
  undef: printUndef,
  unless: printUnless,
  unless_mod: printUnlessModifier,
  until: printUntil,
  until_mod: printUntilModifer,
  var_alias: printAlias,
  var_field: printVarField,
  var_ref: printVarRef,
  vcall: printCallContainer,
  when: printWhen,
  while: printWhile,
  while_mod: printWhileModifier,
  word: printWord,
  xstring_literal: printXStringLiteral,
  yield: printYield,
  yield0: printYield0,
  zsuper: printZSuper
};

export default nodes;
