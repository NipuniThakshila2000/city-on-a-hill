import { BOARD_SIZE, HOUSES, TEMPLE, TIE_BREAK } from "./constants";
import { addPos, dist, inBounds, samePos } from "./distance";
import { isLit } from "./light";
import type { GameState, Piece, Pos } from "./types";

export const occupiedByPiece = (state: GameState, pos: Pos, except?: string) =>
  Object.values(state.pieces).some(
    (p) => p.alive && p.id !== except && samePos(p.pos, pos)
  );

export const occupiedByThreat = (state: GameState, pos: Pos) =>
  state.threats.some((t) => samePos(t.pos, pos));

export const lockedSquares = (state: GameState) =>
  Object.values(state.pieces)
    .filter((p) => p.id === "binder" && p.locked)
    .map((p) => p.pos);

export const isBlockedForPiece = (state: GameState, pos: Pos, pieceId: string) =>
  !inBounds(pos) ||
  samePos(pos, TEMPLE) ||
  HOUSES.some((h) => samePos(h, pos)) ||
  lockedSquares(state).some((l) => samePos(l, pos)) ||
  occupiedByPiece(state, pos, pieceId) ||
  occupiedByThreat(state, pos) ||
  state.cornerstones.some((c) => samePos(c.pos, pos));

const reachableLooser = (state: GameState, piece: Piece) => {
  const seen = new Set([`${piece.pos.x},${piece.pos.y}`]);
  let frontier = [piece.pos];
  for (let step = 0; step < 3; step += 1) {
    const next: Pos[] = [];
    for (const p of frontier) {
      for (const d of TIE_BREAK) {
        const n = addPos(p, d);
        const key = `${n.x},${n.y}`;
        if (seen.has(key) || isBlockedForPiece(state, n, piece.id)) continue;
        seen.add(key);
        next.push(n);
      }
    }
    frontier = next;
  }
  return [...seen].map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  });
};

export const legalMoves = (state: GameState, pieceId: keyof GameState["pieces"]) => {
  const piece = state.pieces[pieceId];
  if (!piece.alive || piece.moved || state.phase !== "player") return [];
  if (piece.id === "binder" && piece.locked) return [];
  if (piece.id === "destroyer") {
    const moves: Pos[] = [];
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        const pos = { x, y };
        if (!isBlockedForPiece(state, pos, piece.id)) moves.push(pos);
      }
    }
    return moves;
  }
  if (piece.id === "looser") return reachableLooser(state, piece).filter((p) => !samePos(p, piece.pos));
  return [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ]
    .map((d) => addPos(piece.pos, d))
    .filter((p) => !isBlockedForPiece(state, p, piece.id));
};

export const canBuild = (state: GameState, piece: Piece) =>
  piece.alive &&
  !piece.acted &&
  state.phase === "player" &&
  !samePos(piece.pos, TEMPLE) &&
  !HOUSES.some((h) => samePos(h, piece.pos)) &&
  !isLit(piece.pos, state) &&
  !state.cornerstones.some((c) => samePos(c.pos, piece.pos)) &&
  !occupiedByThreat(state, piece.pos);

export const canRelease = (state: GameState, piece: Piece) =>
  piece.id === "looser" &&
  piece.alive &&
  !piece.acted &&
  lockedSquares(state).some((l) => dist(l, piece.pos) <= 1);
