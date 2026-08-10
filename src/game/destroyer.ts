import { TEMPLE } from "./constants";
import { dist } from "./distance";
import type { GameState, Threat } from "./types";

export const isAvoidableDestroy = (target: Threat) => dist(target.pos, TEMPLE) >= 2;

export const shouldAutoFire = (state: GameState) =>
  state.destroyerAutonomous && state.destroyerCharges > 0 && state.threats.length > 0;

export const autoFireTarget = (state: GameState) =>
  [...state.threats].sort((a, b) => {
    const d = dist(b.pos, TEMPLE) - dist(a.pos, TEMPLE);
    return d === 0 ? a.id.localeCompare(b.id) : d;
  })[0];
