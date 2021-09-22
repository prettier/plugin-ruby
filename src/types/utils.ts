// The type of elements that make up the given array T.
export type ArrayElement<T> = T extends (infer E)[] ? E : never;

// A union of the properties of the given object that are arrays.
export type ArrayProperties<T> = { [K in keyof T]: T[K] extends any[] ? K : never }[keyof T];

// A union of the properties of the given array T that can be used to index it.
// If the array is a tuple, then that's going to be the explicit indices of the
// array, otherwise it's going to just be number.
export type IndexProperties<T extends { length: number }> = IsTuple<T> extends true ? Exclude<Partial<T>["length"], T["length"]> : number;

// Effectively performing T[P], except that it's telling TypeScript that it's
// safe to do this for tuples, arrays, or objects.
export type IndexValue<T, P> = T extends any[] ? P extends number ? T[P] : never : P extends keyof T ? T[P] : never;

// Determines if an object T is an array like string[] (in which case this
// evaluates to false) or a tuple like [string] (in which case this evaluates to
// true).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type IsTuple<T> = T extends [] ? true : T extends [infer First, ...infer Remain] ? IsTuple<Remain> : false;

// The same object T as currently exists, except the keys provided by P are
// required instead of optional.
export type RequiredKeys<T, P extends keyof T> = T & Required<Pick<T, P>>;
