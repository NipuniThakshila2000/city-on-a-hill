import { HOUSES } from "./constants";
import { samePos } from "./distance";
import { isLit } from "./light";
import { stepThreats } from "./threatAI";
import { tickCornerstones } from "./building";
import { autoFireTarget, shouldAutoFire } from "./destroyer";
import { lockedSquares } from "./rules";
import type { GameState } from "./types";

export const resetPiecesForTurn = (state: GameState) => {
  const pieces = { ...state.pieces };
  for (const id of Object.keys(pieces) as (keyof typeof pieces)[]) {
    pieces[id] = { ...pieces[id], moved: false, acted: false };
  }
  return pieces;
};

export const enemyPhase = (state: GameState): GameState => {
  let next = { ...state, phase: "enemy" as const };
  if (shouldAutoFire(next)) {
    const target = autoFireTarget(next);
    next = {
      ...next,
      threats: next.threats.filter((t) => t.id !== target.id),
      destroyerCharges: next.destroyerCharges - 1,
      message: "The Destroyer moved before your order."
    };
  }

  const result = stepThreats({
    threats: next.threats,
    locked: lockedSquares(next),
    protector: next.pieces.protector.pos,
    protectorCoversDiagonals: next.helper === "might",
    looser: next.pieces.looser.alive ? next.pieces.looser.pos : undefined,
    cornerstones: next.cornerstones.filter((c) => c.complete).map((c) => c.pos)
  });

  const pieces = { ...next.pieces };
  if (result.looserKilled) pieces.looser = { ...pieces.looser, alive: false };

  const templeHits = next.templeHits + result.templeHits;
  if (templeHits >= 3) {
    return { ...next, pieces, threats: result.threats, templeHits, phase: "lost" };
  }
  return { ...next, pieces, threats: result.threats, templeHits };
};

export const upkeepPhase = (state: GameState): GameState => {
  const turn = state.turn;
  let cornerstones = tickCornerstones(state);
  let threats = [...state.threats, ...state.level.spawns.filter((s) => s.turn === turn + 1)];
  cornerstones = cornerstones.filter(
    (c) => !threats.some((t) => samePos(t.pos, c.pos)) || c.complete
  );

  const checked: GameState = {
    ...state,
    threats,
    cornerstones,
    pieces: resetPiecesForTurn(state),
    phase: "player",
    turn: turn + 1
  };

  if (turn >= state.level.turns) {
    const housesLit = HOUSES.every((h) => isLit(h, checked));
    return { ...checked, phase: housesLit ? "won" : "failed" };
  }
  return checked;
};

export const endTurn = (state: GameState) => upkeepPhase(enemyPhase(state));
