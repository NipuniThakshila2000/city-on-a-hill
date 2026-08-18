import type { Level } from "./schema";
import { DEFAULT_HOUSES } from "../game/constants";

export const level01: Level = {
  id: 1,
  turns: 9,
  forecastWindow: 3,
  startPositions: {
    destroyer: { x: 3, y: 2 },
    binder: { x: 2, y: 3 },
    looser: { x: 4, y: 3 },
    protector: { x: 3, y: 4 }
  },
  spawns: [
    { turn: 3, pos: { x: 0, y: 3 }, id: "L1-SHADE-A4", tier: 1 },
    { turn: 4, pos: { x: 6, y: 1 }, id: "L1-SHROUD-G2", tier: 2 },
    { turn: 6, pos: { x: 0, y: 6 }, id: "L1-DEPTH-A7", tier: 3 },
    { turn: 8, pos: { x: 6, y: 6 }, id: "L1-ABYSS-G7", tier: 4 }
  ],
  soil: { C5: "poor", E5: "poor", D6: "poor" },
  houses: DEFAULT_HOUSES
};
