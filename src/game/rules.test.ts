import { describe, expect, it } from "vitest";
import { level01 } from "../levels/level01";
import { PIECE_STATS } from "./combat";
import { canEstablishCheckpoint } from "./rules";
import type { CampaignSave, GameState, HelperId } from "./types";

const campaign: CampaignSave = {
  version: 2,
  avoidableDestroys: 0,
  highestUnlockedLevel: 1,
  oil: 0,
  purchasedSkills: []
};

const stateAtD6 = (overrides: Partial<GameState> = {}): GameState => {
  const helper: HelperId = "counsel";
  const state: GameState = {
    level: level01,
    turn: 7,
    phase: "player",
    helper,
    pieces: {
      protector: {
        id: "protector",
        pos: { x: 3, y: 5 },
        alive: true,
        hp: PIECE_STATS.protector.maxHp,
        maxHp: PIECE_STATS.protector.maxHp,
        moved: false,
        acted: false
      },
      destroyer: {
        id: "destroyer",
        pos: { x: 3, y: 2 },
        alive: true,
        hp: PIECE_STATS.destroyer.maxHp,
        maxHp: PIECE_STATS.destroyer.maxHp,
        moved: false,
        acted: false
      },
      binder: {
        id: "binder",
        pos: { x: 2, y: 3 },
        alive: true,
        hp: PIECE_STATS.binder.maxHp,
        maxHp: PIECE_STATS.binder.maxHp,
        moved: false,
        acted: false,
        locked: false
      },
      looser: {
        id: "looser",
        pos: { x: 4, y: 3 },
        alive: true,
        hp: PIECE_STATS.looser.maxHp,
        maxHp: PIECE_STATS.looser.maxHp,
        moved: false,
        acted: false
      }
    },
    moveTrails: {},
    threats: [],
    checkpoints: [],
    houseProgress: {
      peace: { litTurns: 0, scriptureComplete: false, stabilized: false },
      wisdom: { litTurns: 0, scriptureComplete: false, stabilized: false },
      mercy: { litTurns: 0, scriptureComplete: false, stabilized: false }
    },
    order: 0,
    protectorBraced: false,
    preparedSoil: ["D6"],
    templeHits: 0,
    destroyerCharges: 3,
    firstTryVersePasses: 0,
    looserSecondChanceUsed: false,
    avoidableDestroysAtLevelStart: 0,
    campaign,
    mode: "now",
    selectedPieceId: "protector",
    selectedSquare: { x: 3, y: 5 },
    message: "",
    activityLog: [],
    destroyerAutonomous: false
  };
  return { ...state, ...overrides };
};

describe("canEstablishCheckpoint", () => {
  it("allows a ready piece to establish a checkpoint on D6 even though D6 is lit", () => {
    const state = stateAtD6();
    expect(canEstablishCheckpoint(state, state.pieces.protector)).toBe(true);
  });

  it("disallows establishing after the selected piece has moved this turn", () => {
    const state = stateAtD6({
      pieces: {
        ...stateAtD6().pieces,
        protector: { ...stateAtD6().pieces.protector, moved: true }
      }
    });
    expect(canEstablishCheckpoint(state, state.pieces.protector)).toBe(false);
  });

  it("disallows establishing after the selected piece has acted this turn", () => {
    const state = stateAtD6({
      pieces: {
        ...stateAtD6().pieces,
        protector: { ...stateAtD6().pieces.protector, acted: true }
      }
    });
    expect(canEstablishCheckpoint(state, state.pieces.protector)).toBe(false);
  });
});
