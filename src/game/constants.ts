import type { House, Pos } from "./types";

export const BOARD_SIZE = 7;
export const TEMPLE: Pos = { x: 3, y: 3 };
export const DEFAULT_HOUSES: House[] = [
  { id: "peace", name: "House of Peace", pos: { x: 2, y: 6 }, objective: { type: "continuousLight", turns: 2 } },
  { id: "wisdom", name: "House of Wisdom", pos: { x: 3, y: 6 }, objective: { type: "scripture" } },
  { id: "mercy", name: "House of Mercy", pos: { x: 4, y: 6 }, objective: { type: "noAdjacentDarkness" } }
];
export const HOUSES: Pos[] = DEFAULT_HOUSES.map((house) => house.pos);
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
