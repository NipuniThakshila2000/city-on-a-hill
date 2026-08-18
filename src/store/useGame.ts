import { create } from "zustand";
import { HOUSES, TEMPLE } from "../game/constants";
import { checkVerseAnswer, createCombatCheck, PIECE_STATS, THREAT_STATS } from "../game/combat";
import { isAvoidableDestroy } from "../game/destroyer";
import { addPos, dist, inBounds, keyOf, samePos } from "../game/distance";
import { housesForLevel, isHouseLit, isLit } from "../game/light";
import { canEstablishCheckpoint, canRelease, isBlockedForPiece, legalMoves, lockedSquares, occupiedByPiece } from "../game/rules";
import { attackBonus, destroyerChargeLimit, hasSkill, maxHpBonus, skillAvailable, skillById } from "../game/skills";
import { endTurn } from "../game/turnEngine";
import type { ActivityLogEntry, GameState, HelperId, HelpTopicId, HouseProgress, Level, OilAward, PieceId, Pos, SavedGame, SkillId, ViewMode } from "../game/types";
import { levels } from "../levels";
import { hasSavedGame, loadCampaign, loadSavedGame, loadSettings, saveCampaign, saveGame, saveSettings } from "./persist";

let actionEffectId = 0;
let activityLogId = 0;
let warningNoticeId = 0;

type GameStore = GameState & {
  startLevel: (levelId: number, helper: HelperId) => void;
  purchaseSkill: (skillId: SkillId) => void;
  selectPiece: (pieceId: PieceId | null) => void;
  selectSquare: (pos: Pos) => void;
  moveSelected: (pos: Pos) => void;
  lockBinder: () => void;
  unlockBinder: () => void;
  releaseLock: () => void;
  braceProtector: () => void;
  anchorThreat: () => void;
  freeCheckpoint: () => void;
  disperseThreat: () => void;
  watchThreat: () => void;
  stayThyHand: () => void;
  tendHouseScripture: () => void;
  establishCheckpoint: () => void;
  destroyThreat: (threatId: string) => void;
  submitVerseGuess: (guess: string) => void;
  cancelVerseCheck: () => void;
  clearWarningNotice: () => void;
  openHelp: (topic: HelpTopicId) => void;
  closeHelp: () => void;
  toggleContextualHelp: () => void;
  saveCurrentGame: () => void;
  loadCurrentGame: () => void;
  endPlayerTurn: () => void;
  toggleMode: () => void;
  setMode: (mode: ViewMode) => void;
};

const helpers: HelperId[] = ["counsel", "might", "knowledge", "understanding", "fear", "wisdom", "spirit"];
const blankCampaign = loadCampaign();
const initialSettings = loadSettings();

const pieceName = (id: PieceId) => id === "looser" ? "Looser" : id[0].toUpperCase() + id.slice(1);

const pieceMaxHp = (pieceId: PieceId, campaign: GameState["campaign"]) =>
  PIECE_STATS[pieceId].maxHp + maxHpBonus(campaign, pieceId);

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

const logEntry = (turn: number, text: string, tone: ActivityLogEntry["tone"] = "info") => ({
  id: activityLogId += 1,
  turn,
  text,
  tone
});

const warningNotice = (text: string) => ({
  id: warningNoticeId += 1,
  text
});

const withLog = (state: GameState, text: string, tone: ActivityLogEntry["tone"] = "info") => ({
  message: text,
  activityLog: [logEntry(state.turn, text, tone), ...state.activityLog].slice(0, 10)
});

const initialHouseProgress = (level: Level): Record<string, HouseProgress> =>
  Object.fromEntries(
    housesForLevel({ level }).map((house) => [
      house.id,
      { litTurns: 0, scriptureComplete: false, stabilized: false }
    ])
  );

const makeState = (level: Level, helper: HelperId, campaign = loadCampaign()): GameState => ({
  level,
  turn: 1,
  phase: "player",
  helper,
  pieces: {
    protector: { id: "protector", pos: level.startPositions.protector, alive: true, hp: pieceMaxHp("protector", campaign), maxHp: pieceMaxHp("protector", campaign), moved: false, acted: false },
    destroyer: { id: "destroyer", pos: level.startPositions.destroyer, alive: true, hp: pieceMaxHp("destroyer", campaign), maxHp: pieceMaxHp("destroyer", campaign), moved: false, acted: false },
    binder: { id: "binder", pos: level.startPositions.binder, alive: true, hp: pieceMaxHp("binder", campaign), maxHp: pieceMaxHp("binder", campaign), moved: false, acted: false, locked: false },
    looser: { id: "looser", pos: level.startPositions.looser, alive: true, hp: pieceMaxHp("looser", campaign), maxHp: pieceMaxHp("looser", campaign), moved: false, acted: false }
  },
  moveTrails: {},
  threats: [],
  checkpoints: [],
  houseProgress: initialHouseProgress(level),
  order: 0,
  protectorBraced: false,
  preparedSoil: [],
  templeHits: 0,
  destroyerCharges: destroyerChargeLimit(campaign),
  firstTryVersePasses: 0,
  looserSecondChanceUsed: false,
  avoidableDestroysAtLevelStart: campaign.avoidableDestroys,
  campaign,
  oilAward: undefined,
  mode: "now",
  selectedPieceId: null,
  selectedSquare: TEMPLE,
  contextualHelpEnabled: initialSettings.contextualHelpEnabled,
  activeHelpTopic: undefined,
  lastSavedAt: loadSavedGame()?.savedAt,
  hasSavedGame: hasSavedGame(),
  message: "There is one Cornerstone. Carry its Light to the houses.",
  activityLog: [logEntry(1, "There is one Cornerstone. Carry its Light to the houses.")],
  destroyerAutonomous: campaign.avoidableDestroys >= 3
});

const savedStateFor = (state: GameState): SavedGame["state"] => ({
  level: state.level,
  turn: state.turn,
  phase: state.phase,
  helper: state.helper,
  pieces: state.pieces,
  moveTrails: state.moveTrails,
  threats: state.threats,
  checkpoints: state.checkpoints,
  houseProgress: state.houseProgress,
  order: state.order,
  protectorBraced: state.protectorBraced,
  preparedSoil: state.preparedSoil,
  templeHits: state.templeHits,
  destroyerCharges: state.destroyerCharges,
  firstTryVersePasses: state.firstTryVersePasses,
  looserSecondChanceUsed: state.looserSecondChanceUsed,
  avoidableDestroysAtLevelStart: state.avoidableDestroysAtLevelStart,
  campaign: state.campaign,
  mode: state.mode,
  selectedPieceId: state.selectedPieceId,
  selectedSquare: state.selectedSquare,
  message: state.message,
  activityLog: state.activityLog,
  destroyerAutonomous: state.destroyerAutonomous
});

const oilAwardFor = (state: GameState, avoidableDelta: number): OilAward => {
  const housesLit = housesForLevel(state).filter((house) => state.houseProgress[house.id]?.stabilized || isHouseLit(house, state)).length;
  const piecesAlive = Object.values(state.pieces).filter((piece) => piece.alive).length;
  const lines = [
    { label: "Level completed", amount: state.phase === "won" ? 10 : 0 },
    { label: "Houses held in Light", amount: housesLit * 4 },
    { label: "Lamp never hit", amount: state.phase === "won" && state.templeHits === 0 ? 6 : 0 },
    { label: "Pieces still alive", amount: state.phase === "won" ? piecesAlive * 2 : 0 },
    { label: "First-try verse checks", amount: state.firstTryVersePasses * 3, prominent: true },
    {
      label: "Without Malice",
      amount: state.phase === "won" && avoidableDelta === 0 && hasSkill(state.campaign, "destroyer-without-malice") ? 10 : 0
    }
  ];
  return { lines, total: lines.reduce((sum, line) => sum + line.amount, 0) };
};

const destroyerBlockedMessage = (state: GameState) => {
  if (state.pieces.destroyer.acted) return "Destroyer already acted this turn.";
  if (state.destroyerCharges <= 0) return "Destroyer has no charges left.";
  return "Destroyer cannot attack right now.";
};

const resolveDestroyerAttack = (
  state: GameState,
  set: (partial: Partial<GameState>) => void,
  get: () => GameStore,
  threatId: string,
  passed: boolean,
  warning?: string
) => {
  const destroyer = state.pieces.destroyer;
  const target = state.threats.find((t) => t.id === threatId);
  if (!target) {
    set({ combatCheck: undefined });
    return;
  }

  const avoidable = isAvoidableDestroy(target);
  const campaign = {
    ...state.campaign,
    avoidableDestroys: state.campaign.avoidableDestroys + (avoidable ? 1 : 0)
  };
  saveCampaign(campaign);
  const stats = THREAT_STATS[target.tier];

  if (!passed) {
    const counter = stats.attack;
    const hp = Math.max(0, destroyer.hp - counter);
    const actionEffect = nextActionEffect("damage", destroyer.pos, `-${counter}`);
    const warningText = `${warning ? `${warning} ` : ""}${stats.name} countered for ${counter} damage.`;
    set({
      campaign,
      combatCheck: undefined,
      destroyerCharges: state.destroyerCharges - 1,
      pieces: {
        ...state.pieces,
        destroyer: { ...destroyer, hp, alive: hp > 0, acted: true }
      },
      actionEffect,
      warningNotice: warningNotice(warningText),
      ...withLog(state, warningText, "attack")
    });
    clearActionEffectSoon(actionEffect.id, set, get);
    return;
  }

  const damage = (PIECE_STATS.destroyer.offense ?? 0) + attackBonus(state.campaign, "destroyer");
  const hp = target.hp - damage;
  const removed = hp <= 0;
  const actionEffect = nextActionEffect(removed ? "destroy" : "damage", target.pos, `-${damage}`);
  const sequenceMistakes = state.combatCheck?.sequence.reduce((sum, prompt) => sum + prompt.mistakesMade, 0) ?? state.combatCheck?.mistakesMade ?? 0;
  set({
    campaign,
    combatCheck: undefined,
    firstTryVersePasses: state.firstTryVersePasses + (sequenceMistakes === 0 ? 1 : 0),
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
};

export const useGame = create<GameStore>((set, get) => ({
  ...makeState(levels[0], "counsel", blankCampaign),
  startLevel: (levelId, helper) => {
    const current = get();
    const level = levels.find((l) => l.id === levelId) ?? levels[0];
    set({
      ...makeState(level, helper),
      contextualHelpEnabled: current.contextualHelpEnabled,
      activeHelpTopic: undefined
    });
  },
  purchaseSkill: (skillId) => {
    const state = get();
    const skill = skillById(skillId);
    if (!skill || !skillAvailable(state.campaign, skill)) return;
    if (!globalThis.confirm(`Spend ${skill.cost} Oil on ${skill.name}? This choice is permanent.`)) return;
    const campaign = {
      ...state.campaign,
      oil: state.campaign.oil - skill.cost,
      purchasedSkills: [...state.campaign.purchasedSkills, skill.id]
    };
    saveCampaign(campaign);
    set({
      campaign,
      pieces: Object.fromEntries(
        Object.entries(state.pieces).map(([id, piece]) => {
          const pieceId = id as PieceId;
          const maxHp = pieceMaxHp(pieceId, campaign);
          return [id, { ...piece, maxHp, hp: Math.min(maxHp, piece.hp + Math.max(0, maxHp - piece.maxHp)) }];
        })
      ) as GameState["pieces"],
      destroyerCharges: Math.max(state.destroyerCharges, destroyerChargeLimit(campaign)),
      ...withLog(state, `${skill.name} purchased for ${pieceName(skill.piece)}.`, "success")
    });
  },
  selectPiece: (pieceId) => set({ selectedPieceId: pieceId }),
  selectSquare: (pos) => set({ selectedSquare: pos }),
  moveSelected: (pos) => {
    const state = get();
    const id = state.selectedPieceId;
    if (!id || !legalMoves(state, id).some((p) => samePos(p, pos))) return;
    const from = state.pieces[id].pos;
    set({
      pieces: { ...state.pieces, [id]: { ...state.pieces[id], pos, moved: true } },
      moveTrails: { ...state.moveTrails, [id]: { pieceId: id, from, to: pos, turn: state.turn } },
      selectedSquare: pos,
      ...withLog(state, `${pieceName(state.pieces[id].id)} moved to ${keyOf(pos)}.`)
    });
  },
  lockBinder: () => {
    const state = get();
    const binder = state.pieces.binder;
    if (state.selectedPieceId !== "binder") {
      set(withLog(state, "Select Binder before using Lock."));
      return;
    }
    if (state.phase !== "player" || binder.acted || binder.locked) {
      set(withLog(state, binder.locked ? "Binder is already locked." : "Binder cannot lock again this turn."));
      return;
    }
    const lockPos = hasSkill(state.campaign, "binder-long-arms") && dist(state.selectedSquare, binder.pos) <= 1
      ? state.selectedSquare
      : binder.pos;
    const actionEffect = nextActionEffect("block", lockPos);
    set({
      pieces: { ...state.pieces, binder: { ...binder, pos: lockPos, locked: true, acted: true } },
      actionEffect,
      ...withLog(state, `Binder locked ${keyOf(lockPos)} to hold an attack lane.`)
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  unlockBinder: () => {
    const state = get();
    const binder = state.pieces.binder;
    if (state.selectedPieceId !== "binder") {
      set(withLog(state, "Select Binder before using Unlock."));
      return;
    }
    if (state.phase !== "player" || (binder.acted && !hasSkill(state.campaign, "binder-keys-of-the-kingdom")) || !binder.locked) {
      set(withLog(state, !binder.locked ? "Binder has no lock to release." : "Binder cannot unlock again this turn."));
      return;
    }
    const actionEffect = nextActionEffect("release", binder.pos);
    set({
      pieces: { ...state.pieces, binder: { ...binder, locked: false, acted: hasSkill(state.campaign, "binder-keys-of-the-kingdom") ? binder.acted : true } },
      actionEffect,
      ...withLog(state, `Binder unlocked ${keyOf(binder.pos)}.`)
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  releaseLock: () => {
    const state = get();
    const looser = state.pieces.looser;
    if (state.selectedPieceId !== "looser") {
      set(withLog(state, "Select Looser before using Release."));
      return;
    }
    if (!canRelease(state, looser)) {
      set(withLog(state, "Looser must stand next to a lock to release it."));
      return;
    }
    const locked = lockedSquares(state)[0];
    const actionEffect = nextActionEffect("release", locked);
    const unravelTarget = hasSkill(state.campaign, "looser-the-one-who-unravels")
      ? state.threats.find((threat) => dist(threat.pos, looser.pos) <= 1)
      : undefined;
    set({
      threats: unravelTarget
        ? state.threats
            .map((threat) => threat.id === unravelTarget.id ? { ...threat, hp: threat.hp - 2 } : threat)
            .filter((threat) => threat.hp > 0)
        : state.threats,
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
  braceProtector: () => {
    const state = get();
    const protector = state.pieces.protector;
    if (state.selectedPieceId !== "protector" || state.phase !== "player" || protector.acted) {
      set(withLog(state, "Protector must be ready to Brace."));
      return;
    }
    const actionEffect = nextActionEffect("brace", protector.pos);
    set({
      protectorBraced: true,
      pieces: { ...state.pieces, protector: { ...protector, moved: true, acted: true } },
      actionEffect,
      ...withLog(state, `Protector braced at ${keyOf(protector.pos)}. Guard widens for the next enemy phase.`)
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  anchorThreat: () => {
    const state = get();
    const binder = state.pieces.binder;
    const target = state.threats.find((threat) => samePos(threat.pos, state.selectedSquare) && dist(threat.pos, binder.pos) <= 1);
    if (state.selectedPieceId !== "binder" || state.phase !== "player" || binder.acted || !target) {
      set(withLog(state, "Binder must stand adjacent to a selected Darkness to Anchor it."));
      return;
    }
    const actionEffect = nextActionEffect("anchor", target.pos);
    set({
      threats: state.threats.map((threat) => threat.id === target.id ? { ...threat, anchoredTurns: 1 } : threat),
      pieces: { ...state.pieces, binder: { ...binder, acted: true } },
      actionEffect,
      order: Math.min(3, state.order + 1) as GameState["order"],
      ...withLog(state, `Binder anchored ${target.id} at ${keyOf(target.pos)}. The route holds for one enemy phase.`, "success")
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  freeCheckpoint: () => {
    const state = get();
    const looser = state.pieces.looser;
    const target = state.checkpoints.find((checkpoint) => checkpoint.suppressedTurns && dist(checkpoint.pos, looser.pos) <= 1);
    if (state.selectedPieceId !== "looser" || state.phase !== "player" || looser.acted || !target) {
      set(withLog(state, "Looser must be adjacent to a suppressed Checkpoint to Free it."));
      return;
    }
    const actionEffect = nextActionEffect("release", target.pos);
    set({
      checkpoints: state.checkpoints.map((checkpoint) => samePos(checkpoint.pos, target.pos) ? { ...checkpoint, suppressedTurns: undefined } : checkpoint),
      pieces: { ...state.pieces, looser: { ...looser, acted: true } },
      actionEffect,
      order: Math.min(3, state.order + 1) as GameState["order"],
      ...withLog(state, `Looser freed the Checkpoint at ${keyOf(target.pos)}. Light holds.`, "success")
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  disperseThreat: () => {
    const state = get();
    const looser = state.pieces.looser;
    const target = state.threats.find((threat) => samePos(threat.pos, state.selectedSquare) && dist(threat.pos, looser.pos) <= 1);
    if (state.selectedPieceId !== "looser" || state.phase !== "player" || looser.acted || !target) {
      set(withLog(state, "Looser must be adjacent to a selected Darkness to Disperse it."));
      return;
    }
    const options = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ]
      .map((dir) => addPos(target.pos, dir))
      .filter((pos) => inBounds(pos) && !isBlockedForPiece(state, pos, "looser") && !samePos(pos, looser.pos))
      .sort((a, b) => dist(b, looser.pos) - dist(a, looser.pos) || a.y - b.y || a.x - b.x);
    const destination = options[0];
    if (!destination) {
      set(withLog(state, "There is no legal square to disperse that Darkness into."));
      return;
    }
    const actionEffect = nextActionEffect("disperse", destination);
    set({
      threats: state.threats.map((threat) => threat.id === target.id ? { ...threat, pos: destination } : threat),
      pieces: { ...state.pieces, looser: { ...looser, acted: true } },
      actionEffect,
      order: Math.min(3, state.order + 1) as GameState["order"],
      ...withLog(state, `Looser dispersed ${target.id} to ${keyOf(destination)}. The future route changed.`, "success")
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  watchThreat: () => {
    const state = get();
    const destroyer = state.pieces.destroyer;
    const target = state.threats.find((threat) => samePos(threat.pos, state.selectedSquare));
    if (state.selectedPieceId !== "destroyer" || state.phase !== "player" || destroyer.acted || !target) {
      set(withLog(state, "Select Destroyer and a Darkness to Watch."));
      return;
    }
    set({
      pieces: { ...state.pieces, destroyer: { ...destroyer, acted: true } },
      order: Math.min(3, state.order + 1) as GameState["order"],
      ...withLog(state, `Destroyer watched ${target.id}. The hand stayed ready.`, "success")
    });
  },
  stayThyHand: () => {
    const state = get();
    const destroyer = state.pieces.destroyer;
    if (state.selectedPieceId !== "destroyer" || state.phase !== "player" || destroyer.acted) {
      set(withLog(state, "Destroyer cannot stay his hand right now."));
      return;
    }
    set({
      pieces: { ...state.pieces, destroyer: { ...destroyer, acted: true } },
      order: Math.min(3, state.order + 1) as GameState["order"],
      ...withLog(state, "Destroyer stayed his hand. The way holds.", "success")
    });
  },
  tendHouseScripture: () => {
    const state = get();
    const id = state.selectedPieceId;
    if (!id) return;
    const piece = state.pieces[id];
    const house = housesForLevel(state).find((candidate) =>
      candidate.objective.type === "scripture" &&
      isHouseLit(candidate, state) &&
      dist(candidate.pos, piece.pos) <= 1
    );
    if (!house || piece.acted || state.phase !== "player") {
      set(withLog(state, "A ready servant must stand beside a lit Scripture house."));
      return;
    }
    set({
      houseProgress: {
        ...state.houseProgress,
        [house.id]: { ...(state.houseProgress[house.id] ?? { litTurns: 0, scriptureComplete: false, stabilized: false }), scriptureComplete: true, stabilized: true }
      },
      pieces: { ...state.pieces, [id]: { ...piece, acted: true } },
      order: Math.min(3, state.order + 1) as GameState["order"],
      ...withLog(state, `${house.name} received Scripture and stabilized.`, "success")
    });
  },
  establishCheckpoint: () => {
    const state = get();
    const id = state.selectedPieceId;
    if (!id) {
      set(withLog(state, "Select a servant before establishing a Checkpoint."));
      return;
    }
    const piece = state.pieces[id];
    if (!canEstablishCheckpoint(state, piece)) {
      set(withLog(state, piece.moved ? "A servant that moved cannot establish a Checkpoint until next turn." : "Establish Checkpoint is only available on an open, safe square."));
      return;
    }
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
    const actionEffect = nextActionEffect("establish", piece.pos);
    set({
      checkpoints: [...state.checkpoints, { pos: piece.pos, turnsRemaining: 1, complete: false }],
      pieces: { ...state.pieces, [id]: { ...piece, acted: true } },
      actionEffect,
      ...withLog(state, `Checkpoint of Light established at ${key}. It will stabilize during Upkeep.`)
    });
    clearActionEffectSoon(actionEffect.id, set, get);
  },
  destroyThreat: (threatId) => {
    const state = get();
    const destroyer = state.pieces.destroyer;
    const target = state.threats.find((t) => t.id === threatId);
    if (!target) return;
    if (state.selectedPieceId !== "destroyer") {
      set(withLog(state, "Select Destroyer before attacking a darkness tile."));
      return;
    }
    if (state.phase !== "player" || destroyer.acted || state.destroyerCharges <= 0) {
      set(withLog(state, destroyerBlockedMessage(state)));
      return;
    }
    set({ combatCheck: createCombatCheck("destroyer", target, state.campaign) });
  },
  submitVerseGuess: (guess) => {
    const state = get();
    const check = state.combatCheck;
    if (!check) return;
    const prompt = check.sequence[check.currentPromptIndex];
    if (checkVerseAnswer(guess, prompt.answers)) {
      const nextPromptIndex = check.currentPromptIndex + 1;
      if (nextPromptIndex >= check.sequence.length) {
        resolveDestroyerAttack(state, set, get, check.defenderThreatId, true);
        return;
      }
      const nextPrompt = check.sequence[nextPromptIndex];
      set({
        combatCheck: {
          ...check,
          currentPromptIndex: nextPromptIndex,
          passage: nextPrompt.passage,
          prompt: nextPrompt.prompt,
          answers: nextPrompt.answers,
          blanks: nextPrompt.blanks,
          mistakesMade: nextPrompt.mistakesMade,
          totalTries: nextPrompt.totalTries,
          triesRemaining: nextPrompt.triesRemaining,
          hint: nextPrompt.hint,
          announcement: "The word holds. Continue the sequence."
        },
        ...withLog(state, "The word holds. The scripture sequence continues.", "success")
      });
      return;
    }
    if (prompt.triesRemaining > 1) {
      const triesRemaining = prompt.triesRemaining - 1;
      const mistakesMade = prompt.mistakesMade + 1;
      const nextSequence = check.sequence.map((entry, index) =>
        index === check.currentPromptIndex ? { ...entry, mistakesMade, triesRemaining } : entry
      );
      const announcement = `${triesRemaining === 1 ? "One attempt remains" : "The word is not yet set"}. Use the next hint and try again.`;
      set({
        combatCheck: { ...check, sequence: nextSequence, mistakesMade, triesRemaining, announcement },
        warningNotice: warningNotice(announcement),
        ...withLog(state, `${announcement} ${check.passage} hint: ${check.hint}.`)
      });
      return;
    }
    const finalMistake = prompt.mistakesMade + 1;
    const warning = `The word did not hold. Counter-blow received.`;
    resolveDestroyerAttack(state, set, get, check.defenderThreatId, false, warning);
  },
  cancelVerseCheck: () => set({ combatCheck: undefined }),
  clearWarningNotice: () => set({ warningNotice: undefined }),
  openHelp: (topic) => {
    const state = get();
    if (!state.contextualHelpEnabled) return;
    set({ activeHelpTopic: topic });
  },
  closeHelp: () => set({ activeHelpTopic: undefined }),
  toggleContextualHelp: () => {
    const state = get();
    const contextualHelpEnabled = !state.contextualHelpEnabled;
    saveSettings({ contextualHelpEnabled });
    set({
      contextualHelpEnabled,
      activeHelpTopic: contextualHelpEnabled ? state.activeHelpTopic : undefined,
      ...withLog(state, contextualHelpEnabled ? "Beginner help icons are on." : "Beginner help icons are off.")
    });
  },
  saveCurrentGame: () => {
    const state = get();
    const savedAt = Date.now();
    saveGame({ version: 1, savedAt, state: savedStateFor(state) });
    set({
      lastSavedAt: savedAt,
      hasSavedGame: true,
      ...withLog(state, `Game saved on turn ${state.turn}.`, "success")
    });
  },
  loadCurrentGame: () => {
    const state = get();
    const saved = loadSavedGame();
    if (!saved) {
      set(withLog(state, "No saved game found."));
      return;
    }
    set({
      ...saved.state,
      contextualHelpEnabled: state.contextualHelpEnabled,
      activeHelpTopic: undefined,
      lastSavedAt: saved.savedAt,
      hasSavedGame: true,
      actionEffect: undefined,
      combatCheck: undefined,
      warningNotice: undefined,
      oilAward: undefined,
      message: `Loaded saved game from turn ${saved.state.turn}.`
    });
  },
  endPlayerTurn: () => {
    const state = get();
    if (state.combatCheck) return;
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
      add("YESOD and MALKUT are aligned. The level is complete.", "success");
    }
    if (["won", "lost", "failed"].includes(next.phase)) {
      const award = oilAwardFor({ ...next, campaign }, campaign.avoidableDestroys - state.avoidableDestroysAtLevelStart);
      campaign = { ...campaign, oil: campaign.oil + award.total };
      saveCampaign(campaign);
      set({ ...next, campaign, oilAward: award, selectedPieceId: null, activityLog: log.slice(0, 10), combatCheck: undefined });
      return;
    }
    saveCampaign(campaign);
    set({ ...next, campaign, selectedPieceId: null, activityLog: log.slice(0, 10), combatCheck: undefined });
  },
  toggleMode: () => set({ mode: get().mode === "now" ? "coming" : "now" }),
  setMode: (mode) => set({ mode })
}));

export const availableHelpers = helpers;

export const canOccupyForCheckpoint = (state: GameState, pos: Pos) =>
  !samePos(pos, TEMPLE) &&
  !HOUSES.some((h) => samePos(h, pos)) &&
  !occupiedByPiece(state, pos);
