// This file contains all of the types that represent objects being returned
// from the RBS parser.

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
  type: MethodParams & { return_type: Type },
  block: { required: boolean } & MethodSignature
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
  | { member: "include" } & NameAndArgs
  | { member: "extend" } & NameAndArgs
  | { member: "prepend" } & NameAndArgs
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

export type Class = { declaration: "class", super_class?: NameAndArgs, members: Member[] } & NameAndTypeParams;
export type Interface = { declaration: "interface", members: Member[] } & NameAndTypeParams;
export type Module = { declaration: "module", self_types: NameAndArgs[], members: Member[] } & NameAndTypeParams;

type Declaration = { location: Location } & (
  | { declaration: "alias", name: string, type: Type }
  | Class
  | { declaration: "constant", name: string, type: Type }
  | { declaration: "global", name: string, type: Type }
  | Interface
  | Module
);

type Root = { declarations: Declaration[], location: Location };

export type Annotation = { string: string, location: Location };

export type AnyNode = { comment?: { string: string }, annotations?: Annotation[] } & (
  | ({ declaration: undefined, member: undefined } & Root)
  | ({ declarations: undefined, member: undefined } & Declaration)
  | ({ declaration: undefined, declarations: undefined } & Member)
);
