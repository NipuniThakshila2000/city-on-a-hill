import type { Level } from "./schema";

export const level05: Level = {
  id: 5,
  turns: 11,
  forecastWindow: 1,
  startPositions: {
    destroyer: { x: 3, y: 1 },
    binder: { x: 1, y: 4 },
    looser: { x: 5, y: 4 },
    protector: { x: 3, y: 5 }
  },
  spawns: [
    { turn: 2, pos: { x: 0, y: 3 }, id: "L5-A4" },
    { turn: 3, pos: { x: 6, y: 3 }, id: "L5-G4" },
    { turn: 4, pos: { x: 3, y: 0 }, id: "L5-D1" },
    { turn: 6, pos: { x: 0, y: 6 }, id: "L5-A7" },
    { turn: 8, pos: { x: 6, y: 0 }, id: "L5-G1" }
  ],
  soil: { C6: "poor", D6: "poor", E6: "poor" }
};
