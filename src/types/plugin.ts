import type * as Prettier from "prettier";
import type { ArrayElement, ArrayProperties, IndexProperties, IndexValue, RequiredKeys } from "./utils";

type CallProperties<T> = T extends any[] ? IndexProperties<T> : keyof T;
type IterProperties<T> = T extends any[] ? IndexProperties<T> : ArrayProperties<T>;

type CallCallback<T, U> = (path: Path<T>, index: number, value: any) => U;
type EachCallback<T> = (path: Path<ArrayElement<T>>, index: number, value: any) => void;
type MapCallback<T, U> = (path: Path<ArrayElement<T>>, index: number, value: any) => U;

// This path interface is going to override a bunch of functions on the regular
// prettier AstPath interface. This is because we want stricter types than the
// current version of @types/prettier provides.
//
// For each of the tree walk functions (call, each, and map) this provides 5
// strict type signatures, along with a fallback at the end if you end up
// calling more than 5 properties deep (we don't do that but I've included it
// for completeness).
//
// getParentNode is being overridden because previously it was restricted to the
// type T of the given AST, but it's very unlikely you're going to be receiving
// a parent node that exactly matches your current node. So for now just
// returning any.
interface StrictPath<T> {
  call<U>(callback: CallCallback<T, U>): U;
  call<U, P1 extends CallProperties<T>>(callback: CallCallback<IndexValue<T, P1>, U>, prop1: P1): U;
  call<U, P1 extends keyof T, P2 extends CallProperties<T[P1]>>(callback: CallCallback<IndexValue<IndexValue<T, P1>, P2>, U>, prop1: P1, prop2: P2): U;
  call<U, P1 extends keyof T, P2 extends CallProperties<T[P1]>, P3 extends CallProperties<IndexValue<T[P1], P2>>>(callback: CallCallback<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, U>, prop1: P1, prop2: P2, prop3: P3): U;
  call<U, P1 extends keyof T, P2 extends CallProperties<T[P1]>, P3 extends CallProperties<IndexValue<T[P1], P2>>, P4 extends CallProperties<IndexValue<IndexValue<T[P1], P2>, P3>>>(callback: CallCallback<IndexValue<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, P4>, U>, prop1: P1, prop2: P2, prop3: P3, prop4: P4): U;
  call<U, P extends PropertyKey>(callback: CallCallback<any, U>, prop1: P, prop2: P, prop3: P, prop4: P, ...props: P[]): U;

  each(callback: EachCallback<T>): void;
  each<P1 extends IterProperties<T>>(callback: EachCallback<IndexValue<T, P1>>, prop1: P1): void;
  each<P1 extends keyof T, P2 extends IterProperties<T[P1]>>(callback: EachCallback<IndexValue<IndexValue<T, P1>, P2>>, prop1: P1, prop2: P2): void;
  each<P1 extends keyof T, P2 extends IterProperties<T[P1]>, P3 extends IterProperties<IndexValue<T[P1], P2>>>(callback: EachCallback<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>>, prop1: P1, prop2: P2, prop3: P3): void;
  each<P1 extends keyof T, P2 extends IterProperties<T[P1]>, P3 extends IterProperties<IndexValue<T[P1], P2>>, P4 extends IterProperties<IndexValue<IndexValue<T[P1], P2>, P3>>>(callback: EachCallback<IndexValue<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, P4>>, prop1: P1, prop2: P2, prop3: P3, prop4: P4): void;
  each<P extends PropertyKey>(callback: EachCallback<any>, prop1: P, prop2: P, prop3: P, prop4: P, ...props: P[]): void;

  getParentNode: (count?: number | undefined) => any | null,

  map<U>(callback: MapCallback<T, U>): U[];
  map<U, P1 extends IterProperties<T>>(callback: MapCallback<IndexValue<T, P1>, U>, prop1: P1): U[];
  map<U, P1 extends keyof T, P2 extends IterProperties<T[P1]>>(callback: MapCallback<IndexValue<IndexValue<T, P1>, P2>, U>, prop1: P1, prop2: P2): U[];
  map<U, P1 extends keyof T, P2 extends IterProperties<T[P1]>, P3 extends IterProperties<IndexValue<T[P1], P2>>>(callback: MapCallback<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, U>, prop1: P1, prop2: P2, prop3: P3): U[];
  map<U, P1 extends keyof T, P2 extends IterProperties<T[P1]>, P3 extends IterProperties<IndexValue<T[P1], P2>>, P4 extends IterProperties<IndexValue<IndexValue<T[P1], P2>, P3>>>(callback: MapCallback<IndexValue<IndexValue<IndexValue<IndexValue<T, P1>, P2>, P3>, P4>, U>, prop1: P1, prop2: P2, prop3: P3, prop4: P4): U[];
  map<U, P extends PropertyKey>(callback: MapCallback<any, U>, prop1: P, prop2: P, prop3: P, prop4: P, ...props: P[]): U[];
};

// Reexporting the Doc type mostly because it's annoying to have to reference
// type so deeply in the Prettier namespace. Also because we only really want to
// be pulling in types from this file as they're less likely to change.
export type Doc = Prettier.doc.builders.Doc;

// This is the same embed as is present in prettier, except that it's required.
export type Embed<T> = Required<Prettier.Printer<T>>["embed"];

// These are the regular options from prettier except they also include all of
// the options we defined in our plugin configuration.
export type Options = Prettier.ParserOptions<any> & {
  printer: RequiredKeys<Prettier.Printer, "printComment">,
  rubyArrayLiteral: boolean,
  rubyHashLabel: boolean,
  rubyModifier: boolean,
  rubySingleQuote: boolean,
  rubyToProc: boolean
};

// hasPragma was not required, but since we're testing it explicitly we're going
// to add that into the parser object as being required. Additionally we're
// going to change the signature of our parse function to accept our options as
// opposed to the generic options that don't contain the options we defined in
// our plugin configuration.
export type Parser<T> = Omit<Prettier.Parser<T>, "hasPragma" | "parse"> & Required<Pick<Prettier.Parser<T>, "hasPragma">> & {
  parse: (text: string, parsers: { [name: string]: Prettier.Parser<any> }, options: Options) => any
};

// We're overwriting a bunch of function here that walk around the tree here
// because if you restrict the AST for the main path then presumably you're
// printing a lower node in the tree that won't match the current AST type.
export type Path<T> = Omit<Prettier.AstPath<T>, keyof StrictPath<T>> & StrictPath<T>;

// The printer from prettier is missing a couple of keys. We should presumably
// upstream this so that it's accurate in all plugins.
export type PrinterConfig<T> = Omit<Prettier.Printer<T>, "insertPragma" | "print"> & Required<Pick<Prettier.Printer<T>, "insertPragma">> & {
  getCommentChildNodes?: (node: any) => any[],
  isBlockComment?: (comment: any, options: Options) => boolean,
  print: Printer<T>
};

// This is the regular print node, except it's not restricted by the AST that
// is passed to the parent AST. That's because when you're using it, you are not
// typically printing the same node type again.
export type Print = (path: Path<any>) => Doc;

// This is the regular printer, except it uses our overridden options and print
// types.
export type Printer<T> = (path: Path<T>, options: Options, print: Print) => Doc;
