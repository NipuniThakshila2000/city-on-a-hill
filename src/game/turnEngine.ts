import { HOUSES } from "./constants";
import { makeThreat, THREAT_STATS } from "./combat";
import { dist, keyOf, samePos } from "./distance";
import { activeCheckpoints, housesForLevel, isHouseLit, isLit, litSquares } from "./light";
import { hasSkill } from "./skills";
import { stepThreats } from "./threatAI";
import { tickCheckpoints } from "./checkpoint";
import { autoFireTarget, shouldAutoFire } from "./destroyer";
import { lockedSquares } from "./rules";
import type { GameState, HouseProgress, OrderLevel } from "./types";

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
    protectorCoversDiagonals: next.protectorBraced || next.helper === "might" || hasSkill(next.campaign, "protector-under-his-wings"),
    looser: next.pieces.looser.alive ? next.pieces.looser.pos : undefined,
    checkpoints: activeCheckpoints(next).map((c) => c.pos),
    constructingCheckpoints: next.checkpoints.filter((c) => !c.complete).map((c) => c.pos),
    lit: litSquares(next),
    threatenedCheckpoints: next.checkpoints.map((c) => c.pos),
    anchoredThreatIds: next.threats.filter((threat) => threat.anchoredTurns).map((threat) => threat.id)
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
  const checkpoints = next.checkpoints
    .filter((checkpoint) => checkpoint.complete || !result.disruptedCheckpoints.some((pos) => samePos(pos, checkpoint.pos)))
    .map((checkpoint) => {
      const suppressed =
        result.suppressedCheckpoints.some((pos) => samePos(pos, checkpoint.pos)) ||
        (checkpoint.complete && result.disruptedCheckpoints.some((pos) => samePos(pos, checkpoint.pos)));
      return suppressed ? { ...checkpoint, suppressedTurns: 1 } : checkpoint;
    });
  if (templeHits >= 3) {
    return { ...next, pieces, looserSecondChanceUsed, threats, checkpoints, templeHits, phase: "lost" };
  }
  return { ...next, pieces, looserSecondChanceUsed, threats, checkpoints, templeHits };
};

const emptyHouseProgress = (): HouseProgress => ({
  litTurns: 0,
  scriptureComplete: false,
  stabilized: false
});

export const updateHouseProgress = (state: GameState) => {
  const progress = { ...state.houseProgress };
  for (const house of housesForLevel(state)) {
    const before = progress[house.id] ?? emptyHouseProgress();
    const lit = isHouseLit(house, state);
    const adjacentDarkness = state.threats.some((threat) => dist(threat.pos, house.pos) <= 1);
    const litTurns = lit ? before.litTurns + 1 : 0;
    let stabilized = before.stabilized;
    if (!stabilized) {
      if (house.objective.type === "standard") stabilized = lit;
      if (house.objective.type === "continuousLight") stabilized = litTurns >= house.objective.turns;
      if (house.objective.type === "scripture") stabilized = lit && before.scriptureComplete;
      if (house.objective.type === "noAdjacentDarkness") stabilized = lit && !adjacentDarkness;
    }
    if (house.objective.type === "noAdjacentDarkness" && adjacentDarkness) stabilized = false;
    progress[house.id] = { ...before, litTurns, stabilized };
  }
  return progress;
};

const orderAfterTurn = (state: GameState, previous: GameState): OrderLevel => {
  let order = state.order;
  const stabilizedNow = housesForLevel(state).some((house) => state.houseProgress[house.id]?.stabilized && !previous.houseProgress[house.id]?.stabilized);
  const newDisconnection = state.checkpoints.some((checkpoint) => checkpoint.complete && !activeCheckpoints(state).some((active) => samePos(active.pos, checkpoint.pos)));
  if (stabilizedNow || state.templeHits === previous.templeHits) order = Math.min(3, order + 1) as OrderLevel;
  if (newDisconnection || state.templeHits > previous.templeHits) order = Math.max(0, order - 1) as OrderLevel;
  return order;
};

export const upkeepPhase = (state: GameState): GameState => {
  const turn = state.turn;
  let checkpoints = tickCheckpoints(state);
  const occupied = [
    ...Object.values(state.pieces).filter((p) => p.alive).map((p) => p.pos),
    ...state.threats.map((t) => t.pos)
  ];
  const spawns = state.level.spawns
    .filter((s) => s.turn === turn + 1)
    .map((s) => makeThreat(s))
    .filter((s) => !occupied.some((p) => samePos(p, s.pos)));
  let threats = [...state.threats, ...spawns];
  checkpoints = checkpoints.filter(
    (c) => !threats.some((t) => samePos(t.pos, c.pos)) || c.complete
  );

  let checked: GameState = {
    ...state,
    threats,
    checkpoints,
    pieces: resetPiecesForTurn(state),
    phase: "player",
    turn: turn + 1,
    protectorBraced: false
  };
  checked = { ...checked, houseProgress: updateHouseProgress(checked) };
  checked = { ...checked, order: orderAfterTurn(checked, state) };
  const justStabilized = housesForLevel(checked).find((house) => checked.houseProgress[house.id]?.stabilized && !state.houseProgress[house.id]?.stabilized);
  if (justStabilized) checked = { ...checked, message: `${justStabilized.name} holds in the Light.` };

  if (turn >= state.level.turns) {
    const housesComplete = housesForLevel(checked).every((h) => checked.houseProgress[h.id]?.stabilized);
    return { ...checked, phase: housesComplete ? "won" : "failed" };
  }
  return checked;
};

export const endTurn = (state: GameState) => upkeepPhase(enemyPhase(state));
