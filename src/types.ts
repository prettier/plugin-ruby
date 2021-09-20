import type * as Prettier from "prettier";

// This namespace contains everything to do with the Ruby prettier plugin.
export namespace Plugin {
  export type Doc = Prettier.doc.builders.Doc;

  export type Embed<T> = Required<Prettier.Printer<T>>["embed"];

  export type Options = Prettier.ParserOptions<any> & {
    printer: Omit<Prettier.Printer, "printComment"> & Required<Pick<Prettier.Printer, "printComment">>,
    rubyArrayLiteral: boolean,
    rubyHashLabel: boolean,
    rubyModifier: boolean,
    rubyNetcatCommand?: string,
    rubySingleQuote: boolean,
    rubyToProc: boolean
  };

  export type Parser<T> = Omit<Prettier.Parser<T>, "parse"> & {
    parse: (text: string, parsers: { [name: string]: Prettier.Parser<any> }, options: Options) => any
  };

  // We're overwriting call and map here because if you restrict the AST for the
  // main path then presumably you're printing a lower node in the tree that
  // won't match the current AST type.
  export type Path<T> = Omit<Prettier.AstPath<T>, "call" | "each" | "getParentNode" | "map"> & {
    call: <U>(callback: (path: Path<any>) => U, ...names: PropertyKey[]) => U,
    each: (callback: (path: Path<any>, index: number, value: any) => void, ...names: PropertyKey[]) => void,
    getParentNode: (count?: number | undefined) => any | null,
    map: <U>(callback: (path: Path<any>, index: number, value: any) => U, ...names: PropertyKey[]) => U[]
  };

  export type PrinterConfig<T> = Omit<Prettier.Printer<T>, "print"> & {
    getCommentChildNodes?: (node: any) => any[],
    isBlockComment?: (comment: any, options: Plugin.Options) => boolean,
    print: Printer<T>
  };

  // This is the regular print node, except it's not restricted by the AST that
  // is passed to the parent AST.
  export type Print = (path: Path<any>) => Doc;

  // This is the regular printer, except it uses our overridden options and
  // print types.
  export type Printer<T> = (path: Path<T>, options: Options, print: Print) => Doc;
}

// This namespace contains everything to do with the types of the various nodes
// within the syntax tree generated from the Ruby parser.
export namespace Ruby {
  // These are utility types used to construct the various node types.
  type Comments = { comments?: Comment[] };
  type Location = { sl: number, el: number, sc: number, ec: number };

  type ScannerEvent<T extends string> = { type: `@${T}`, body: string } & Comments & Location;
  type ParserEvent0<T extends string> = { type: T, body: string } & Comments & Location;
  type ParserEvent<T, V = {}> = { type: T } & Comments & Location & V;

  // This is the main expression type that goes in places where the AST will
  // accept just about anything.
  export type AnyNode = AccessCtrl | Alias | Aref | ArefField | ArgParen | Args | ArgsAddBlock | ArgsAddStar | ArgsForward | Array | Aryptn | Assign | AssocNew | AssocSplat | AssoclistFromArgs | BEGIN | Backref | Backtick | BareAssocHash | Begin | Binary | BlockVar | Blockarg | Bodystmt | BraceBlock | Break | CVar | Call | Case | Char | Class | Command | CommandCall | Const | ConstPathField | ConstPathRef | ConstRef | Def | Defined | Defs | Defsl | DoBlock | Dot2 | Dot3 | DynaSymbol | END | Else | Elsif | EndContent | Ensure | ExcessedComma | Fcall | Field | Float | FndPtn | For | GVar | Hash | Heredoc | HeredocBegin | Hshptn | IVar | Identifier | If | IfModifier | Imaginary | In | Int | Keyword | KeywordRestParam | Label | Lambda | Lbrace | Massign | MethodAddArg | MethodAddBlock | Mlhs | MlhsAddPost | MlhsAddStar | MlhsParen | Module | Mrhs | MrhsAddStar | MrhsNewFromArgs | Next | Op | Opassign | Params | Paren | Period | Program | Qsymbols | Qwords | Rassign | Rational | Redo | RegexpLiteral | Rescue | RescueEx | RescueModifier | RestParam | Retry | Return | Return0 | Sclass | Stmts | String | StringConcat | StringDVar | StringEmbExpr | StringLiteral | Super | SymbolLiteral | Symbols | TStringContent | Ternary | TopConstField | TopConstRef | Unary | Undef | Unless | UnlessModifier | Until | UntilModifier | VCall | VarAlias | VarField | VarRef | VoidStmt | When | While | WhileModifier | Word | Words | XStringLiteral | Yield | Yield0 | Zsuper

  // This is a special scanner event that contains a comment. It can be attached
  // to almost any kind of node, which is why it's pulled out here separately.
  type UndecoratedComment = { type: "@comment", value: string, inline: boolean } & Location;
  export type Comment = UndecoratedComment & { leading: boolean, printed: boolean };

  // These are the scanner events that contain only a single string. They're
  // always leaves in the tree. Ignored ones that can't show up in the tree but
  // are present in ripper include:
  //
  // comma, embdoc, embdoc_beg, embdoc_end, embexpr_beg, embexpr_end, embvar,
  // heredoc_end, ignored_nl, ignored_sp, label_end, lbracket, lparen, nl,
  // qsymbols_beg, qwords_beg, rbrace, rbracket, regexp_beg, regexp_end, rparen,
  // semicolon, sp, symbbeg, symbols_beg, tlambda, tlambeg, tstring_beg,
  // tstring_nd, words_beg, words_sep
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
  export type AssocNew = ParserEvent<"assoc_new", { body: [AnyNode, AnyNode] }>;
  export type AssocSplat = ParserEvent<"assoc_splat", { body: [AnyNode] }>;
  export type AssoclistFromArgs = ParserEvent<"assoclist_from_args", { body: HashContent[] }>;
  export type BareAssocHash = ParserEvent<"bare_assoc_hash", { body: HashContent[] }>;
  export type Hash = ParserEvent<"hash", { body: [null | AssoclistFromArgs] }>;

  // These are various parser events for assignment.
  type Assignable = ArefField | ConstPathField | Field | TopConstField | VarField;
  export type ArefField = ParserEvent<"aref_field", { body: [AnyNode, ArgsAddBlock | null] }>;
  export type Assign = ParserEvent<"assign", { body: [Assignable, AnyNode] }>;
  export type ConstPathField = ParserEvent<"const_path_field", { body: [ConstPathRef | Paren | TopConstRef | VarRef, Const] }>;
  export type Field = ParserEvent<"field", { body: [AnyNode, CallOperator, Const | Identifier] }>;
  export type Opassign = ParserEvent<"opassign", { body: [Assignable, Op, AnyNode] }>;
  export type TopConstField = ParserEvent<"top_const_field", { body: [Const] }>;
  export type VarField = ParserEvent<"var_field", { body: [null | Const | CVar | GVar | Identifier | IVar] }>;

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
  export type Case = ParserEvent<"case", { body: [AnyNode, In | When] }>;
  export type Else = ParserEvent<"else", { body: [Stmts] }>;
  export type Elsif = ParserEvent<"elsif", { body: [AnyNode, Stmts, null | Elsif | Else] }>;
  export type Ensure = ParserEvent<"ensure", { body: [Keyword, Stmts] }>;
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
  export type Break = ParserEvent<"break", { body: [Args | ArgsAddBlock] }>;
  export type Next = ParserEvent<"next", { body: [Args | ArgsAddBlock] }>;
  export type Return = ParserEvent<"return", { body: [Args | ArgsAddBlock] }>;
  export type Super = ParserEvent<"super", { body: [Args | ArgParen | ArgsAddBlock] }>;
  export type Yield = ParserEvent<"yield", { body: [ArgsAddBlock | Paren] }>;

  // These are various parser events for pattern matching.
  export type Aryptn = ParserEvent<"aryptn", { body: [null | VarRef, AnyNode[], null | VarField, null | AnyNode[]] }>;
  export type FndPtn = ParserEvent<"fndptn", { body: [null | AnyNode, VarField, AnyNode[], VarField] }>;
  export type Hshptn = ParserEvent<"hshptn", { body: [null | AnyNode, [Label, AnyNode][], null | VarField] }>;
  export type Rassign = ParserEvent<"rassign", { body: [AnyNode, AnyNode], keyword: boolean }>;

  // These are various parser events for method declarations.
  type ParenAroundParams = Omit<Paren, "body"> & { body: [Params] };
  export type Blockarg = ParserEvent<"blockarg", { body: [Identifier] }>;
  export type Def = ParserEvent<"def", { body: [Backtick | Const | Identifier | Keyword | Op, Params | Paren, Bodystmt] }>;
  export type Defs = ParserEvent<"defs", { body: [AnyNode, Op | Period, Const | Op | Identifier | Keyword, Params | Paren, Bodystmt] }>;
  export type Defsl = ParserEvent<"defsl", { body: [Identifier, null | ParenAroundParams, AnyNode] }>;
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
  export type BlockVar = ParserEvent<"block_var", { body: [Params, false | Identifier[]] }>;
  export type BraceBlock = ParserEvent<"brace_block", { body: [null | BlockVar, Stmts] }>;
  export type Call = ParserEvent<"call", { body: [AnyNode, CallOperator, Backtick | Op | Identifier | Const | "call"] }>;
  export type Command = ParserEvent<"command", { body: [Const | Identifier, Args | ArgsAddBlock] }>;
  export type CommandCall = ParserEvent<"command_call", { body: [AnyNode, CallOperator, Op | Identifier | Const, Args | ArgsAddBlock] }>;
  export type DoBlock = ParserEvent<"do_block", { body: [null | BlockVar, Bodystmt] }>;
  export type Fcall = ParserEvent<"fcall", { body: [Const | Identifier] }>;
  export type MethodAddArg = ParserEvent<"method_add_arg", { body: [Call | Fcall, Args | ArgParen | ArgsAddBlock] }>;
  export type MethodAddBlock = ParserEvent<"method_add_block", { body: [AnyNode, BraceBlock | DoBlock] }>;
  export type VCall = ParserEvent<"vcall", { body: [Identifier] }>;

  // These are various parser events for statements you would find in a method body.
  export type Aref = ParserEvent<"aref", { body: [AnyNode, Args | ArgsAddBlock | null] }>;
  export type BEGIN = ParserEvent<"BEGIN", { body: [Lbrace, Stmts] }>;
  export type Binary = ParserEvent<"binary", { body: [AnyNode, string, AnyNode] }>;
  export type ConstPathRef = ParserEvent<"const_path_ref", { body: [AnyNode, Const] }>;
  export type ConstRef = ParserEvent<"const_ref", { body: [Const] }>;
  export type Defined = ParserEvent<"defined", { body: [AnyNode] }>;
  export type Dot2 = ParserEvent<"dot2", { body: [AnyNode, null] | [null, AnyNode] | [AnyNode, AnyNode] }>;
  export type Dot3 = ParserEvent<"dot3", { body: [AnyNode, null] | [null, AnyNode] | [AnyNode, AnyNode] }>;
  export type END = ParserEvent<"END", { body: [Lbrace, Stmts] }>;
  export type Paren = ParserEvent<"paren", { body: [AnyNode] }>;
  export type TopConstRef = ParserEvent<"top_const_ref", { body: [Const] }>;
  export type Unary = ParserEvent<"unary", { body: AnyNode, oper: string, paren: boolean | undefined }>;
  export type VarRef = ParserEvent<"var_ref", { body: [Const | CVar | GVar | Identifier | IVar | Keyword] }>;

  // These are various parser events for statements you would find in a class definition body.
  export type AccessCtrl = ParserEvent<"access_ctrl", { body: [Identifier] }>;
  export type Alias = ParserEvent<"alias", { body: [DynaSymbol | SymbolLiteral, DynaSymbol | SymbolLiteral] }>;
  export type Class = ParserEvent<"class", { body: [ConstPathRef | ConstRef | TopConstRef, null | AnyNode, Bodystmt] }>;
  export type Module = ParserEvent<"module", { body: [ConstPathRef | ConstRef | TopConstRef, Bodystmt] }>;
  export type Sclass = ParserEvent<"sclass", { body: [AnyNode, Bodystmt] }>;
  export type VarAlias = ParserEvent<"var_alias", { body: [GVar, Backref | GVar] }>;
  export type Undef = ParserEvent<"undef", { body: (DynaSymbol | SymbolLiteral)[] }>;

  // These are various parser events for statement containers, generally pretty high in the tree.
  export type Begin = ParserEvent<"begin", { body: [Bodystmt] }>;
  export type Bodystmt = ParserEvent<"bodystmt", { body: [Stmts, null | Rescue, null | Stmts, null | Ensure] }>;
  export type Program = ParserEvent<"program", { body: [Stmts] }>;
  export type Stmts = ParserEvent<"stmts", { body: AnyNode[] }>;
}

export namespace HAML {
  export type AnyNode = (
    | Comment
    | DocType
    | Filter
    | HAMLComment
    | Plain
    | Root
    | Script
    | SilentScript
    | Tag
  );

  export type Comment = {
    type: "comment",
    value: { revealed: boolean, conditional?: string, text?: string },
    children: AnyNode[]
  };

  export type DocType = {
    type: "doctype",
    value: { type: string, version?: string, encoding?: string }
  };

  export type Filter = {
    type: "filter",
    value: { name: string, text: string }
  };

  export type HAMLComment = {
    type: "haml_comment",
    value: { text?: string },
    line: number
  };

  export type Plain = {
    type: "plain",
    value: { text: string }
  };

  export type Root = {
    type: "root",
    children: AnyNode[],
    supports_multiline: boolean
  };
  
  export type Script = {
    type: "script",
    value: {
      escape_html: boolean,
      preserve: boolean,
      interpolate: boolean,
      text: string
    },
    children: AnyNode[]
  };
  
  export type SilentScript = {
    type: "silent_script",
    value: { text: string, keyword: string },
    children: AnyNode[]
  };
  
  export type TagAttrs = string | { [property: string]: TagAttrs }
  export type Tag = {
    type: "tag",
    value: {
      name: string,
      attributes: { class?: string, id?: string } & Record<string, string | number>,
      dynamic_attributes: { new?: string, old?: TagAttrs },
      object_ref?: string,
      nuke_outer_whitespace: boolean,
      nuke_inner_whitespace: boolean,
      self_closing: boolean,
      value?: string,
      parse: boolean
    },
    children: AnyNode[]
  };
}

export namespace RBS {
  export type MethodParam = {
    name?: string
    escaped: boolean,
    type: Type
  };

  export type MethodParams = {
    required_positionals: MethodParam[],
    optional_positionals: MethodParam[],
    rest_positionals?: MethodParam,
    trailing_positionals: MethodParam[]
    required_keywords: Record<string, MethodParam>,
    optional_keywords: Record<string, MethodParam>,
    rest_keywords?: MethodParam
  };

  export type MethodSignature = {
    type_params: string[],
    type: MethodParams,
    block: { required: boolean } & MethodSignature,
    return_type: { type: Type }
  };

  export type Type = { location: Location } & (
    | { class: "literal", literal: string }
    | { class: "optional", type: Type }
    | { class: "tuple", types: Type[] }
    | { class: "union", types: Type[] }
    | { class: "intersection", types: Type[] }
    | { class: "class_singleton", name: string }
    | { class: "proc" } & MethodSignature
    | { class: "record", fields: Record<string, { joiner: "label" | "rocket", type: Type }> }
    | { class: "class_instance" } & NameAndArgs
    | { class: "interface" } & NameAndArgs
    | { class: "alias", name: string }
    | { class: "variable", name: string }
    | { class: "bool" }
    | { class: "bot" }
    | { class: "class" }
    | { class: "instance" }
    | { class: "nil" }
    | { class: "self" }
    | { class: "top" }
    | { class: "untyped" }
    | { class: "void" }
  );

  export type Literal = Type & { class: "literal" };

  export type NameAndArgs = { name: string, args: Type[] };

  export type Location = {
    start: { line: number, column: number },
    end: { line: number, column: number },
    start_pos: number,
    end_pos: number
  };

  export type Member = { location: Location } & (
    | { member: "alias", new_name: string, old_name: string, kind: "instance" | "singleton" }
    | { member: "attr_accessor" | "attr_reader" | "attr_writer", name: string, ivar_name?: string | false, kind: "instance" | "singleton", type: Type }
    | { member: "class_variable" | "class_instance_variable" | "instance_variable", name: string, type: Type }
    | { member: "include" }
    | { member: "extend" }
    | { member: "prepend" }
    | { member: "public" }
    | { member: "private" }
    | { member: "method_definition", overload: boolean, name: string, types: MethodSignature[], kind: "instance" | "singleton" | "singleton_instance" }
  );

  export type MethodDefinition = Member & { member: "method_definition" };

  export type Param = {
    name: string,
    skip_validation: boolean,
    variance: "invariant" | "covariant" | "contravariant"
  };

  export type NameAndTypeParams = {
    name: string,
    type_params: { params: Param[] }
  };

  type Declaration = (
    | { declaration: "alias", name: string, type: Type }
    | { declaration: "class", super_class?: NameAndArgs, members: Member[] } & NameAndTypeParams
    | { declaration: "constant", name: string, type: Type }
    | { declaration: "global", name: string, type: Type }
    | { declaration: "interface", members: Member[] } & NameAndTypeParams
    | { declaration: "module", self_types: NameAndArgs[], members: Member[] } & NameAndTypeParams
  );

  type Root = (
    { declarations: Declaration[] }
  );

  export type Annotation = { string: string, location: Location };

  export type AnyNode = { comment?: { string: string }, annotations?: Annotation[] } & (
    | ({ declaration: undefined, member: undefined } & Root)
    | ({ declarations: undefined, member: undefined } & Declaration)
    | ({ declaration: undefined, declarations: undefined } & Member)
  );
}
