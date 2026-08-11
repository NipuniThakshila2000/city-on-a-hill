import type { Level } from "./schema";

export const level02: Level = {
  id: 2,
  turns: 9,
  forecastWindow: 2,
  startPositions: {
    destroyer: { x: 2, y: 2 },
    binder: { x: 4, y: 3 },
    looser: { x: 2, y: 4 },
    protector: { x: 3, y: 5 }
  },
  spawns: [
    { turn: 2, pos: { x: 6, y: 3 }, id: "L2-G4", tier: 1 },
    { turn: 3, pos: { x: 0, y: 2 }, id: "L2-A3", tier: 1 },
    { turn: 5, pos: { x: 3, y: 0 }, id: "L2-D1", tier: 2 },
    { turn: 7, pos: { x: 6, y: 6 }, id: "L2-G7", tier: 1 }
  ],
  soil: { D6: "poor", C6: "poor" }
};
