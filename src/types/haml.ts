// This file contains all of the types that represent objects being returned
// from the HAML parser.

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
