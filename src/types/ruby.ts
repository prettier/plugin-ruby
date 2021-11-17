// This file contains all of the types that represent objects being returned
// from our ripper-based parser.

// These are common additions to the various node types.
type Comments = { comments?: Comment[] };
export type Location = [number, number, number, number];

// These are utility types used to construct the various node types.
type ScannerEvent<T extends string> = { type: T, value: string, loc: Location } & Comments;
type ParserEvent0<T extends string> = { type: T, value: string, loc: Location } & Comments;
type ParserEvent<T, V = Record<string, unknown>> = { type: T, loc: Location } & Comments & V;

// This is the main expression type that goes in places where the AST will
// accept just about anything.
// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyNode = AccessCtrl | Alias | Aref | ArefField | ArgParen | Args | ArgsAddBlock | ArgsForward | ArgStar | Array | Aryptn | Assign | Assoc | AssocSplat | AssoclistFromArgs | BEGIN | Backref | Backtick | BareAssocHash | Begin | Binary | BlockVar | Blockarg | Bodystmt | BraceBlock | Break | CVar | Call | Case | Char | Class | Command | CommandCall | Const | ConstPathField | ConstPathRef | ConstRef | Def | Defined | Defs | DefEndless | DoBlock | Dot2 | Dot3 | DynaSymbol | END | Else | Elsif | EndContent | Ensure | ExcessedComma | Fcall | Field | Float | FndPtn | For | GVar | Hash | Heredoc | HeredocBegin | Hshptn | IVar | Identifier | If | IfModifier | Imaginary | In | Int | Keyword | KeywordRestParam | Label | Lambda | Lbrace | Lparen | Massign | MethodAddArg | MethodAddBlock | Mlhs | MlhsParen | Module | Mrhs | MrhsAddStar | MrhsNewFromArgs | Next | Not | Op | Opassign | Params | Paren | Period | Program | Qwords | Qsymbols | Rassign | Rational | Redo | RegexpLiteral | Rescue | RescueEx | RescueModifier | RestParam | Retry | Return | Return0 | Sclass | Statements | StringConcat | StringDVar | StringEmbExpr | StringLiteral | Super | Symbols | SymbolLiteral | TStringContent | Ternary | TopConstField | TopConstRef | Unary | Undef | Unless | UnlessModifier | Until | UntilModifier | VCall | VarAlias | VarField | VarRef | VoidStmt | When | While | WhileModifier | Word | Words | XStringLiteral | Yield | Yield0 | Zsuper

// This is a special scanner event that contains a comment. It can be attached
// to almost any kind of node, which is why it's pulled out here separately.
type UndecoratedComment = { type: "comment", value: string, inline: boolean, loc: Location };
type UndecoratedEmbDoc = { type: "embdoc", value: string, loc: Location };

// Prettier will attach various metadata to comment nodes, which we're adding in
// to the type here.
type CommentDecorations = { leading: boolean, printed: boolean };
export type Comment = UndecoratedComment & CommentDecorations;
export type EmbDoc = UndecoratedEmbDoc & CommentDecorations;

// These are the scanner events that contain only a single string. They're
// always leaves in the tree. Ignored ones that can't show up in the tree but
// are present in ripper include:
//
// comma, embdoc, embdoc_beg, embdoc_end, embexpr_beg, embexpr_end, embvar,
// heredoc_end, ignored_nl, ignored_sp, label_end, lbracket, nl, qsymbols_beg,
// qwords_beg, rbrace, rbracket, regexp_beg, regexp_end, rparen, semicolon, sp,
// symbbeg, symbols_beg, tlambda, tlambeg, tstring_beg, tstring_nd, words_beg,
// words_sep
//
export type Backref = ScannerEvent<"backref">;
export type Backtick = ScannerEvent<"backtick">;
export type Char = ScannerEvent<"CHAR">;
export type Const = ScannerEvent<"const">;
export type CVar = ScannerEvent<"cvar">;
export type EndContent = ScannerEvent<"__end__">;
export type Float = ScannerEvent<"float">;
export type GVar = ScannerEvent<"gvar">;
export type HeredocBegin = ScannerEvent<"heredoc_beg">;
export type Identifier = ScannerEvent<"ident">;
export type Imaginary = ScannerEvent<"imaginary">;
export type Int = ScannerEvent<"int">;
export type IVar = ScannerEvent<"ivar">;
export type Keyword = ScannerEvent<"kw">;
export type Label = ScannerEvent<"label">;
export type Lbrace = ScannerEvent<"lbrace">;
export type Lparen = ScannerEvent<"lparen">;
export type Op = ScannerEvent<"op">;
export type Period = ScannerEvent<"period">;
export type Rational = ScannerEvent<"rational">;
export type TStringContent = ScannerEvent<"tstring_content">;

// These are the parser events that don't receive any arguments. (In earlier
// versions of ripper they were scanner events, now they're parser events with
// arity 0.) Ignored ones that can't show up in the tree but are present in
// ripper include:
//
// args_new, mlhs_new, mrhs_new, qsymbols_new, qwords_new, regexp_new,
// stmts_new, string_content, symbols_new, word_new, words_new, xstring_new
//
export type ArgsForward = ParserEvent0<"args_forward">;
export type ExcessedComma = ParserEvent0<"excessed_comma">;
export type Redo = ParserEvent0<"redo">;
export type Retry = ParserEvent0<"retry">;
export type Return0 = ParserEvent0<"return0">;
export type VoidStmt = { type: "void_stmt", loc: Location } & Comments;
export type Yield0 = ParserEvent0<"yield0">;
export type Zsuper = ParserEvent0<"zsuper">;

// Below are various parser events grouped by their relative functionality.
// The grouping is pretty loose, but it should convey a certain sense of the
// area of Ruby that it's related to. It does not include certain events that
// are present in ripper that we remove from tree before they get to this
// form, including:
//
// heredoc_dedent, magic_comment, nokw_param, symbol
//

// These are various parser events that have to do with string or string-like
// nodes.
export type StringContent = StringDVar | StringEmbExpr | TStringContent;
export type DynaSymbol = ParserEvent<"dyna_symbol", { parts: StringContent[], quote: string }>;
export type Heredoc = ParserEvent<"heredoc", { beging: HeredocBegin, ending: string, parts: StringContent[] }>;
export type RegexpLiteral = ParserEvent<"regexp_literal", { parts: StringContent[], beging: string, ending: string }>;
export type StringConcat = ParserEvent<"string_concat", { left: StringConcat | StringLiteral, right: StringLiteral }>;
export type StringDVar = ParserEvent<"string_dvar", { var: Backref | VarRef }>;
export type StringEmbExpr = ParserEvent<"string_embexpr", { stmts: Statements }>;
export type StringLiteral = ParserEvent<"string_literal", { parts: StringContent[], quote: string }>;
export type SymbolLiteral = ParserEvent<"symbol_literal", { value: Backtick | Const | CVar | GVar | Identifier | IVar | Keyword | Op }>;
export type XStringLiteral = ParserEvent<"xstring_literal", { parts: StringContent[] }>;

// These are various parser events that have to do with arrays.
export type Array = ParserEvent<"array", { cnts: null | Args }>;
export type Qsymbols = ParserEvent<"qsymbols", { elems: TStringContent[] }>;
export type Qwords = ParserEvent<"qwords", { elems: TStringContent[] }>;
export type Symbols = ParserEvent<"symbols", { elems: Word[] }>;
export type Word = ParserEvent<"word", { parts: StringContent[] }>;
export type Words = ParserEvent<"words", { elems: Word[] }>;

// These are various parser events that have to do with hashes.
type HashContent = Assoc | AssocSplat;
export type Assoc = ParserEvent<"assoc", { key: AnyNode, value: AnyNode }>;
export type AssocSplat = ParserEvent<"assoc_splat", { value: AnyNode }>;
export type AssoclistFromArgs = ParserEvent<"assoclist_from_args", { assocs: HashContent[] }>;
export type BareAssocHash = ParserEvent<"bare_assoc_hash", { assocs: HashContent[] }>;
export type Hash = ParserEvent<"hash", { cnts: null | AssoclistFromArgs }>;

// These are various parser events for assignment.
type Assignable = ArefField | ConstPathField | Field | TopConstField | VarField;
export type ArefField = ParserEvent<"aref_field", { collection: AnyNode, index: ArgsAddBlock | null }>;
export type Assign = ParserEvent<"assign", { target: Assignable, value: AnyNode }>;
export type ConstPathField = ParserEvent<"const_path_field", { parent: ConstPathRef | Paren | TopConstRef | VarRef, constant: Const }>;
export type Field = ParserEvent<"field", { parent: AnyNode, op: CallOperator, name: Const | Identifier }>;
export type Opassign = ParserEvent<"opassign", { target: Assignable, op: Op, value: AnyNode }>;
export type TopConstField = ParserEvent<"top_const_field", { constant: Const }>;
export type VarField = ParserEvent<"var_field", { value: null | Const | CVar | GVar | Identifier | IVar }>;

// These are various parser events that have to do with multiple assignment.
export type Massign = ParserEvent<"massign", { target: Mlhs | MlhsParen, value: AnyNode }>;
export type Mlhs = ParserEvent<"mlhs", { parts: (ArefField | Field | Identifier | MlhsParen | VarField)[], comma: undefined | true }>;
export type MlhsParen = ParserEvent<"mlhs_paren", { cnts: Mlhs | MlhsParen }>;
export type Mrhs = ParserEvent<"mrhs", { parts: AnyNode[] }>;
export type MrhsAddStar = ParserEvent<"mrhs_add_star", { mrhs: Mrhs | MrhsNewFromArgs, star: AnyNode }>;
export type MrhsNewFromArgs = ParserEvent<"mrhs_new_from_args", { args: Args }>;

// These are various parser events for control flow constructs.
export type Case = ParserEvent<"case", { value: AnyNode, cons: In | When }>;
export type Else = ParserEvent<"else", { stmts: Statements }>;
export type Elsif = ParserEvent<"elsif", { pred: AnyNode, stmts: Statements, cons: null | Elsif | Else }>;
export type Ensure = ParserEvent<"ensure", { keyword: Keyword, stmts: Statements }>;
export type For = ParserEvent<"for", { index: Mlhs | VarField, collection: AnyNode, stmts: Statements }>;
export type If = ParserEvent<"if", { pred: AnyNode, stmts: Statements, cons: null | Elsif | Else }>;
export type IfModifier = ParserEvent<"if_mod", { pred: AnyNode, stmt: AnyNode }>;
export type In = ParserEvent<"in", { pattern: AnyNode, stmts: Statements, cons: null | In | Else }>;
export type Rescue = ParserEvent<"rescue", { extn: null | RescueEx, stmts: Statements, cons: null | Rescue }>;
export type RescueEx = ParserEvent<"rescue_ex", { extns: AnyNode, var: null | Field | VarField }>;
export type RescueModifier = ParserEvent<"rescue_mod", { stmt: AnyNode, value: AnyNode }>;
export type Ternary = ParserEvent<"ifop", { pred: AnyNode, tthy: AnyNode, flsy: AnyNode }>;
export type Unless = ParserEvent<"unless", { pred: AnyNode, stmts: Statements, cons: null | Elsif | Else }>;
export type UnlessModifier = ParserEvent<"unless_mod", { pred: AnyNode, stmt: AnyNode }>;
export type Until = ParserEvent<"until", { pred: AnyNode, stmts: Statements }>;
export type UntilModifier = ParserEvent<"until_mod", { pred: AnyNode, stmt: AnyNode }>;
export type When = ParserEvent<"when", { args: Args, stmts: Statements, cons: null | Else | When }>;
export type While = ParserEvent<"while", { pred: AnyNode, stmts: Statements }>;
export type WhileModifier = ParserEvent<"while_mod", { pred: AnyNode, stmt: AnyNode }>;

// These are various parser events for control flow keywords.
export type Break = ParserEvent<"break", { args: Args | ArgsAddBlock }>;
export type Next = ParserEvent<"next", { args: Args | ArgsAddBlock }>;
export type Return = ParserEvent<"return", { args: Args | ArgsAddBlock }>;
export type Super = ParserEvent<"super", { args: Args | ArgParen | ArgsAddBlock }>;
export type Yield = ParserEvent<"yield", { args: ArgsAddBlock | Paren }>;

// These are various parser events for pattern matching.
export type Aryptn = ParserEvent<"aryptn", { constant: null | VarRef, reqs: AnyNode[], rest: null | VarField, posts: AnyNode[] }>;
export type FndPtn = ParserEvent<"fndptn", { constant: null | AnyNode, left: VarField, values: AnyNode[], right: VarField }>;
export type Hshptn = ParserEvent<"hshptn", { constant: null | AnyNode, keywords: [Label, AnyNode][], kwrest: null | VarField }>;
export type Rassign = ParserEvent<"rassign", { value: AnyNode, op: Op | Keyword, pattern: AnyNode }>;

// These are various parser events for method declarations.
type DefName = Backtick | Const | Identifier | Keyword | Op;
type ParenAroundParams = Omit<Paren, "cnts"> & { cnts: Params };

export type Blockarg = ParserEvent<"blockarg", { name: Identifier }>;
export type Def = ParserEvent<"def", { name: DefName, params: Params | Paren, bodystmt: Bodystmt }>;
export type Defs = ParserEvent<"defs", { target: AnyNode, op: Op | Period, name: DefName, params: Params | Paren, bodystmt: Bodystmt }>;
export type DefEndless = ParserEvent<"def_endless", { name: DefName, paren: null | ParenAroundParams, stmt: AnyNode }>;
export type KeywordRestParam = ParserEvent<"kwrest_param", { name: null | Identifier }>;
export type Lambda = ParserEvent<"lambda", { params: Params | ParenAroundParams, stmts: Bodystmt | Statements }>;
export type Params = ParserEvent<"params", { reqs: Identifier[], opts: [Identifier, AnyNode][], rest: null | ArgsForward | ExcessedComma | RestParam, posts: Identifier[], keywords: [Label, AnyNode][], kwrest: null | "nil" | KeywordRestParam, block: null | Blockarg }>;
export type RestParam = ParserEvent<"rest_param", { name: null | Identifier }>;

// These are various parser events for method calls.
export type CallOperator = Op | Period | "::";
export type ArgParen = ParserEvent<"arg_paren", { args: Args | ArgsAddBlock | ArgsForward | null }>;
export type Args = ParserEvent<"args", { parts: AnyNode[] }>;
export type ArgsAddBlock = ParserEvent<"args_add_block", { args: Args, block: null | AnyNode }>;
export type ArgStar = ParserEvent<"arg_star", { value: AnyNode }>;
export type BlockVar = ParserEvent<"block_var", { params: Params, locals: Identifier[] }>;
export type BraceBlock = ParserEvent<"brace_block", { lbrace: Lbrace, block_var: null | BlockVar, stmts: Statements }>;
export type Call = ParserEvent<"call", { receiver: AnyNode, op: CallOperator, message: Backtick | Op | Identifier | Const | "call" }>;
export type Command = ParserEvent<"command", { message: Const | Identifier, args: Args | ArgsAddBlock }>;
export type CommandCall = ParserEvent<"command_call", { receiver: AnyNode, op: CallOperator, message: Op | Identifier | Const, args: Args | ArgsAddBlock }>;
export type DoBlock = ParserEvent<"do_block", { keyword: Keyword, block_var: null | BlockVar, bodystmt: Bodystmt }>;
export type Fcall = ParserEvent<"fcall", { value: Const | Identifier }>;
export type MethodAddArg = ParserEvent<"method_add_arg", { call: Call | Fcall, args: Args | ArgParen | ArgsAddBlock }>;
export type MethodAddBlock = ParserEvent<"method_add_block", { call: AnyNode, block: BraceBlock | DoBlock }>;
export type VCall = ParserEvent<"vcall", { value: Identifier }>;

// These are various parser events for statements you would find in a method body.
type Dot = { left: AnyNode, right: AnyNode } | { left: null, right: AnyNode } | { left: AnyNode, right: null };
export type Aref = ParserEvent<"aref", { collection: AnyNode, index: Args | ArgsAddBlock | null }>;
export type BEGIN = ParserEvent<"BEGIN", { lbrace: Lbrace, stmts: Statements }>;
export type Binary = ParserEvent<"binary", { left: AnyNode, op: string, right: AnyNode }>;
export type ConstPathRef = ParserEvent<"const_path_ref", { parent: AnyNode, constant: Const }>;
export type ConstRef = ParserEvent<"const_ref", { constant: Const }>;
export type Defined = ParserEvent<"defined", { value: AnyNode }>;
export type Dot2 = ParserEvent<"dot2", Dot>;
export type Dot3 = ParserEvent<"dot3", Dot>;
export type END = ParserEvent<"END", { lbrace: Lbrace, stmts: Statements }>;
export type Not = ParserEvent<"not", { value: AnyNode, paren: boolean }>;
export type Paren = ParserEvent<"paren", { lparen: Lparen, cnts: AnyNode }>;
export type TopConstRef = ParserEvent<"top_const_ref", { constant: Const }>;
export type Unary = ParserEvent<"unary", { value: AnyNode, op: string }>;
export type VarRef = ParserEvent<"var_ref", { value: Const | CVar | GVar | Identifier | IVar | Keyword }>;

// These are various parser events for statements you would find in a class definition body.
export type AccessCtrl = ParserEvent<"access_ctrl", { value: Identifier }>;
export type Alias = ParserEvent<"alias", { left: DynaSymbol | SymbolLiteral, right: DynaSymbol | SymbolLiteral }>;
export type Class = ParserEvent<"class", { constant: ConstPathRef | ConstRef | TopConstRef, superclass: null | AnyNode, bodystmt: Bodystmt }>;
export type Module = ParserEvent<"module", { constant: ConstPathRef | ConstRef | TopConstRef, bodystmt: Bodystmt }>;
export type Sclass = ParserEvent<"sclass", { target: AnyNode, bodystmt: Bodystmt }>;
export type VarAlias = ParserEvent<"var_alias", { left: GVar, right: Backref | GVar }>;
export type Undef = ParserEvent<"undef", { syms: (DynaSymbol | SymbolLiteral)[] }>;

// These are various parser events for statement containers, generally pretty high in the tree.
export type Begin = ParserEvent<"begin", { bodystmt: Bodystmt }>;
export type Bodystmt = ParserEvent<"bodystmt", { stmts: Statements, rsc: null | Rescue, els: null | Statements, ens: null | Ensure }>;
export type Program = ParserEvent<"program", { stmts: Statements }>;
export type Statements = ParserEvent<"statements", { body: AnyNode[] }>;
