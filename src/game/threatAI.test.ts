import { describe, expect, it } from "vitest";
import { stepThreats } from "./threatAI";
import type { ThreatBoard } from "./types";

const base = (overrides: Partial<ThreatBoard>): ThreatBoard => ({
  threats: [{ id: "a", pos: { x: 0, y: 0 } }],
  locked: [],
  protector: { x: 6, y: 6 },
  protectorCoversDiagonals: false,
  cornerstones: [],
  ...overrides
});

describe("stepThreats", () => {
  it("moves toward the temple by the shortest route", () => {
    const result = stepThreats(base({ threats: [{ id: "a", pos: { x: 0, y: 0 } }] }));
    expect(result.threats[0].pos).toEqual({ x: 1, y: 1 });
  });

  it("refuses to enter a locked square", () => {
    const result = stepThreats(
      base({ threats: [{ id: "a", pos: { x: 0, y: 3 } }], locked: [{ x: 1, y: 3 }] })
    );
    expect(result.threats[0].pos).not.toEqual({ x: 1, y: 3 });
  });

  it("refuses to enter a Protector-covered square", () => {
    const result = stepThreats(
      base({ threats: [{ id: "a", pos: { x: 3, y: 1 } }], protector: { x: 3, y: 2 } })
    );
    expect(result.threats[0].pos).not.toEqual({ x: 3, y: 2 });
  });

  it("attacks the Looser instead of moving through him", () => {
    const result = stepThreats(base({ threats: [{ id: "a", pos: { x: 0, y: 3 } }], looser: { x: 1, y: 2 } }));
    expect(result.looserKilled).toBe(true);
    expect(result.threats[0].pos).toEqual({ x: 0, y: 3 });
  });

  it("attacks the temple when adjacent, then is removed", () => {
    const result = stepThreats(base({ threats: [{ id: "a", pos: { x: 3, y: 2 } }] }));
    expect(result.templeHits).toBe(1);
    expect(result.threats).toHaveLength(0);
  });

  it("breaks ties in N, NE, E, SE, S, SW, W, NW order", () => {
    const result = stepThreats(base({ threats: [{ id: "a", pos: { x: 0, y: 4 } }] }));
    expect(result.threats[0].pos).toEqual({ x: 1, y: 3 });
  });

  it("is deterministic for identical input", () => {
    const board = base({
      threats: [
        { id: "b", pos: { x: 6, y: 1 } },
        { id: "a", pos: { x: 0, y: 3 } }
      ],
      locked: [{ x: 1, y: 3 }],
      protector: { x: 4, y: 4 }
    });
    const first = stepThreats(board);
    for (let i = 0; i < 100; i += 1) {
      expect(stepThreats(board)).toEqual(first);
    }
  });
});
