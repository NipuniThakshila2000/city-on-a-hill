import { BOARD_SIZE } from "./constants";
import type { Pos } from "./types";

export const dist = (a: Pos, b: Pos) =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

export const samePos = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;

export const addPos = (a: Pos, b: Pos): Pos => ({ x: a.x + b.x, y: a.y + b.y });

export const inBounds = (p: Pos) =>
  p.x >= 0 && p.x < BOARD_SIZE && p.y >= 0 && p.y < BOARD_SIZE;

export const keyOf = (p: Pos) => `${String.fromCharCode(65 + p.x)}${p.y + 1}`;

export const posFromKey = (key: string): Pos => ({
  x: key.toUpperCase().charCodeAt(0) - 65,
  y: Number(key.slice(1)) - 1
});
