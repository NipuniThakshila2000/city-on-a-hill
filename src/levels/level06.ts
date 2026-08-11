import type { Level } from "./schema";

export const level06: Level = {
  id: 6,
  turns: 12,
  forecastWindow: 1,
  startPositions: {
    destroyer: { x: 3, y: 2 },
    binder: { x: 2, y: 3 },
    looser: { x: 4, y: 3 },
    protector: { x: 3, y: 5 }
  },
  spawns: [
    { turn: 2, pos: { x: 3, y: 0 }, id: "L6-D1A", tier: 2 },
    { turn: 3, pos: { x: 0, y: 3 }, id: "L6-A4", tier: 3 },
    { turn: 4, pos: { x: 6, y: 3 }, id: "L6-G4", tier: 2 },
    { turn: 5, pos: { x: 1, y: 0 }, id: "L6-B1", tier: 3 },
    { turn: 7, pos: { x: 5, y: 0 }, id: "L6-F1", tier: 4 },
    { turn: 9, pos: { x: 0, y: 6 }, id: "L6-A7", tier: 2 }
  ],
  soil: { C6: "poor", D6: "poor", E6: "poor", D7: "poor" }
};
