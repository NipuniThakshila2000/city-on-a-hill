import { create } from "zustand";
import { HOUSES, TEMPLE } from "../game/constants";
import { PIECE_STATS, THREAT_STATS } from "../game/combat";
import { isAvoidableDestroy } from "../game/destroyer";
import { keyOf, samePos } from "../game/distance";
import { canBuild, canRelease, legalMoves, lockedSquares, occupiedByPiece } from "../game/rules";
import { endTurn } from "../game/turnEngine";
import type { ActivityLogEntry, GameState, HelperId, Level, PieceId, Pos, ViewMode } from "../game/types";
import { levels } from "../levels";
import { loadCampaign, saveCampaign } from "./persist";

let actionEffectId = 0;
let activityLogId = 0;

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
  setMode: (mode: ViewMode) => void;
};

const pieceName = (id: PieceId) => id === "looser" ? "Looser" : id[0].toUpperCase() + id.slice(1);

const nextActionEffect = (type: NonNullable<GameState["actionEffect"]>["type"], pos: Pos, text?: string) => ({
  id: actionEffectId += 1,
  type,
  pos,
  text
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

const logEntry = (turn: number, text: string, tone: ActivityLogEntry["tone"] = "info") => ({
  id: activityLogId += 1,
  turn,
  text,
  tone
});

const withLog = (state: GameState, text: string, tone: ActivityLogEntry["tone"] = "info") => ({
  message: text,
  activityLog: [logEntry(state.turn, text, tone), ...state.activityLog].slice(0, 10)
});

const makeState = (level: Level, helper: HelperId, campaign = loadCampaign()): GameState => ({
  level,
  turn: 1,
  phase: "player",
  helper,
  pieces: {
    protector: { id: "protector", pos: level.startPositions.protector, alive: true, hp: PIECE_STATS.protector.maxHp, maxHp: PIECE_STATS.protector.maxHp, moved: false, acted: false },
    destroyer: { id: "destroyer", pos: level.startPositions.destroyer, alive: true, hp: PIECE_STATS.destroyer.maxHp, maxHp: PIECE_STATS.destroyer.maxHp, moved: false, acted: false },
    binder: { id: "binder", pos: level.startPositions.binder, alive: true, hp: PIECE_STATS.binder.maxHp, maxHp: PIECE_STATS.binder.maxHp, moved: false, acted: false, locked: false },
    looser: { id: "looser", pos: level.startPositions.looser, alive: true, hp: PIECE_STATS.looser.maxHp, maxHp: PIECE_STATS.looser.maxHp, moved: false, acted: false }
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
  activityLog: [logEntry(1, "Keep the lamp lit. Get light to the houses.")],
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
      ...withLog(state, `${pieceName(state.pieces[id].id)} moved to ${keyOf(pos)}.`)
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
      ...withLog(state, `Binder locked ${keyOf(binder.pos)} to hold an attack lane.`)
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
      ...withLog(state, `Binder unlocked ${keyOf(binder.pos)}.`)
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
      ...withLog(state, `Looser released the lock at ${keyOf(locked)}.`)
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
        ...withLog(state, `${key} was poor soil. It is prepared now.`)
      });
      clearActionEffectSoon(actionEffect.id, set, get);
      return;
    }
    const actionEffect = nextActionEffect("build", piece.pos);
    set({
      cornerstones: [...state.cornerstones, { pos: piece.pos, turnsRemaining: 2, complete: false }],
      pieces: { ...state.pieces, [id]: { ...piece, acted: true } },
      actionEffect,
      ...withLog(state, `Cornerstone planted at ${key}.`)
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  destroyThreat: (threatId) => {
    const state = get();
    const destroyer = state.pieces.destroyer;
    const target = state.threats.find((t) => t.id === threatId);
    if (!target || state.phase !== "player" || destroyer.acted || state.destroyerCharges <= 0) return;
    const avoidable = isAvoidableDestroy(target);
    const stats = THREAT_STATS[target.tier];
    const damage = PIECE_STATS.destroyer.offense ?? 0;
    const hp = target.hp - damage;
    const removed = hp <= 0;
    const campaign = {
      ...state.campaign,
      avoidableDestroys: state.campaign.avoidableDestroys + (avoidable ? 1 : 0)
    };
    saveCampaign(campaign);
    const actionEffect = nextActionEffect(removed ? "destroy" : "damage", target.pos, `-${damage}`);
    set({
      campaign,
      threats: removed
        ? state.threats.filter((t) => t.id !== threatId)
        : state.threats.map((t) => t.id === threatId ? { ...t, hp } : t),
      destroyerCharges: state.destroyerCharges - 1,
      pieces: { ...state.pieces, destroyer: { ...destroyer, acted: true } },
      actionEffect,
      ...withLog(
        state,
        removed
          ? `Destroyer dealt ${damage} damage and removed ${stats.name} ${target.id} at ${keyOf(target.pos)}.`
          : `Destroyer dealt ${damage} damage to ${stats.name} ${target.id} at ${keyOf(target.pos)}.`,
        "attack"
      )
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  endPlayerTurn: () => {
    const state = get();
    const next = endTurn(state);
    let campaign = next.campaign;
    const log = [...state.activityLog];
    const add = (text: string, tone: ActivityLogEntry["tone"] = "info") => {
      log.unshift(logEntry(state.turn, text, tone));
    };

    if (next.destroyerCharges < state.destroyerCharges && state.destroyerAutonomous) {
      add("Destroyer acted automatically before your order.", "attack");
    }
    const newHits = next.templeHits - state.templeHits;
    if (newHits > 0) {
      add(`Attack reached the lamp: ${newHits} hit${newHits === 1 ? "" : "s"} landed this turn.`, "attack");
    }
    for (const id of Object.keys(state.pieces) as PieceId[]) {
      const before = state.pieces[id];
      const after = next.pieces[id];
      if (after.hp < before.hp) {
        add(`Attack struck ${pieceName(id)}: ${before.hp - after.hp} damage.`, "attack");
      }
      if (before.alive && !after.alive) {
        add(`${pieceName(id)} is down.`, "attack");
      }
      if (after.hp > before.hp) {
        add(`${pieceName(id)} healed 1 HP on a lit square.`, "success");
      }
    }
    const spawned = next.threats.filter((threat) => !state.threats.some((old) => old.id === threat.id));
    for (const threat of spawned) {
      add(`Threat ${threat.id} entered at ${keyOf(threat.pos)}.`, "attack");
    }
    if (next.phase === "won") {
      campaign = {
        ...campaign,
        highestUnlockedLevel: Math.max(campaign.highestUnlockedLevel, Math.min(next.level.id + 1, levels.length))
      };
      saveCampaign(campaign);
      add("YESOD and MALKUT are aligned. The level is complete.", "success");
    }
    set({ ...next, campaign, selectedPieceId: null, activityLog: log.slice(0, 10) });
  },
  toggleMode: () => set({ mode: get().mode === "now" ? "coming" : "now" }),
  setMode: (mode) => set({ mode })
}));

export const availableHelpers = helpers;

export const canOccupyForBuild = (state: GameState, pos: Pos) =>
  !samePos(pos, TEMPLE) &&
  !HOUSES.some((h) => samePos(h, pos)) &&
  !occupiedByPiece(state, pos);
