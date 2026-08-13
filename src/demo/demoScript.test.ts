import { describe, expect, it } from "vitest";
import { DEMO_STEPS, runDemoToCompletion } from "./demoScript";
import { useGame } from "../store/useGame";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear()
  },
  configurable: true
});

describe("demo script", () => {
  it("runs Level 1 to completion through the real game store", () => {
    runDemoToCompletion();
    expect(useGame.getState().phase).toBe("won");
  });

  it("does not reference the Defender overuse counter", () => {
    const copy = DEMO_STEPS.map((step) => step.caption ?? "").join("\n").toLowerCase();
    expect(copy).not.toContain("overuse");
    expect(copy).not.toContain("counter");
    expect(copy).not.toContain("charge");
  });
});
