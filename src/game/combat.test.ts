import { describe, expect, it } from "vitest";
import { checkDifficulty, checkVerseAnswer, createCombatCheck, makeThreat } from "./combat";

describe("combat checks", () => {
  it("uses margin to set blanks and tries", () => {
    expect(checkDifficulty(8, 1)).toMatchObject({ blanks: 1, tries: 3 });
    expect(checkDifficulty(5, 3)).toMatchObject({ blanks: 2, tries: 3 });
    expect(checkDifficulty(5, 7)).toMatchObject({ blanks: 3, tries: 2 });
    expect(checkDifficulty(2, 7)).toMatchObject({ blanks: 4, tries: 1 });
  });

  it("creates a deterministic verse check for an attack", () => {
    const threat = makeThreat({ id: "L6-F1", pos: { x: 5, y: 0 }, tier: 4 });
    const first = createCombatCheck("destroyer", threat);
    const second = createCombatCheck("destroyer", threat);
    expect(second).toEqual(first);
    expect(first.header).toContain("Attack 8 vs Defense 7");
    expect(first.passage).toBe("Psalm 109");
  });

  it("accepts answers containing all blanked words without punctuation sensitivity", () => {
    const threat = makeThreat({ id: "L1-A4", pos: { x: 0, y: 3 }, tier: 1 });
    const check = createCombatCheck("destroyer", threat);
    expect(checkVerseAnswer(check.answers.join(", "), check.answers)).toBe(true);
  });
});
