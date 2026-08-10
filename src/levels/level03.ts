import type { Level } from "./schema";

export const level03: Level = {
  id: 3,
  turns: 10,
  forecastWindow: 2,
  startPositions: {
    destroyer: { x: 4, y: 2 },
    binder: { x: 1, y: 3 },
    looser: { x: 5, y: 4 },
    protector: { x: 3, y: 4 }
  },
  spawns: [
    { turn: 2, pos: { x: 0, y: 5 }, id: "L3-A6" },
    { turn: 3, pos: { x: 6, y: 3 }, id: "L3-G4" },
    { turn: 4, pos: { x: 3, y: 0 }, id: "L3-D1" },
    { turn: 6, pos: { x: 0, y: 1 }, id: "L3-A2" },
    { turn: 8, pos: { x: 6, y: 6 }, id: "L3-G7" }
  ],
  soil: { C6: "poor", D6: "poor", E6: "poor" }
};
