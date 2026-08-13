import { HOUSES, TEMPLE } from "../game/constants";
import { keyOf, samePos } from "../game/distance";
import { isLit, litSquares } from "../game/light";
import { canBuild, legalMoves } from "../game/rules";
import type { GameState, PieceId, Pos } from "../game/types";
import { useGame } from "../store/useGame";

export type DemoActionId =
  | "moveToBuild"
  | "prepareSoil"
  | "plantCornerstone"
  | "finishCornerstone"
  | "moveProtector"
  | "lockBinder"
  | "tryCrossLock"
  | "startCombat"
  | "passCombat"
  | "finishLevel";

export type DemoHighlight =
  | "lamp"
  | "houses"
  | "lit-area"
  | "gap"
  | "pieces"
  | "forecast"
  | "build-square"
  | "protector-cover"
  | "binder-lock"
  | "verse-math"
  | "lit-piece";

export type DemoStep = {
  id: string;
  caption?: string;
  highlight?: DemoHighlight;
  action?: DemoActionId;
  holdBefore?: number;
  actionTime?: number;
  holdAfter?: number;
  typeAnswer?: boolean;
};

const toKey = (pos: Pos) => keyOf(pos);

export const demoHighlightSquares = (state: GameState, highlight?: DemoHighlight) => {
  switch (highlight) {
    case "lamp":
      return [toKey(TEMPLE)];
    case "houses":
      return HOUSES.map(toKey);
    case "lit-area":
      return litSquares(state).map(toKey);
    case "gap":
      return ["C6", "E6"];
    case "pieces":
      return Object.values(state.pieces).filter((piece) => piece.alive).map((piece) => toKey(piece.pos));
    case "forecast":
      return state.level.spawns.filter((spawn) => spawn.turn > state.turn).slice(0, 1).map((spawn) => toKey(spawn.pos));
    case "build-square":
      return ["D6"];
    case "protector-cover": {
      const p = state.pieces.protector.pos;
      return [p, { x: p.x, y: p.y - 1 }, { x: p.x + 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x - 1, y: p.y }]
        .filter((pos) => pos.x >= 0 && pos.x < 7 && pos.y >= 0 && pos.y < 7)
        .map(toKey);
    }
    case "binder-lock":
      return state.pieces.binder.locked ? [toKey(state.pieces.binder.pos)] : ["C4"];
    case "lit-piece":
      return Object.values(state.pieces).filter((piece) => piece.alive && isLit(piece.pos, state)).map((piece) => toKey(piece.pos));
    default:
      return [];
  }
};

export const DEMO_STEPS: DemoStep[] = [
  {
    id: "goal-lamp",
    caption: "Two things. Keep the lamp lit — it's in the middle of the board. If darkness hits it three times, you lose.",
    highlight: "lamp"
  },
  {
    id: "goal-houses",
    caption: "And get light down to the three houses at the bottom.",
    highlight: "houses"
  },
  { id: "goal-not-killing", caption: "You do not win by killing everything." },
  {
    id: "board-grid",
    caption: "A 7×7 grid. Your temple sits dead centre. The three houses are at the bottom, in the dark."
  },
  {
    id: "board-light",
    caption: "Light spreads two squares from the temple. That's not far enough to reach the houses — so you have to build.",
    highlight: "lit-area"
  },
  {
    id: "turn-pieces",
    caption: "Each of your four pieces gets one move and one action per turn. Move first, then act — or just act.",
    highlight: "pieces"
  },
  {
    id: "turn-end",
    caption: "When you're done, hit End turn. Then the darkness moves. Then it's your turn again."
  },
  { id: "forecast-boards", caption: "Two boards sit side by side. The left one is Now. The right one is Coming." },
  {
    id: "forecast-marker",
    caption: "It shows where darkness will appear, two turns before it does.",
    highlight: "forecast"
  },
  {
    id: "forecast-pressure",
    caption: "So you're never surprised. You just never have enough pieces to cover everything you can see."
  },
  {
    id: "build-move",
    action: "moveToBuild",
    actionTime: 1100,
    holdAfter: 450
  },
  {
    id: "build-stand",
    caption: "Stand a piece on an empty square and choose Build.",
    highlight: "build-square",
    action: "prepareSoil",
    actionTime: 1200
  },
  {
    id: "build-poor",
    caption: "If the soil is bad, you have to spend a turn preparing it first.",
    highlight: "build-square"
  },
  {
    id: "build-plant",
    caption: "Then plant. Then wait two turns while it finishes.",
    highlight: "build-square",
    action: "plantCornerstone",
    actionTime: 1100
  },
  {
    id: "build-complete",
    caption: "Once it's done, that square lights two squares around it. Build in the right place and the light reaches the houses.",
    highlight: "houses",
    action: "finishCornerstone",
    actionTime: 1800,
    holdAfter: 3800
  },
  {
    id: "build-early",
    caption: "Build early, while the board is quiet. A half-built cornerstone gets destroyed if darkness walks onto it.",
    highlight: "build-square"
  },
  {
    id: "protector-move",
    action: "moveProtector",
    actionTime: 900,
    holdAfter: 450
  },
  {
    id: "protector-cover",
    caption: "The Protector can't attack at all. He protects his square and the four around it.",
    highlight: "protector-cover"
  },
  {
    id: "protector-path",
    caption: "Darkness can't walk into those squares.",
    highlight: "protector-cover"
  },
  {
    id: "binder-lock",
    action: "lockBinder",
    actionTime: 900,
    holdAfter: 450
  },
  {
    id: "binder-caption",
    caption: "The Binder locks the square he's on. Nothing crosses it.",
    highlight: "binder-lock"
  },
  {
    id: "binder-own-piece",
    caption: "Including your own pieces. He's stuck there until he unlocks.",
    highlight: "binder-lock",
    action: "tryCrossLock",
    actionTime: 900
  },
  {
    id: "combat-open",
    action: "startCombat",
    actionTime: 900,
    holdAfter: 450
  },
  {
    id: "combat-verse",
    caption: "When you attack darkness — or it attacks you — a verse appears with words missing.",
    holdAfter: 5000
  },
  {
    id: "combat-fill",
    caption: "Fill in the blanks. Get it right and your attack lands. Get it wrong and you take the hit instead.",
    typeAnswer: true,
    action: "passCombat",
    actionTime: 4200,
    holdAfter: 2600
  },
  { id: "combat-tries", caption: "You get up to three tries, with hints after each miss.", holdAfter: 3200 },
  {
    id: "combat-math",
    caption: "How many blanks you face depends on how strong your piece is against that enemy.",
    highlight: "verse-math"
  },
  {
    id: "combat-passages",
    caption: "Each piece has its own passage. Only four passages in the whole game. You'll know them by the end.",
    holdAfter: 3200
  },
  {
    id: "healing-one",
    caption: "Any piece standing in the light heals each turn.",
    highlight: "lit-piece"
  },
  {
    id: "healing-two",
    caption: "That's why light matters twice — it wins you the level, and it keeps your pieces alive.",
    highlight: "houses"
  },
  {
    id: "finish-silent",
    action: "finishLevel",
    actionTime: 5200,
    holdAfter: 600
  },
  {
    id: "finish-caption",
    caption: "Keep the lamp lit. Carry the light down to the houses.",
    highlight: "houses",
    holdAfter: 6000
  }
];

const assertDemo: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(`[Demo] ${message}`);
};

const state = () => useGame.getState();

const movePiece = (pieceId: PieceId, pos: Pos) => {
  const before = state().pieces[pieceId].pos;
  assertDemo(legalMoves(state(), pieceId).some((move) => samePos(move, pos)), `${pieceId} cannot move from ${keyOf(before)} to ${keyOf(pos)}.`);
  state().selectPiece(pieceId);
  state().moveSelected(pos);
  assertDemo(samePos(state().pieces[pieceId].pos, pos), `${pieceId} did not move to ${keyOf(pos)}.`);
};

export const startDemoLevel = () => {
  state().startLevel(1, "counsel");
  state().setMode("now");
};

export const runDemoAction = (action: DemoActionId) => {
  switch (action) {
    case "moveToBuild":
      movePiece("protector", { x: 3, y: 5 });
      state().endPlayerTurn();
      assertDemo(state().turn === 2, "Expected turn 2 after the build move.");
      return;
    case "prepareSoil":
      state().selectPiece("protector");
      assertDemo(canBuild(state(), state().pieces.protector), "Protector cannot prepare D6.");
      state().buildHere();
      assertDemo(state().preparedSoil.includes("D6"), "D6 was not prepared.");
      state().endPlayerTurn();
      assertDemo(state().turn === 3, "Expected turn 3 after preparing soil.");
      return;
    case "plantCornerstone":
      state().selectPiece("protector");
      assertDemo(canBuild(state(), state().pieces.protector), "Protector cannot plant at D6.");
      state().buildHere();
      assertDemo(state().cornerstones.some((cornerstone) => samePos(cornerstone.pos, { x: 3, y: 5 }) && !cornerstone.complete), "D6 cornerstone was not planted.");
      return;
    case "finishCornerstone":
      state().endPlayerTurn();
      state().endPlayerTurn();
      assertDemo(state().cornerstones.some((cornerstone) => samePos(cornerstone.pos, { x: 3, y: 5 }) && cornerstone.complete), "D6 cornerstone did not complete.");
      assertDemo(HOUSES.every((house) => isLit(house, state())), "The houses are not lit after the cornerstone completes.");
      return;
    case "moveProtector":
      movePiece("protector", { x: 2, y: 5 });
      return;
    case "lockBinder":
      state().selectPiece("binder");
      state().lockBinder();
      assertDemo(state().pieces.binder.locked, "Binder did not lock.");
      return;
    case "tryCrossLock": {
      const looserBefore = state().pieces.looser.pos;
      state().selectPiece("looser");
      state().moveSelected(state().pieces.binder.pos);
      assertDemo(samePos(state().pieces.looser.pos, looserBefore), "Looser crossed the Binder lock.");
      return;
    }
    case "startCombat": {
      const target = state().threats.find((threat) => threat.id === "L1-D1") ?? state().threats[0];
      assertDemo(target, "No threat is available for the combat demo.");
      state().selectPiece("destroyer");
      state().destroyThreat(target.id);
      assertDemo(state().combatCheck, "Verse check did not open.");
      return;
    }
    case "passCombat": {
      const check = state().combatCheck;
      assertDemo(check, "No verse check is open.");
      state().submitVerseGuess(check.answers.join(" "));
      assertDemo(!state().combatCheck, "Verse check did not close after the correct answer.");
      return;
    }
    case "finishLevel":
      for (let guard = 0; guard < 8 && state().phase === "player"; guard += 1) state().endPlayerTurn();
      assertDemo(state().phase === "won", `Demo ended with phase ${state().phase}, not won.`);
      return;
  }
};

export const runDemoToCompletion = () => {
  startDemoLevel();
  for (const step of DEMO_STEPS) {
    if (step.action) runDemoAction(step.action);
  }
  assertDemo(state().phase === "won", "Demo did not complete Level 1.");
};
