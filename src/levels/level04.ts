import type { Level } from "./schema";

export const level04: Level = {
  id: 4,
  turns: 10,
  forecastWindow: 2,
  startPositions: {
    destroyer: { x: 3, y: 2 },
    binder: { x: 2, y: 4 },
    looser: { x: 4, y: 4 },
    protector: { x: 3, y: 5 }
  },
  spawns: [
    { turn: 2, pos: { x: 3, y: 0 }, id: "L4-D1A" },
    { turn: 3, pos: { x: 0, y: 3 }, id: "L4-A4" },
    { turn: 4, pos: { x: 6, y: 3 }, id: "L4-G4" },
    { turn: 6, pos: { x: 2, y: 0 }, id: "L4-C1" },
    { turn: 7, pos: { x: 4, y: 0 }, id: "L4-E1" }
  ],
  soil: { D6: "poor", B6: "poor", F6: "poor" }
};
