import type { Level } from "./schema";

export const level01: Level = {
  id: 1,
  turns: 8,
  forecastWindow: 2,
  startPositions: {
    destroyer: { x: 3, y: 2 },
    binder: { x: 2, y: 3 },
    looser: { x: 4, y: 3 },
    protector: { x: 3, y: 4 }
  },
  spawns: [
    { turn: 3, pos: { x: 0, y: 3 }, id: "L1-A4" },
    { turn: 3, pos: { x: 6, y: 1 }, id: "L1-G2" },
    { turn: 4, pos: { x: 3, y: 0 }, id: "L1-D1" }
  ],
  soil: { D6: "poor" }
};
