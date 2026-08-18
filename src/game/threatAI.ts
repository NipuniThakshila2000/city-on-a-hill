import { TEMPLE, TIE_BREAK } from "./constants";
import { THREAT_STATS } from "./combat";
import { addPos, dist, inBounds, samePos } from "./distance";
import type { DarknessBehaviour, Pos, Threat, ThreatBoard, ThreatStepResult, ThreatTier } from "./types";

export const threatBehaviour = (tier: ThreatTier): DarknessBehaviour =>
  tier === 2 ? "avoidLight" : tier === 3 ? "targetCheckpoint" : tier === 4 ? "suppressLight" : "direct";

export const protectorCoveredSquares = (protector: Pos, coversDiagonals: boolean) => {
  const dirs = coversDiagonals
    ? TIE_BREAK
    : [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
      ];
  return [protector, ...dirs.map((d) => addPos(protector, d)).filter(inBounds)];
};

const blocked = (p: Pos, board: ThreatBoard, activeThreats: Pos[]) =>
  samePos(p, TEMPLE) ||
  board.locked.some((l) => samePos(l, p)) ||
  protectorCoveredSquares(board.protector, board.protectorCoversDiagonals).some((c) =>
    samePos(c, p)
  ) ||
  activeThreats.some((t) => samePos(t, p));

const checkpointTarget = (threat: Threat, board: ThreatBoard) =>
  board.threatenedCheckpoints
    .filter((checkpoint) => dist(threat.pos, checkpoint) <= 3)
    .sort((a, b) => dist(threat.pos, a) - dist(threat.pos, b) || dist(a, TEMPLE) - dist(b, TEMPLE))[0];

const chooseStep = (threat: Threat, board: ThreatBoard, occupied: Pos[]) => {
  if (board.anchoredThreatIds.includes(threat.id)) return undefined;
  const candidates = TIE_BREAK.map((d) => addPos(threat.pos, d)).filter(
    (p) => inBounds(p) && !blocked(p, board, occupied)
  );
  if (candidates.length === 0) return undefined;

  const behaviour = threatBehaviour(threat.tier);
  const target = behaviour === "targetCheckpoint" ? checkpointTarget(threat, board) ?? TEMPLE : TEMPLE;
  const nearest = Math.min(...candidates.map((p) => dist(p, target)));
  const closer = candidates.filter((p) => dist(p, target) === nearest);

  if (behaviour === "avoidLight") {
    const leastLit = Math.min(...closer.map((p) => board.lit.some((lit) => samePos(lit, p)) ? 1 : 0));
    return closer.find((p) => (board.lit.some((lit) => samePos(lit, p)) ? 1 : 0) === leastLit);
  }

  return closer[0];
};

export const nextThreatPosition = (threat: Threat, board: ThreatBoard, occupied: Pos[] = []) =>
  chooseStep(threat, board, occupied) ?? threat.pos;

export const projectThreatPath = (threat: Threat, board: ThreatBoard, steps: number) => {
  const path: Pos[] = [];
  let cursor = { ...threat };
  for (let step = 0; step < steps; step += 1) {
    const next = nextThreatPosition(cursor, board);
    path.push(next);
    cursor = { ...cursor, pos: next };
    if (dist(next, TEMPLE) <= 1) break;
  }
  return path;
};

export const stepThreats = (board: ThreatBoard): ThreatStepResult => {
  const ordered = [...board.threats].sort((a, b) => a.id.localeCompare(b.id));
  const nextThreats = ordered.map((t) => ({ ...t, pos: { ...t.pos }, anchoredTurns: Math.max(0, (t.anchoredTurns ?? 0) - 1) || undefined }));
  let templeHits = 0;
  const pieceHits: ThreatStepResult["pieceHits"] = [];
  const disruptedCheckpoints: Pos[] = [];
  const suppressedCheckpoints: Pos[] = [];

  for (const threat of nextThreats) {
    const occupied = nextThreats.filter((t) => t.id !== threat.id).map((t) => t.pos);
    const chosen = chooseStep(threat, board, occupied);

    if (chosen) {
      if (board.looser && samePos(chosen, board.looser)) {
        pieceHits.push({
          pieceId: "looser",
          threatId: threat.id,
          damage: THREAT_STATS[threat.tier].attack
        });
      } else {
        threat.pos = chosen;
      }
    }

    const struck = [...board.constructingCheckpoints, ...board.checkpoints].find((checkpoint) => samePos(checkpoint, threat.pos));
    if (struck) disruptedCheckpoints.push(struck);
    if (threatBehaviour(threat.tier) === "suppressLight") {
      for (const checkpoint of board.checkpoints) {
        if (dist(threat.pos, checkpoint) <= 1) suppressedCheckpoints.push(checkpoint);
      }
    }
  }

  const survivors = nextThreats.filter((threat) => {
    if (dist(threat.pos, TEMPLE) <= 1) {
      templeHits += 1;
      return false;
    }
    return true;
  });

  return { threats: survivors, templeHits, pieceHits, disruptedCheckpoints, suppressedCheckpoints };
};
