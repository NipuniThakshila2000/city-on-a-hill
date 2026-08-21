import type { Level } from "./schema";

const advancedHouses = {
  foundation: { id: "foundation", name: "House of Foundation", pos: { x: 1, y: 6 }, objective: { type: "continuousLight", turns: 2 } },
  peace: { id: "peace", name: "House of Peace", pos: { x: 2, y: 6 }, objective: { type: "continuousLight", turns: 3 } },
  wisdom: { id: "wisdom", name: "House of Wisdom", pos: { x: 3, y: 6 }, objective: { type: "scripture" } },
  mercy: { id: "mercy", name: "House of Mercy", pos: { x: 4, y: 6 }, objective: { type: "noAdjacentDarkness" } },
  watch: { id: "watch", name: "House of Watchfulness", pos: { x: 5, y: 6 }, objective: { type: "standard" } }
} satisfies Record<string, NonNullable<Level["houses"]>[number]>;

const campaignHouses = [
  [advancedHouses.peace, advancedHouses.wisdom, advancedHouses.mercy],
  [advancedHouses.foundation, advancedHouses.wisdom, advancedHouses.mercy],
  [advancedHouses.peace, advancedHouses.wisdom, advancedHouses.watch],
  [advancedHouses.foundation, advancedHouses.peace, advancedHouses.wisdom, advancedHouses.mercy],
  [advancedHouses.foundation, advancedHouses.peace, advancedHouses.wisdom, advancedHouses.mercy, advancedHouses.watch]
] satisfies NonNullable<Level["houses"]>[];

const starts = [
  {
    destroyer: { x: 3, y: 1 },
    binder: { x: 1, y: 4 },
    looser: { x: 5, y: 4 },
    protector: { x: 3, y: 5 }
  },
  {
    destroyer: { x: 2, y: 2 },
    binder: { x: 4, y: 3 },
    looser: { x: 1, y: 5 },
    protector: { x: 3, y: 5 }
  },
  {
    destroyer: { x: 4, y: 2 },
    binder: { x: 2, y: 4 },
    looser: { x: 5, y: 5 },
    protector: { x: 3, y: 4 }
  },
  {
    destroyer: { x: 3, y: 2 },
    binder: { x: 1, y: 3 },
    looser: { x: 5, y: 3 },
    protector: { x: 3, y: 5 }
  }
] satisfies Level["startPositions"][];

export const advancedLevels: Level[] = [
  {
    id: 7,
    turns: 12,
    forecastWindow: 1,
    startPositions: starts[0],
    spawns: [
      { turn: 2, pos: { x: 0, y: 3 }, id: "L7-A4", tier: 2 },
      { turn: 3, pos: { x: 6, y: 3 }, id: "L7-G4", tier: 2 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L7-D1", tier: 3 },
      { turn: 6, pos: { x: 1, y: 0 }, id: "L7-B1", tier: 2 },
      { turn: 8, pos: { x: 6, y: 6 }, id: "L7-G7", tier: 3 },
      { turn: 10, pos: { x: 0, y: 6 }, id: "L7-A7", tier: 2 }
    ],
    soil: { B6: "poor", C6: "poor", D6: "poor", E6: "poor" },
    houses: campaignHouses[1]
  },
  {
    id: 8,
    turns: 12,
    forecastWindow: 1,
    startPositions: starts[1],
    spawns: [
      { turn: 2, pos: { x: 3, y: 0 }, id: "L8-D1A", tier: 3 },
      { turn: 3, pos: { x: 0, y: 2 }, id: "L8-A3", tier: 2 },
      { turn: 4, pos: { x: 6, y: 4 }, id: "L8-G5", tier: 2 },
      { turn: 6, pos: { x: 0, y: 6 }, id: "L8-A7", tier: 3 },
      { turn: 8, pos: { x: 6, y: 0 }, id: "L8-G1", tier: 3 },
      { turn: 11, pos: { x: 3, y: 0 }, id: "L8-D1B", tier: 4 }
    ],
    soil: { C5: "poor", D5: "poor", E5: "poor", D6: "poor" },
    houses: campaignHouses[2]
  },
  {
    id: 9,
    turns: 13,
    forecastWindow: 1,
    startPositions: starts[2],
    spawns: [
      { turn: 2, pos: { x: 0, y: 1 }, id: "L9-A2", tier: 2 },
      { turn: 3, pos: { x: 6, y: 1 }, id: "L9-G2", tier: 3 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L9-D1", tier: 3 },
      { turn: 6, pos: { x: 0, y: 5 }, id: "L9-A6", tier: 2 },
      { turn: 7, pos: { x: 6, y: 5 }, id: "L9-G6", tier: 3 },
      { turn: 9, pos: { x: 1, y: 0 }, id: "L9-B1", tier: 4 },
      { turn: 12, pos: { x: 5, y: 0 }, id: "L9-F1", tier: 3 }
    ],
    soil: { B5: "poor", C6: "poor", D6: "poor", E6: "poor", F5: "poor" },
    houses: campaignHouses[3]
  },
  {
    id: 10,
    turns: 13,
    forecastWindow: 0,
    startPositions: starts[3],
    spawns: [
      { turn: 2, pos: { x: 3, y: 0 }, id: "L10-D1A", tier: 3 },
      { turn: 3, pos: { x: 0, y: 3 }, id: "L10-A4", tier: 3 },
      { turn: 4, pos: { x: 6, y: 3 }, id: "L10-G4", tier: 3 },
      { turn: 6, pos: { x: 1, y: 0 }, id: "L10-B1", tier: 4 },
      { turn: 8, pos: { x: 5, y: 0 }, id: "L10-F1", tier: 3 },
      { turn: 10, pos: { x: 0, y: 6 }, id: "L10-A7", tier: 3 },
      { turn: 12, pos: { x: 6, y: 6 }, id: "L10-G7", tier: 4 }
    ],
    soil: { B6: "poor", C5: "poor", D6: "poor", E5: "poor", F6: "poor" },
    houses: campaignHouses[3]
  },
  {
    id: 11,
    turns: 13,
    forecastWindow: 0,
    startPositions: starts[0],
    spawns: [
      { turn: 2, pos: { x: 6, y: 2 }, id: "L11-G3", tier: 3 },
      { turn: 3, pos: { x: 0, y: 2 }, id: "L11-A3", tier: 3 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L11-D1", tier: 4 },
      { turn: 5, pos: { x: 6, y: 6 }, id: "L11-G7", tier: 2 },
      { turn: 7, pos: { x: 0, y: 6 }, id: "L11-A7", tier: 3 },
      { turn: 9, pos: { x: 2, y: 0 }, id: "L11-C1", tier: 4 },
      { turn: 11, pos: { x: 4, y: 0 }, id: "L11-E1", tier: 3 }
    ],
    soil: { A6: "poor", B6: "poor", D5: "poor", F6: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 12,
    turns: 14,
    forecastWindow: 0,
    startPositions: starts[1],
    spawns: [
      { turn: 2, pos: { x: 0, y: 3 }, id: "L12-A4A", tier: 3 },
      { turn: 3, pos: { x: 6, y: 3 }, id: "L12-G4A", tier: 4 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L12-D1", tier: 3 },
      { turn: 5, pos: { x: 0, y: 0 }, id: "L12-A1", tier: 2 },
      { turn: 7, pos: { x: 6, y: 0 }, id: "L12-G1", tier: 4 },
      { turn: 9, pos: { x: 0, y: 6 }, id: "L12-A7", tier: 3 },
      { turn: 11, pos: { x: 6, y: 6 }, id: "L12-G7", tier: 4 },
      { turn: 13, pos: { x: 0, y: 3 }, id: "L12-A4B", tier: 3 }
    ],
    soil: { B5: "poor", C5: "poor", D6: "poor", E5: "poor", F5: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 13,
    turns: 14,
    forecastWindow: 0,
    startPositions: starts[2],
    spawns: [
      { turn: 2, pos: { x: 3, y: 0 }, id: "L13-D1A", tier: 4 },
      { turn: 3, pos: { x: 0, y: 4 }, id: "L13-A5", tier: 3 },
      { turn: 4, pos: { x: 6, y: 2 }, id: "L13-G3", tier: 3 },
      { turn: 5, pos: { x: 1, y: 0 }, id: "L13-B1", tier: 3 },
      { turn: 7, pos: { x: 5, y: 0 }, id: "L13-F1", tier: 4 },
      { turn: 9, pos: { x: 0, y: 6 }, id: "L13-A7", tier: 4 },
      { turn: 10, pos: { x: 6, y: 6 }, id: "L13-G7", tier: 3 },
      { turn: 12, pos: { x: 3, y: 0 }, id: "L13-D1B", tier: 4 }
    ],
    soil: { A6: "poor", B6: "poor", C6: "poor", E6: "poor", F6: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 14,
    turns: 14,
    forecastWindow: 0,
    startPositions: starts[3],
    spawns: [
      { turn: 2, pos: { x: 0, y: 1 }, id: "L14-A2", tier: 3 },
      { turn: 3, pos: { x: 6, y: 5 }, id: "L14-G6", tier: 4 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L14-D1", tier: 4 },
      { turn: 5, pos: { x: 6, y: 1 }, id: "L14-G2", tier: 3 },
      { turn: 7, pos: { x: 0, y: 5 }, id: "L14-A6", tier: 4 },
      { turn: 9, pos: { x: 2, y: 0 }, id: "L14-C1", tier: 4 },
      { turn: 11, pos: { x: 4, y: 0 }, id: "L14-E1", tier: 3 },
      { turn: 13, pos: { x: 6, y: 6 }, id: "L14-G7", tier: 4 }
    ],
    soil: { B5: "poor", B6: "poor", D5: "poor", F5: "poor", F6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 15,
    turns: 15,
    forecastWindow: 0,
    startPositions: starts[0],
    spawns: [
      { turn: 2, pos: { x: 3, y: 0 }, id: "L15-D1A", tier: 4 },
      { turn: 3, pos: { x: 0, y: 3 }, id: "L15-A4", tier: 4 },
      { turn: 4, pos: { x: 6, y: 3 }, id: "L15-G4", tier: 4 },
      { turn: 5, pos: { x: 1, y: 0 }, id: "L15-B1", tier: 3 },
      { turn: 7, pos: { x: 5, y: 0 }, id: "L15-F1", tier: 4 },
      { turn: 8, pos: { x: 0, y: 6 }, id: "L15-A7", tier: 3 },
      { turn: 10, pos: { x: 6, y: 6 }, id: "L15-G7", tier: 4 },
      { turn: 12, pos: { x: 3, y: 0 }, id: "L15-D1B", tier: 4 },
      { turn: 14, pos: { x: 0, y: 0 }, id: "L15-A1", tier: 3 }
    ],
    soil: { A6: "poor", B5: "poor", C6: "poor", D6: "poor", E6: "poor", F5: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 16,
    turns: 15,
    forecastWindow: 0,
    startPositions: starts[1],
    spawns: [
      { turn: 2, pos: { x: 6, y: 3 }, id: "L16-G4A", tier: 4 },
      { turn: 3, pos: { x: 0, y: 3 }, id: "L16-A4A", tier: 4 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L16-D1", tier: 4 },
      { turn: 5, pos: { x: 6, y: 0 }, id: "L16-G1", tier: 3 },
      { turn: 6, pos: { x: 0, y: 0 }, id: "L16-A1", tier: 4 },
      { turn: 8, pos: { x: 6, y: 6 }, id: "L16-G7", tier: 4 },
      { turn: 10, pos: { x: 0, y: 6 }, id: "L16-A7", tier: 4 },
      { turn: 12, pos: { x: 6, y: 3 }, id: "L16-G4B", tier: 3 },
      { turn: 14, pos: { x: 0, y: 3 }, id: "L16-A4B", tier: 4 }
    ],
    soil: { B6: "poor", C5: "poor", C6: "poor", D5: "poor", E6: "poor", F5: "poor", F6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 17,
    turns: 15,
    forecastWindow: 0,
    startPositions: starts[2],
    spawns: [
      { turn: 2, pos: { x: 0, y: 2 }, id: "L17-A3", tier: 4 },
      { turn: 3, pos: { x: 6, y: 4 }, id: "L17-G5", tier: 4 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L17-D1A", tier: 4 },
      { turn: 5, pos: { x: 0, y: 6 }, id: "L17-A7", tier: 4 },
      { turn: 7, pos: { x: 6, y: 0 }, id: "L17-G1", tier: 4 },
      { turn: 9, pos: { x: 1, y: 0 }, id: "L17-B1", tier: 4 },
      { turn: 11, pos: { x: 5, y: 0 }, id: "L17-F1", tier: 4 },
      { turn: 13, pos: { x: 3, y: 0 }, id: "L17-D1B", tier: 4 },
      { turn: 14, pos: { x: 6, y: 6 }, id: "L17-G7", tier: 3 }
    ],
    soil: { A6: "poor", B5: "poor", B6: "poor", C5: "poor", E5: "poor", F6: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 18,
    turns: 15,
    forecastWindow: 0,
    startPositions: starts[3],
    spawns: [
      { turn: 2, pos: { x: 3, y: 0 }, id: "L18-D1A", tier: 4 },
      { turn: 3, pos: { x: 0, y: 1 }, id: "L18-A2", tier: 4 },
      { turn: 4, pos: { x: 6, y: 1 }, id: "L18-G2", tier: 4 },
      { turn: 5, pos: { x: 0, y: 5 }, id: "L18-A6", tier: 4 },
      { turn: 6, pos: { x: 6, y: 5 }, id: "L18-G6", tier: 4 },
      { turn: 8, pos: { x: 2, y: 0 }, id: "L18-C1", tier: 4 },
      { turn: 10, pos: { x: 4, y: 0 }, id: "L18-E1", tier: 4 },
      { turn: 12, pos: { x: 0, y: 6 }, id: "L18-A7", tier: 4 },
      { turn: 14, pos: { x: 6, y: 6 }, id: "L18-G7", tier: 4 }
    ],
    soil: { A6: "poor", B6: "poor", C5: "poor", D5: "poor", E5: "poor", F6: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 19,
    turns: 16,
    forecastWindow: 0,
    startPositions: starts[0],
    spawns: [
      { turn: 2, pos: { x: 0, y: 3 }, id: "L19-A4A", tier: 4 },
      { turn: 3, pos: { x: 6, y: 3 }, id: "L19-G4A", tier: 4 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L19-D1A", tier: 4 },
      { turn: 5, pos: { x: 0, y: 0 }, id: "L19-A1", tier: 4 },
      { turn: 6, pos: { x: 6, y: 0 }, id: "L19-G1", tier: 4 },
      { turn: 8, pos: { x: 1, y: 0 }, id: "L19-B1", tier: 4 },
      { turn: 10, pos: { x: 5, y: 0 }, id: "L19-F1", tier: 4 },
      { turn: 12, pos: { x: 0, y: 6 }, id: "L19-A7", tier: 4 },
      { turn: 14, pos: { x: 6, y: 6 }, id: "L19-G7", tier: 4 },
      { turn: 15, pos: { x: 3, y: 0 }, id: "L19-D1B", tier: 4 }
    ],
    soil: { A5: "poor", B6: "poor", C5: "poor", C6: "poor", E5: "poor", E6: "poor", F6: "poor", G5: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 20,
    turns: 16,
    forecastWindow: 0,
    startPositions: starts[1],
    spawns: [
      { turn: 2, pos: { x: 3, y: 0 }, id: "L20-D1A", tier: 4 },
      { turn: 3, pos: { x: 0, y: 2 }, id: "L20-A3", tier: 4 },
      { turn: 4, pos: { x: 6, y: 4 }, id: "L20-G5", tier: 4 },
      { turn: 5, pos: { x: 0, y: 6 }, id: "L20-A7A", tier: 4 },
      { turn: 6, pos: { x: 6, y: 0 }, id: "L20-G1", tier: 4 },
      { turn: 8, pos: { x: 1, y: 0 }, id: "L20-B1", tier: 4 },
      { turn: 10, pos: { x: 5, y: 0 }, id: "L20-F1", tier: 4 },
      { turn: 12, pos: { x: 6, y: 6 }, id: "L20-G7", tier: 4 },
      { turn: 14, pos: { x: 0, y: 6 }, id: "L20-A7B", tier: 4 },
      { turn: 15, pos: { x: 3, y: 0 }, id: "L20-D1B", tier: 4 }
    ],
    soil: { A6: "poor", B5: "poor", B6: "poor", D5: "poor", D6: "poor", F5: "poor", F6: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 21,
    turns: 16,
    forecastWindow: 0,
    startPositions: starts[2],
    spawns: [
      { turn: 2, pos: { x: 0, y: 4 }, id: "L21-A5", tier: 4 },
      { turn: 3, pos: { x: 6, y: 2 }, id: "L21-G3", tier: 4 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L21-D1A", tier: 4 },
      { turn: 5, pos: { x: 0, y: 0 }, id: "L21-A1", tier: 4 },
      { turn: 6, pos: { x: 6, y: 6 }, id: "L21-G7A", tier: 4 },
      { turn: 8, pos: { x: 2, y: 0 }, id: "L21-C1", tier: 4 },
      { turn: 10, pos: { x: 4, y: 0 }, id: "L21-E1", tier: 4 },
      { turn: 12, pos: { x: 0, y: 6 }, id: "L21-A7", tier: 4 },
      { turn: 14, pos: { x: 6, y: 0 }, id: "L21-G1", tier: 4 },
      { turn: 15, pos: { x: 3, y: 0 }, id: "L21-D1B", tier: 4 }
    ],
    soil: { A5: "poor", B6: "poor", C5: "poor", D5: "poor", E5: "poor", F6: "poor", G5: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 22,
    turns: 17,
    forecastWindow: 0,
    startPositions: starts[3],
    spawns: [
      { turn: 2, pos: { x: 3, y: 0 }, id: "L22-D1A", tier: 4 },
      { turn: 3, pos: { x: 0, y: 3 }, id: "L22-A4A", tier: 4 },
      { turn: 4, pos: { x: 6, y: 3 }, id: "L22-G4A", tier: 4 },
      { turn: 5, pos: { x: 0, y: 0 }, id: "L22-A1", tier: 4 },
      { turn: 6, pos: { x: 6, y: 0 }, id: "L22-G1", tier: 4 },
      { turn: 8, pos: { x: 0, y: 6 }, id: "L22-A7", tier: 4 },
      { turn: 10, pos: { x: 6, y: 6 }, id: "L22-G7", tier: 4 },
      { turn: 12, pos: { x: 1, y: 0 }, id: "L22-B1", tier: 4 },
      { turn: 14, pos: { x: 5, y: 0 }, id: "L22-F1", tier: 4 },
      { turn: 15, pos: { x: 0, y: 3 }, id: "L22-A4B", tier: 4 },
      { turn: 16, pos: { x: 6, y: 3 }, id: "L22-G4B", tier: 4 }
    ],
    soil: { A5: "poor", A6: "poor", B5: "poor", C6: "poor", E6: "poor", F5: "poor", G5: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 23,
    turns: 17,
    forecastWindow: 0,
    startPositions: starts[0],
    spawns: [
      { turn: 2, pos: { x: 0, y: 1 }, id: "L23-A2", tier: 4 },
      { turn: 3, pos: { x: 6, y: 5 }, id: "L23-G6", tier: 4 },
      { turn: 4, pos: { x: 3, y: 0 }, id: "L23-D1A", tier: 4 },
      { turn: 5, pos: { x: 6, y: 1 }, id: "L23-G2", tier: 4 },
      { turn: 6, pos: { x: 0, y: 5 }, id: "L23-A6", tier: 4 },
      { turn: 8, pos: { x: 2, y: 0 }, id: "L23-C1", tier: 4 },
      { turn: 10, pos: { x: 4, y: 0 }, id: "L23-E1", tier: 4 },
      { turn: 12, pos: { x: 0, y: 6 }, id: "L23-A7", tier: 4 },
      { turn: 13, pos: { x: 6, y: 6 }, id: "L23-G7", tier: 4 },
      { turn: 15, pos: { x: 3, y: 0 }, id: "L23-D1B", tier: 4 },
      { turn: 16, pos: { x: 0, y: 3 }, id: "L23-A4", tier: 4 }
    ],
    soil: { A6: "poor", B5: "poor", B6: "poor", C5: "poor", D6: "poor", E5: "poor", F6: "poor", G6: "poor" },
    houses: campaignHouses[4]
  },
  {
    id: 24,
    turns: 18,
    forecastWindow: 0,
    startPositions: starts[3],
    spawns: [
      { turn: 2, pos: { x: 3, y: 0 }, id: "L24-D1A", tier: 4 },
      { turn: 3, pos: { x: 0, y: 3 }, id: "L24-A4A", tier: 4 },
      { turn: 4, pos: { x: 6, y: 3 }, id: "L24-G4A", tier: 4 },
      { turn: 5, pos: { x: 0, y: 0 }, id: "L24-A1", tier: 4 },
      { turn: 6, pos: { x: 6, y: 0 }, id: "L24-G1", tier: 4 },
      { turn: 8, pos: { x: 0, y: 6 }, id: "L24-A7A", tier: 4 },
      { turn: 9, pos: { x: 6, y: 6 }, id: "L24-G7A", tier: 4 },
      { turn: 11, pos: { x: 1, y: 0 }, id: "L24-B1", tier: 4 },
      { turn: 12, pos: { x: 5, y: 0 }, id: "L24-F1", tier: 4 },
      { turn: 14, pos: { x: 3, y: 0 }, id: "L24-D1B", tier: 4 },
      { turn: 15, pos: { x: 0, y: 3 }, id: "L24-A4B", tier: 4 },
      { turn: 16, pos: { x: 6, y: 3 }, id: "L24-G4B", tier: 4 },
      { turn: 17, pos: { x: 0, y: 6 }, id: "L24-A7B", tier: 4 }
    ],
    soil: { A5: "poor", A6: "poor", B5: "poor", B6: "poor", C6: "poor", D5: "poor", E6: "poor", F5: "poor", F6: "poor", G5: "poor", G6: "poor" },
    houses: campaignHouses[4]
  }
];
