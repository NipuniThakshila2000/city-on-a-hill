import { TEMPLE, TIE_BREAK } from "./constants";
import { addPos, dist, inBounds, samePos } from "./distance";
import type { Pos, ThreatBoard, ThreatStepResult } from "./types";

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
  board.cornerstones.some((c) => samePos(c, p)) ||
  protectorCoveredSquares(board.protector, board.protectorCoversDiagonals).some((c) =>
    samePos(c, p)
  ) ||
  activeThreats.some((t) => samePos(t, p));

export const stepThreats = (board: ThreatBoard): ThreatStepResult => {
  const ordered = [...board.threats].sort((a, b) => a.id.localeCompare(b.id));
  const nextThreats = ordered.map((t) => ({ ...t, pos: { ...t.pos } }));
  let templeHits = 0;
  let looserKilled = false;

  for (const threat of nextThreats) {
    const occupied = nextThreats.filter((t) => t.id !== threat.id).map((t) => t.pos);
    const candidates = TIE_BREAK.map((d) => addPos(threat.pos, d)).filter(
      (p) => inBounds(p) && !blocked(p, board, occupied)
    );
    const nearest = Math.min(...candidates.map((p) => dist(p, TEMPLE)));
    const chosen = candidates.find((p) => dist(p, TEMPLE) === nearest);

    if (chosen) {
      if (board.looser && samePos(chosen, board.looser)) {
        looserKilled = true;
      } else {
        threat.pos = chosen;
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

  return { threats: survivors, templeHits, looserKilled };
};
