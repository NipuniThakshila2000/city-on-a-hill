import { create } from "zustand";
import { HOUSES, TEMPLE } from "../game/constants";
import { isAvoidableDestroy } from "../game/destroyer";
import { keyOf, samePos } from "../game/distance";
import { canBuild, canRelease, legalMoves, lockedSquares, occupiedByPiece } from "../game/rules";
import { endTurn } from "../game/turnEngine";
import type { GameState, HelperId, Level, PieceId, Pos } from "../game/types";
import { levels } from "../levels";
import { loadCampaign, saveCampaign } from "./persist";

let actionEffectId = 0;

type GameStore = GameState & {
  startLevel: (levelId: number, helper: HelperId) => void;
  selectPiece: (pieceId: PieceId | null) => void;
  selectSquare: (pos: Pos) => void;
  moveSelected: (pos: Pos) => void;
  lockBinder: () => void;
  unlockBinder: () => void;
  releaseLock: () => void;
  buildHere: () => void;
  destroyThreat: (threatId: string) => void;
  endPlayerTurn: () => void;
  toggleMode: () => void;
};

const nextActionEffect = (type: NonNullable<GameState["actionEffect"]>["type"], pos: Pos) => ({
  id: actionEffectId += 1,
  type,
  pos
});

const clearActionEffectSoon = (
  effectId: number,
  set: (partial: Partial<GameState>) => void,
  get: () => GameStore
) => {
  globalThis.setTimeout(() => {
    if (get().actionEffect?.id === effectId) set({ actionEffect: undefined });
  }, 720);
};

const helpers: HelperId[] = ["counsel", "might", "knowledge", "understanding", "fear", "wisdom", "spirit"];

const blankCampaign = loadCampaign();

const makeState = (level: Level, helper: HelperId, campaign = loadCampaign()): GameState => ({
  level,
  turn: 1,
  phase: "player",
  helper,
  pieces: {
    protector: { id: "protector", pos: level.startPositions.protector, alive: true, moved: false, acted: false },
    destroyer: { id: "destroyer", pos: level.startPositions.destroyer, alive: true, moved: false, acted: false },
    binder: { id: "binder", pos: level.startPositions.binder, alive: true, moved: false, acted: false, locked: false },
    looser: { id: "looser", pos: level.startPositions.looser, alive: true, moved: false, acted: false }
  },
  threats: [],
  cornerstones: [],
  preparedSoil: [],
  templeHits: 0,
  destroyerCharges: 3,
  avoidableDestroysAtLevelStart: campaign.avoidableDestroys,
  campaign,
  mode: "now",
  selectedPieceId: null,
  selectedSquare: TEMPLE,
  message: "Keep the lamp lit. Get light to the houses.",
  destroyerAutonomous: campaign.avoidableDestroys >= 3
});

export const useGame = create<GameStore>((set, get) => ({
  ...makeState(levels[0], "counsel", blankCampaign),
  startLevel: (levelId, helper) => {
    const level = levels.find((l) => l.id === levelId) ?? levels[0];
    set(makeState(level, helper));
  },
  selectPiece: (pieceId) => set({ selectedPieceId: pieceId }),
  selectSquare: (pos) => set({ selectedSquare: pos }),
  moveSelected: (pos) => {
    const state = get();
    const id = state.selectedPieceId;
    if (!id || !legalMoves(state, id).some((p) => samePos(p, pos))) return;
    set({
      pieces: { ...state.pieces, [id]: { ...state.pieces[id], pos, moved: true } },
      selectedSquare: pos,
      message: `${state.pieces[id].id} moved to ${keyOf(pos)}.`
    });
  },
  lockBinder: () => {
    const state = get();
    const binder = state.pieces.binder;
    if (state.phase !== "player" || binder.acted || binder.locked) return;
    const actionEffect = nextActionEffect("block", binder.pos);
    set({
      pieces: { ...state.pieces, binder: { ...binder, locked: true, acted: true } },
      actionEffect,
      message: `B${keyOf(binder.pos)} locked.`
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  unlockBinder: () => {
    const state = get();
    const binder = state.pieces.binder;
    if (state.phase !== "player" || binder.acted || !binder.locked) return;
    const actionEffect = nextActionEffect("release", binder.pos);
    set({
      pieces: { ...state.pieces, binder: { ...binder, locked: false, acted: true } },
      actionEffect,
      message: `B${keyOf(binder.pos)} unlocked.`
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  releaseLock: () => {
    const state = get();
    const looser = state.pieces.looser;
    if (!canRelease(state, looser)) return;
    const locked = lockedSquares(state)[0];
    const actionEffect = nextActionEffect("release", locked);
    set({
      pieces: {
        ...state.pieces,
        binder: samePos(state.pieces.binder.pos, locked)
          ? { ...state.pieces.binder, locked: false }
          : state.pieces.binder,
        looser: { ...looser, acted: true }
      },
      actionEffect,
      message: `Lock at ${keyOf(locked)} released.`
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  buildHere: () => {
    const state = get();
    const id = state.selectedPieceId;
    if (!id) return;
    const piece = state.pieces[id];
    if (!canBuild(state, piece)) return;
    const key = keyOf(piece.pos);
    const soil = state.preparedSoil.includes(key) ? "good" : state.level.soil[key] ?? "good";
    if (soil === "poor") {
      const actionEffect = nextActionEffect("prepare", piece.pos);
      set({
        preparedSoil: [...state.preparedSoil, key],
        pieces: { ...state.pieces, [id]: { ...piece, acted: true } },
        actionEffect,
        message: `${key} was poor soil. It is prepared now.`
      });
      clearActionEffectSoon(actionEffect.id, set, get);
      return;
    }
    const actionEffect = nextActionEffect("build", piece.pos);
    set({
      cornerstones: [...state.cornerstones, { pos: piece.pos, turnsRemaining: 2, complete: false }],
      pieces: { ...state.pieces, [id]: { ...piece, acted: true } },
      actionEffect,
      message: `Cornerstone planted at ${key}.`
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  destroyThreat: (threatId) => {
    const state = get();
    const destroyer = state.pieces.destroyer;
    const target = state.threats.find((t) => t.id === threatId);
    if (!target || state.phase !== "player" || destroyer.acted || state.destroyerCharges <= 0) return;
    const avoidable = isAvoidableDestroy(target);
    const campaign = {
      ...state.campaign,
      avoidableDestroys: state.campaign.avoidableDestroys + (avoidable ? 1 : 0)
    };
    saveCampaign(campaign);
    const actionEffect = nextActionEffect("destroy", target.pos);
    set({
      campaign,
      threats: state.threats.filter((t) => t.id !== threatId),
      destroyerCharges: state.destroyerCharges - 1,
      pieces: { ...state.pieces, destroyer: { ...destroyer, acted: true } },
      actionEffect,
      message: `Threat ${target.id} destroyed.`
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  endPlayerTurn: () => {
    const next = endTurn(get());
    let campaign = next.campaign;
    if (next.phase === "won") {
      campaign = {
        ...campaign,
        highestUnlockedLevel: Math.max(campaign.highestUnlockedLevel, Math.min(next.level.id + 1, levels.length))
      };
      saveCampaign(campaign);
    }
    set({ ...next, campaign, selectedPieceId: null });
  },
  toggleMode: () => set({ mode: get().mode === "now" ? "coming" : "now" })
}));

export const availableHelpers = helpers;

export const canOccupyForBuild = (state: GameState, pos: Pos) =>
  !samePos(pos, TEMPLE) &&
  !HOUSES.some((h) => samePos(h, pos)) &&
  !occupiedByPiece(state, pos);
