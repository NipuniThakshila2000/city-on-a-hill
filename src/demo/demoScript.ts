import { TEMPLE } from "../game/constants";
import { keyOf } from "../game/distance";
import { housesForLevel, litSquares } from "../game/light";
import type { GameState, PieceId, Pos } from "../game/types";
import { useGame } from "../store/useGame";

export type DemoActionId =
  | "showComing"
  | "establishCheckpoint"
  | "braceProtector"
  | "bindLane"
  | "completePreview";

export type DemoHighlight =
  | "lamp"
  | "houses"
  | "lit-area"
  | "pieces"
  | "forecast"
  | "checkpoint"
  | "protector-cover"
  | "binder-lock"
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
const state = () => useGame.getState();

export const demoHighlightSquares = (gameState: GameState, highlight?: DemoHighlight) => {
  switch (highlight) {
    case "lamp":
      return [toKey(TEMPLE)];
    case "houses":
      return housesForLevel(gameState).map((house) => toKey(house.pos));
    case "lit-area":
      return litSquares(gameState).map(toKey);
    case "pieces":
      return Object.values(gameState.pieces).filter((piece) => piece.alive).map((piece) => toKey(piece.pos));
    case "forecast":
      return gameState.level.spawns.filter((spawn) => spawn.turn > gameState.turn).slice(0, 2).map((spawn) => toKey(spawn.pos));
    case "checkpoint":
      return gameState.checkpoints.length > 0 ? gameState.checkpoints.map((checkpoint) => toKey(checkpoint.pos)) : ["D5", "D6"];
    case "protector-cover": {
      const p = gameState.pieces.protector.pos;
      return [p, { x: p.x, y: p.y - 1 }, { x: p.x + 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x - 1, y: p.y }]
        .filter((pos) => pos.x >= 0 && pos.x < 7 && pos.y >= 0 && pos.y < 7)
        .map(toKey);
    }
    case "binder-lock":
      return gameState.pieces.binder.locked ? [toKey(gameState.pieces.binder.pos)] : ["C4"];
    case "lit-piece":
      return Object.values(gameState.pieces).filter((piece) => piece.alive && litSquares(gameState).some((lit) => lit.x === piece.pos.x && lit.y === piece.pos.y)).map((piece) => toKey(piece.pos));
    default:
      return [];
  }
};

export const DEMO_STEPS: DemoStep[] = [
  { id: "goal-lamp", caption: "There is one Cornerstone at the centre. Keep its Lamp lit.", highlight: "lamp" },
  { id: "goal-houses", caption: "The houses need connected Light, not isolated glow.", highlight: "houses" },
  { id: "goal-not-killing", caption: "You do not win by killing everything." },
  { id: "coming", caption: "Coming shows where Darkness enters and how its route changes.", highlight: "forecast", action: "showComing" },
  { id: "coming-solid", caption: "A solid marker is a fixed entry point. Its number is the turn Darkness arrives there.", highlight: "forecast" },
  { id: "coming-dashed", caption: "A dashed marker is a predicted route. Its number is the future turn Darkness is expected to reach that square.", highlight: "forecast" },
  { id: "coming-change", caption: "You cannot change what is coming, but you can change where it goes next.", highlight: "forecast" },
  { id: "checkpoint", caption: "Servants establish Checkpoints of Light to extend the network.", highlight: "checkpoint", action: "establishCheckpoint" },
  { id: "protector", caption: "The Protector never attacks. Brace widens the ground Darkness cannot enter.", highlight: "protector-cover", action: "braceProtector" },
  { id: "binder", caption: "The Binder reshapes routes by binding a lane.", highlight: "binder-lock", action: "bindLane" },
  { id: "order", caption: "Order rises when the board holds together through foresight, restraint, and protection." },
  { id: "finish", caption: "The reward is a connected city of Light.", highlight: "houses", action: "completePreview" }
];

const movePiece = (pieceId: PieceId, pos: Pos) => {
  state().selectPiece(pieceId);
  state().moveSelected(pos);
};

export const startDemoLevel = () => {
  state().startLevel(1, "counsel");
  state().setMode("now");
};

export const runDemoAction = (action: DemoActionId) => {
  switch (action) {
    case "showComing":
      state().setMode("coming");
      return;
    case "establishCheckpoint":
      state().setMode("now");
      movePiece("protector", { x: 3, y: 4 });
      state().selectPiece("protector");
      state().establishCheckpoint();
      return;
    case "braceProtector":
      state().selectPiece("protector");
      state().braceProtector();
      return;
    case "bindLane":
      state().selectPiece("binder");
      state().lockBinder();
      return;
    case "completePreview": {
      const progress = Object.fromEntries(
        housesForLevel(state()).map((house) => [
          house.id,
          { litTurns: 2, scriptureComplete: true, stabilized: true }
        ])
      );
      useGame.setState({ phase: "won", houseProgress: progress, order: 3 });
      return;
    }
  }
};

export const runDemoToCompletion = () => {
  startDemoLevel();
  for (const step of DEMO_STEPS) {
    if (step.action) runDemoAction(step.action);
  }
};
