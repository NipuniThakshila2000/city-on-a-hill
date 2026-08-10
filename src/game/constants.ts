import type { Pos } from "./types";

export const BOARD_SIZE = 7;
export const TEMPLE: Pos = { x: 3, y: 3 };
export const HOUSES: Pos[] = [
  { x: 2, y: 6 },
  { x: 3, y: 6 },
  { x: 4, y: 6 }
];
export const TIE_BREAK: Pos[] = [
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 }
];
export const PIECE_LABELS = {
  protector: "P",
  destroyer: "D",
  binder: "B",
  looser: "L"
} as const;
