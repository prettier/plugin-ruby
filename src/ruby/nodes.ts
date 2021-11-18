import type { Plugin, Ruby } from "../types";

import { printAlias } from "./nodes/alias";
import { printAref, printArefField } from "./nodes/aref";
import {
  printArgParen,
  printArgs,
  printArgsAddBlock,
  printArgStar,
  printBlockArg
} from "./nodes/args";
import {
  printArray,
  printQsymbols,
  printQwords,
  printSymbols,
  printWord,
  printWords
} from "./nodes/arrays";
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
  printAssoc,
  printAssocSplat,
  printHash,
  printHashContents
} from "./nodes/hashes";
import { printHeredoc } from "./nodes/heredocs";
import { printBEGIN, printEND } from "./nodes/hooks";
import { printInt } from "./nodes/ints";
import { printLambda } from "./nodes/lambdas";
import { printFor, printUntil, printWhile } from "./nodes/loops";
import {
  printMAssign,
  printMLHS,
  printMLHSParen,
  printMRHS,
  printMRHSAddStar,
  printMRHSNewFromArgs
} from "./nodes/massign";
import { printAccessControl, printDef, printDefEndless } from "./nodes/methods";
import {
  printBinary,
  printDot2,
  printDot3,
  printNot,
  printUnary
} from "./nodes/operators";
import {
  printArgsForward,
  printExcessedComma,
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
  printStatements
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

type Token =
  | Ruby.EndContent
  | Ruby.Backref
  | Ruby.Backtick
  | Ruby.Const
  | Ruby.CVar
  | Ruby.Float
  | Ruby.GVar
  | Ruby.HeredocBegin
  | Ruby.Identifier
  | Ruby.Imaginary
  | Ruby.Int
  | Ruby.IVar
  | Ruby.Keyword
  | Ruby.Label
  | Ruby.Lbrace
  | Ruby.Lparen
  | Ruby.Op
  | Ruby.Period
  | Ruby.Rational
  | Ruby.TStringContent;

const printToken: Plugin.Printer<Token> = (path) => path.getValue().value;
const printVoidStmt: Plugin.Printer<Ruby.VoidStmt> = () => "";

const nodes: Record<
  Ruby.AnyNode["type"] | "comment" | "embdoc",
  Plugin.Printer<any>
> = {
  BEGIN: printBEGIN,
  CHAR: printChar,
  END: printEND,
  __end__: printEndContent,
  access_ctrl: printAccessControl,
  alias: printAlias,
  aref: printAref,
  aref_field: printArefField,
  arg_paren: printArgParen,
  args: printArgs,
  args_add_block: printArgsAddBlock,
  args_forward: printArgsForward,
  arg_star: printArgStar,
  array: printArray,
  aryptn: printAryPtn,
  assign: printAssign,
  assoc: printAssoc,
  assoc_splat: printAssocSplat,
  assoclist_from_args: printHashContents,
  backref: printToken,
  backtick: printToken,
  bare_assoc_hash: printHashContents,
  begin: printBegin,
  binary: printBinary,
  block_var: printBlockVar,
  blockarg: printBlockArg,
  bodystmt: printBodyStmt,
  brace_block: printBraceBlock,
  break: printBreak,
  call: printCall,
  case: printCase,
  class: printClass,
  command: printCommand,
  command_call: printCommandCall,
  comment: printComment,
  const: printToken,
  const_path_field: printConstPath,
  const_path_ref: printConstPath,
  const_ref: printConstRef,
  cvar: printToken,
  def: printDef,
  def_endless: printDefEndless,
  defined: printDefined,
  defs: printDef,
  do_block: printDoBlock,
  dot2: printDot2,
  dot3: printDot3,
  dyna_symbol: printDynaSymbol,
  else: printElse,
  elsif: printElsif,
  embdoc: printComment,
  ensure: printEnsure,
  excessed_comma: printExcessedComma,
  fcall: printCallContainer,
  field: printField,
  float: printToken,
  fndptn: printFndPtn,
  for: printFor,
  gvar: printToken,
  hash: printHash,
  heredoc: printHeredoc,
  heredoc_beg: printToken,
  hshptn: printHshPtn,
  ident: printToken,
  if: printIf,
  if_mod: printIfModifier,
  ifop: printTernary,
  imaginary: printToken,
  in: printIn,
  int: printInt,
  ivar: printToken,
  kw: printToken,
  kwrest_param: printKeywordRestParam,
  label: printToken,
  lambda: printLambda,
  lbrace: printToken,
  lparen: printToken,
  massign: printMAssign,
  method_add_arg: printMethodAddArg,
  method_add_block: printMethodAddBlock,
  mlhs: printMLHS,
  mlhs_paren: printMLHSParen,
  module: printModule,
  mrhs: printMRHS,
  mrhs_add_star: printMRHSAddStar,
  mrhs_new_from_args: printMRHSNewFromArgs,
  next: printNext,
  not: printNot,
  op: printToken,
  opassign: printOpAssign,
  params: printParams,
  paren: printParen,
  period: printToken,
  program: printProgram,
  qsymbols: printQsymbols,
  qwords: printQwords,
  rassign: printRAssign,
  rational: printToken,
  redo: printRedo,
  regexp_literal: printRegexpLiteral,
  rescue: printRescue,
  rescue_ex: printRescueEx,
  rescue_mod: printRescueMod,
  rest_param: printRestParam,
  retry: printRetry,
  return0: printReturn0,
  return: printReturn,
  sclass: printSClass,
  statements: printStatements,
  string_concat: printStringConcat,
  string_dvar: printStringDVar,
  string_embexpr: printStringEmbExpr,
  string_literal: printStringLiteral,
  super: printSuper,
  symbol_literal: printSymbolLiteral,
  symbols: printSymbols,
  top_const_field: printTopConst,
  top_const_ref: printTopConst,
  tstring_content: printToken,
  unary: printUnary,
  undef: printUndef,
  unless: printUnless,
  unless_mod: printUnlessModifier,
  until: printUntil,
  until_mod: printUntil,
  var_alias: printAlias,
  var_field: printVarField,
  var_ref: printVarRef,
  vcall: printCallContainer,
  void_stmt: printVoidStmt,
  when: printWhen,
  while: printWhile,
  while_mod: printWhile,
  word: printWord,
  words: printWords,
  xstring_literal: printXStringLiteral,
  yield0: printYield0,
  yield: printYield,
  zsuper: printZSuper
};

export default nodes;
