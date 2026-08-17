import { HOUSES } from "./constants";
import { makeThreat, THREAT_STATS } from "./combat";
import { dist, samePos } from "./distance";
import { isLit } from "./light";
import { hasSkill } from "./skills";
import { stepThreats } from "./threatAI";
import { tickCornerstones } from "./building";
import { autoFireTarget, shouldAutoFire } from "./destroyer";
import { lockedSquares } from "./rules";
import type { GameState } from "./types";

export const resetPiecesForTurn = (state: GameState) => {
  const pieces = { ...state.pieces };
  for (const id of Object.keys(pieces) as (keyof typeof pieces)[]) {
    const piece = pieces[id];
    const healed = isLit(piece.pos, state) ? Math.min(piece.maxHp, piece.hp + 1) : piece.hp;
    pieces[id] = { ...piece, hp: healed, alive: healed > 0, moved: false, acted: false };
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
    protectorCoversDiagonals: next.helper === "might" || hasSkill(next.campaign, "protector-under-his-wings"),
    looser: next.pieces.looser.alive ? next.pieces.looser.pos : undefined,
    cornerstones: next.cornerstones.filter((c) => c.complete).map((c) => c.pos)
  });

  const pieces = { ...next.pieces };
  let looserSecondChanceUsed = next.looserSecondChanceUsed;
  for (const hit of result.pieceHits) {
    const piece = pieces[hit.pieceId];
    if (piece.id === "binder" && piece.locked && hasSkill(next.campaign, "binder-immovable")) continue;
    const hp = Math.max(0, piece.hp - hit.damage);
    const rescuedLooser =
      piece.id === "looser" &&
      hp <= 0 &&
      !looserSecondChanceUsed &&
      hasSkill(next.campaign, "looser-delivered-from-darkness");
    if (rescuedLooser) looserSecondChanceUsed = true;
    pieces[hit.pieceId] = { ...piece, hp: rescuedLooser ? 1 : hp, alive: rescuedLooser || hp > 0 };
    next = {
      ...next,
      message: `${THREAT_STATS[next.threats.find((t) => t.id === hit.threatId)?.tier ?? 1].name} attacked ${hit.pieceId}.`
    };
  }

  const threats = hasSkill(next.campaign, "protector-ten-thousand")
    ? result.threats
        .map((threat) => dist(threat.pos, next.pieces.protector.pos) <= 1 ? { ...threat, hp: threat.hp - 1 } : threat)
        .filter((threat) => threat.hp > 0)
    : result.threats;
  const templeHits = next.templeHits + result.templeHits;
  if (templeHits >= 3) {
    return { ...next, pieces, looserSecondChanceUsed, threats, templeHits, phase: "lost" };
  }
  return { ...next, pieces, looserSecondChanceUsed, threats, templeHits };
};

export const upkeepPhase = (state: GameState): GameState => {
  const turn = state.turn;
  let cornerstones = tickCornerstones(state);
  const occupied = [
    ...Object.values(state.pieces).filter((p) => p.alive).map((p) => p.pos),
    ...state.threats.map((t) => t.pos)
  ];
  const spawns = state.level.spawns
    .filter((s) => s.turn === turn + 1)
    .map((s) => makeThreat(s))
    .filter((s) => !occupied.some((p) => samePos(p, s.pos)));
  let threats = [...state.threats, ...spawns];
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
