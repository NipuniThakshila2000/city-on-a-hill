import { BOARD_SIZE, DEFAULT_HOUSES, TEMPLE } from "./constants";
import { dist, samePos } from "./distance";
import type { Checkpoint, GameState, House, Pos } from "./types";

export const LIGHT_LINK_RANGE = 2;

export const housesForLevel = (state: Pick<GameState, "level">): House[] =>
  state.level.houses ?? DEFAULT_HOUSES;

export const activeCheckpoints = (state: Pick<GameState, "checkpoints">) => {
  const complete = state.checkpoints.filter((checkpoint) => checkpoint.complete && !checkpoint.suppressedTurns);
  const active: Checkpoint[] = [];
  const frontier: Pos[] = [TEMPLE];
  const seen = new Set<string>();

  while (frontier.length > 0) {
    const source = frontier.shift()!;
    for (const checkpoint of complete) {
      const key = `${checkpoint.pos.x},${checkpoint.pos.y}`;
      if (seen.has(key) || dist(source, checkpoint.pos) > LIGHT_LINK_RANGE) continue;
      seen.add(key);
      active.push(checkpoint);
      frontier.push(checkpoint.pos);
    }
  }

  return active;
};

export const lightSources = (state: Pick<GameState, "checkpoints">): Pos[] => [
  TEMPLE,
  ...activeCheckpoints(state).map((checkpoint) => checkpoint.pos)
];

export const isHouseLit = (house: House | Pos, state: Pick<GameState, "checkpoints" | "level">) => {
  const pos = "pos" in house ? house.pos : house;
  return lightSources(state).some((source) => dist(source, pos) <= LIGHT_LINK_RANGE);
};

export const isLit = (p: Pos, state: Pick<GameState, "checkpoints" | "level">) =>
  samePos(p, TEMPLE) ||
  lightSources(state).some((source) => dist(source, p) <= 1) ||
  housesForLevel(state).some((house) => samePos(house.pos, p) && isHouseLit(house, state));

export const litSquares = (state: Pick<GameState, "checkpoints" | "level">) => {
  const lit: Pos[] = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const pos = { x, y };
      if (isLit(pos, state)) lit.push(pos);
    }
  }
  return lit;
};

export const checkpointState = (
  checkpoint: Checkpoint,
  state: Pick<GameState, "checkpoints" | "threats">
) => {
  if (!checkpoint.complete) return "establishing" as const;
  if (checkpoint.suppressedTurns) return "suppressed" as const;
  const active = activeCheckpoints(state).some((activeCheckpoint) => samePos(activeCheckpoint.pos, checkpoint.pos));
  if (!active) return "disconnected" as const;
  const threatened = state.threats.some((threat) => dist(threat.pos, checkpoint.pos) <= 1);
  return threatened ? "threatened" as const : "active" as const;
};
