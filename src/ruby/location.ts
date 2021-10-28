import type { Location } from "../types/ruby";

export function getStartLine(location: Location) {
  return location[0];
}

export function getStartChar(location: Location) {
  return location[1];
}

export function getEndLine(location: Location) {
  return location[2];
}

export function getEndChar(location: Location) {
  return location[3];
}
