import { BOARD_SIZE, TEMPLE } from "./constants";
import { dist } from "./distance";
import type { GameState, Pos } from "./types";

export const isLit = (p: Pos, state: Pick<GameState, "cornerstones">) =>
  dist(p, TEMPLE) <= 2 ||
  state.cornerstones.some((c) => c.complete && dist(p, c.pos) <= 2);

export const litSquares = (state: Pick<GameState, "cornerstones">) => {
  const lit: Pos[] = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const pos = { x, y };
      if (isLit(pos, state)) lit.push(pos);
    }
  }
  return lit;
};
