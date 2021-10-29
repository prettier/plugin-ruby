// This file contains all of the types that represent objects being returned
// from our ripper-based parser.

// These are common additions to the various node types.
type Comments = { comments?: Comment[] };
export type Location = [number, number, number, number];

// These are utility types used to construct the various node types.
type ScannerEvent<T extends string> = { type: `@${T}`, body: string, loc: Location } & Comments;
type ParserEvent0<T extends string> = { type: T, body: string, loc: Location } & Comments;
type ParserEvent<T, V = Record<string, unknown>> = { type: T, loc: Location } & Comments & V;

// This is the main expression type that goes in places where the AST will
// accept just about anything.
// eslint-disable-next-line @typescript-eslint/ban-types
export type AnyNode = AccessCtrl | Alias | Aref | ArefField | ArgParen | Args | ArgsAddBlock | ArgsAddStar | ArgsForward | Array | Aryptn | Assign | AssocNew | AssocSplat | AssoclistFromArgs | BEGIN | Backref | Backtick | BareAssocHash | Begin | Binary | BlockVar | Blockarg | Bodystmt | BraceBlock | Break | CVar | Call | Case | Char | Class | Command | CommandCall | Const | ConstPathField | ConstPathRef | ConstRef | Def | Defined | Defs | Defsl | DoBlock | Dot2 | Dot3 | DynaSymbol | END | Else | Elsif | EndContent | Ensure | ExcessedComma | Fcall | Field | Float | FndPtn | For | GVar | Hash | Heredoc | HeredocBegin | Hshptn | IVar | Identifier | If | IfModifier | Imaginary | In | Int | Keyword | KeywordRestParam | Label | Lambda | Lbrace | Lparen | Massign | MethodAddArg | MethodAddBlock | Mlhs | MlhsAddPost | MlhsAddStar | MlhsParen | Module | Mrhs | MrhsAddStar | MrhsNewFromArgs | Next | Op | Opassign | Params | Paren | Period | Program | Qsymbols | Qwords | Rassign | Rational | Redo | RegexpLiteral | Rescue | RescueEx | RescueModifier | RestParam | Retry | Return | Return0 | Sclass | Stmts | String | StringConcat | StringDVar | StringEmbExpr | StringLiteral | Super | SymbolLiteral | Symbols | TStringContent | Ternary | TopConstField | TopConstRef | Unary | Undef | Unless | UnlessModifier | Until | UntilModifier | VCall | VarAlias | VarField | VarRef | VoidStmt | When | While | WhileModifier | Word | Words | XStringLiteral | Yield | Yield0 | Zsuper

// This is a special scanner event that contains a comment. It can be attached
// to almost any kind of node, which is why it's pulled out here separately.
type UndecoratedComment = { type: "@comment", value: string, inline: boolean, loc: Location };

// Prettier will attach various metadata to comment nodes, which we're adding in
// to the type here.
type CommentDecorations = { leading: boolean, printed: boolean };
export type Comment = UndecoratedComment & CommentDecorations;

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
export type VoidStmt = ParserEvent<"void_stmt">;
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
export type DynaSymbol = ParserEvent<"dyna_symbol", { body: StringContent[], quote: string }>;
export type Heredoc = ParserEvent<"heredoc", { beging: HeredocBegin, ending: string, body: StringContent[] }>;
export type RegexpLiteral = ParserEvent<"regexp_literal", { body: StringContent[], beging: string, ending: string }>;
export type String = ParserEvent<"string", { body: [TStringContent] }>;
export type StringConcat = ParserEvent<"string_concat", { body: [StringConcat | StringLiteral, StringLiteral] }>;
export type StringDVar = ParserEvent<"string_dvar", { body: [Backref | VarRef] }>;
export type StringEmbExpr = ParserEvent<"string_embexpr", { body: [Stmts] }>;
export type StringLiteral = ParserEvent<"string_literal", { body: StringContent[], quote: string }>;
export type SymbolLiteral = ParserEvent<"symbol_literal", { body: [Backtick | Const | CVar | GVar | Identifier | IVar | Keyword | Op] }>;
export type XStringLiteral = ParserEvent<"xstring_literal", { body: StringContent[] }>;

// These are various parser events that have to do with arrays.
export type Array = ParserEvent<"array", { body: [null | Args | ArgsAddStar | Qsymbols | Qwords | Symbols | Words] }>;
export type Qsymbols = ParserEvent<"qsymbols", { body: TStringContent[] }>;
export type Qwords = ParserEvent<"qwords", { body: TStringContent[] }>;
export type Symbols = ParserEvent<"symbols", { body: Word[] }>;
export type Word = ParserEvent<"word", { body: StringContent[] }>;
export type Words = ParserEvent<"words", { body: Word[] }>;

// These are various parser events that have to do with hashes.
type HashContent = AssocNew | AssocSplat;
export type AssocNew = ParserEvent<"assoc_new", { key: AnyNode, value: AnyNode }>;
export type AssocSplat = ParserEvent<"assoc_splat", { value: AnyNode }>;
export type AssoclistFromArgs = ParserEvent<"assoclist_from_args", { assocs: HashContent[] }>;
export type BareAssocHash = ParserEvent<"bare_assoc_hash", { assocs: HashContent[] }>;
export type Hash = ParserEvent<"hash", { contents: null | AssoclistFromArgs }>;

// These are various parser events for assignment.
type Assignable = ArefField | ConstPathField | Field | TopConstField | VarField;
export type ArefField = ParserEvent<"aref_field", { collection: AnyNode, index: ArgsAddBlock | null }>;
export type Assign = ParserEvent<"assign", { target: Assignable, value: AnyNode }>;
export type ConstPathField = ParserEvent<"const_path_field", { parent: ConstPathRef | Paren | TopConstRef | VarRef, constant: Const }>;
export type Field = ParserEvent<"field", { parent: AnyNode, operator: CallOperator, name: Const | Identifier }>;
export type Opassign = ParserEvent<"opassign", { target: Assignable, operator: Op, value: AnyNode }>;
export type TopConstField = ParserEvent<"top_const_field", { constant: Const }>;
export type VarField = ParserEvent<"var_field", { value: null | Const | CVar | GVar | Identifier | IVar }>;

// These are various parser events that have to do with multiple assignment.
export type Massign = ParserEvent<"massign", { body: [Mlhs | MlhsAddPost | MlhsAddStar | MlhsParen, AnyNode] }>;
export type Mlhs = ParserEvent<"mlhs", { body: (ArefField | Field | Identifier | MlhsParen | VarField)[], comma: undefined | true }>;
export type MlhsAddPost = ParserEvent<"mlhs_add_post", { body: [MlhsAddStar, Mlhs] }>;
export type MlhsAddStar = ParserEvent<"mlhs_add_star", { body: [Mlhs, null | ArefField | Field | Identifier | VarField] }>;
export type MlhsParen = ParserEvent<"mlhs_paren", { body: [Mlhs | MlhsAddPost | MlhsAddStar | MlhsParen] }>;
export type Mrhs = ParserEvent<"mrhs", { body: [] }>;
export type MrhsAddStar = ParserEvent<"mrhs_add_star", { body: [Mrhs | MrhsNewFromArgs, AnyNode] }>;
export type MrhsNewFromArgs = ParserEvent<"mrhs_new_from_args", { body: [Args | ArgsAddStar, AnyNode], oper: string }>;

// These are various parser events for control flow constructs.
export type Case = ParserEvent<"case", { value: AnyNode, consequent: In | When }>;
export type Else = ParserEvent<"else", { stmts: Stmts }>;
export type Elsif = ParserEvent<"elsif", { predicate: AnyNode, stmts: Stmts, consequent: null | Elsif | Else }>;
export type Ensure = ParserEvent<"ensure", { keyword: Keyword, stmts: Stmts }>;
export type For = ParserEvent<"for", { body: [Mlhs | MlhsAddStar | VarField, AnyNode, Stmts] }>;
export type If = ParserEvent<"if", { body: [AnyNode, Stmts, null | Elsif | Else] }>;
export type IfModifier = ParserEvent<"if_mod", { body: [AnyNode, AnyNode] }>;
export type In = ParserEvent<"in", { body: [AnyNode, Stmts, null | In | Else] }>;
export type Rescue = ParserEvent<"rescue", { body: [null | RescueEx, Stmts, null | Stmts] }>;
export type RescueEx = ParserEvent<"rescue_ex", { body: [AnyNode, null | Field | VarField] }>;
export type RescueModifier = ParserEvent<"rescue_mod", { body: [AnyNode, AnyNode] }>;
export type Ternary = ParserEvent<"ifop", { body: [AnyNode, AnyNode, AnyNode] }>;
export type Unless = ParserEvent<"unless", { body: [AnyNode, Stmts, null | Elsif | Else] }>;
export type UnlessModifier = ParserEvent<"unless_mod", { body: [AnyNode, AnyNode] }>;
export type Until = ParserEvent<"until", { body: [AnyNode, Stmts] }>;
export type UntilModifier = ParserEvent<"until_mod", { body: [AnyNode, AnyNode] }>;
export type When = ParserEvent<"when", { body: [Args | ArgsAddStar, Stmts, null | Else | When] }>;
export type While = ParserEvent<"while", { body: [AnyNode, Stmts] }>;
export type WhileModifier = ParserEvent<"while_mod", { body: [AnyNode, AnyNode] }>;

// These are various parser events for control flow keywords.
export type Break = ParserEvent<"break", { args: Args | ArgsAddBlock }>;
export type Next = ParserEvent<"next", { args: Args | ArgsAddBlock }>;
export type Return = ParserEvent<"return", { args: Args | ArgsAddBlock }>;
export type Super = ParserEvent<"super", { body: [Args | ArgParen | ArgsAddBlock] }>;
export type Yield = ParserEvent<"yield", { body: [ArgsAddBlock | Paren] }>;

// These are various parser events for pattern matching.
export type Aryptn = ParserEvent<"aryptn", { body: [null | VarRef, AnyNode[], null | VarField, null | AnyNode[]] }>;
export type FndPtn = ParserEvent<"fndptn", { body: [null | AnyNode, VarField, AnyNode[], VarField] }>;
export type Hshptn = ParserEvent<"hshptn", { body: [null | AnyNode, [Label, AnyNode][], null | VarField] }>;
export type Rassign = ParserEvent<"rassign", { value: AnyNode, operator: Op | Keyword, pattern: AnyNode }>;

// These are various parser events for method declarations.
type DefName = Backtick | Const | Identifier | Keyword | Op;
type ParenAroundParams = Omit<Paren, "body"> & { body: [Params] };

export type Blockarg = ParserEvent<"blockarg", { name: Identifier }>;
export type Def = ParserEvent<"def", { name: DefName, params: Params | Paren, bodystmt: Bodystmt }>;
export type Defs = ParserEvent<"defs", { target: AnyNode, operator: Op | Period, name: DefName, params: Params | Paren, bodystmt: Bodystmt }>;
export type Defsl = ParserEvent<"defsl", { name: DefName, paren: null | ParenAroundParams, stmt: AnyNode }>;
export type KeywordRestParam = ParserEvent<"kwrest_param", { body: [null | Identifier] }>;
export type Lambda = ParserEvent<"lambda", { body: [Params | ParenAroundParams, Bodystmt | Stmts] }>;
export type Params = ParserEvent<"params", { body: [Identifier[], null | [Identifier, AnyNode][], null | ArgsForward | ExcessedComma | RestParam, Identifier[], null | [Label, AnyNode][], null | "nil" | KeywordRestParam, null | Blockarg] }>;
export type RestParam = ParserEvent<"rest_param", { body: [null | Identifier] }>;

// These are various parser events for method calls.
export type CallOperator = Op | Period | "::";
export type ArgParen = ParserEvent<"arg_paren", { body: [Args | ArgsAddBlock | ArgsForward | null] }>;
export type Args = ParserEvent<"args", { body: AnyNode[] }>;
export type ArgsAddBlock = ParserEvent<"args_add_block", { body: [Args | ArgsAddStar, false | AnyNode] }>;
export type ArgsAddStar = ParserEvent<"args_add_star", { body: [Args | ArgsAddStar, ...AnyNode[]] }>;
export type BlockVar = ParserEvent<"block_var", { params: Params, locals: Identifier[] }>;
export type BraceBlock = ParserEvent<"brace_block", { lbrace: Lbrace, block_var: null | BlockVar, stmts: Stmts }>;
export type Call = ParserEvent<"call", { receiver: AnyNode, operator: CallOperator, message: Backtick | Op | Identifier | Const | "call" }>;
export type Command = ParserEvent<"command", { message: Const | Identifier, args: Args | ArgsAddBlock }>;
export type CommandCall = ParserEvent<"command_call", { receiver: AnyNode, operator: CallOperator, message: Op | Identifier | Const, args: Args | ArgsAddBlock }>;
export type DoBlock = ParserEvent<"do_block", { keyword: Keyword, block_var: null | BlockVar, bodystmt: Bodystmt }>;
export type Fcall = ParserEvent<"fcall", { value: Const | Identifier }>;
export type MethodAddArg = ParserEvent<"method_add_arg", { body: [Call | Fcall, Args | ArgParen | ArgsAddBlock] }>;
export type MethodAddBlock = ParserEvent<"method_add_block", { body: [AnyNode, BraceBlock | DoBlock] }>;
export type VCall = ParserEvent<"vcall", { value: Identifier }>;

// These are various parser events for statements you would find in a method body.
type Dot = { left: AnyNode, right: AnyNode } | { left: null, right: AnyNode } | { left: AnyNode, right: null };
export type Aref = ParserEvent<"aref", { collection: AnyNode, index: Args | ArgsAddBlock | null }>;
export type BEGIN = ParserEvent<"BEGIN", { lbrace: Lbrace, stmts: Stmts }>;
export type Binary = ParserEvent<"binary", { left: AnyNode, operator: string, right: AnyNode }>;
export type ConstPathRef = ParserEvent<"const_path_ref", { parent: AnyNode, constant: Const }>;
export type ConstRef = ParserEvent<"const_ref", { constant: Const }>;
export type Defined = ParserEvent<"defined", { value: AnyNode }>;
export type Dot2 = ParserEvent<"dot2", Dot>;
export type Dot3 = ParserEvent<"dot3", Dot>;
export type END = ParserEvent<"END", { lbrace: Lbrace, stmts: Stmts }>;
export type Paren = ParserEvent<"paren", { body: [AnyNode], lparen: Lparen }>;
export type TopConstRef = ParserEvent<"top_const_ref", { constant: Const }>;
export type Unary = ParserEvent<"unary", { body: [AnyNode], oper: string, paren: boolean | undefined }>;
export type VarRef = ParserEvent<"var_ref", { value: Const | CVar | GVar | Identifier | IVar | Keyword }>;

// These are various parser events for statements you would find in a class definition body.
export type AccessCtrl = ParserEvent<"access_ctrl", { value: Identifier }>;
export type Alias = ParserEvent<"alias", { left: DynaSymbol | SymbolLiteral, right: DynaSymbol | SymbolLiteral }>;
export type Class = ParserEvent<"class", { constant: ConstPathRef | ConstRef | TopConstRef, superclass: null | AnyNode, bodystmt: Bodystmt }>;
export type Module = ParserEvent<"module", { constant: ConstPathRef | ConstRef | TopConstRef, bodystmt: Bodystmt }>;
export type Sclass = ParserEvent<"sclass", { target: AnyNode, bodystmt: Bodystmt }>;
export type VarAlias = ParserEvent<"var_alias", { left: GVar, right: Backref | GVar }>;
export type Undef = ParserEvent<"undef", { body: (DynaSymbol | SymbolLiteral)[] }>;

// These are various parser events for statement containers, generally pretty high in the tree.
export type Begin = ParserEvent<"begin", { bodystmt: Bodystmt }>;
export type Bodystmt = ParserEvent<"bodystmt", { body: [Stmts, null | Rescue, null | Stmts, null | Ensure] }>;
export type Program = ParserEvent<"program", { stmts: Stmts }>;
export type Stmts = ParserEvent<"stmts", { body: AnyNode[] }>;
