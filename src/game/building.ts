import { keyOf, samePos } from "./distance";
import type { GameState, Pos } from "./types";

export const soilAt = (state: GameState, pos: Pos) => {
  const key = keyOf(pos);
  if (state.preparedSoil.includes(key)) return "good";
  return state.level.soil[key] ?? "good";
};

export const canPlantAt = (state: GameState, pos: Pos) =>
  !state.cornerstones.some((c) => samePos(c.pos, pos)) && soilAt(state, pos) === "good";

export const tickCornerstones = (state: GameState) =>
  state.cornerstones.map((c) => {
    if (c.complete) return c;
    const turnsRemaining = c.turnsRemaining - 1;
    return { ...c, turnsRemaining, complete: turnsRemaining <= 0 };
  });
