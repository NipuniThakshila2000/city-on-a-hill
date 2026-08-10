export type Pos = { x: number; y: number };
export type PieceId = "protector" | "destroyer" | "binder" | "looser";
export type HelperId =
  | "counsel"
  | "might"
  | "knowledge"
  | "understanding"
  | "fear"
  | "wisdom"
  | "spirit";
export type Phase = "player" | "enemy" | "upkeep" | "won" | "lost" | "failed";
export type ViewMode = "now" | "coming";
export type Soil = "good" | "poor";
export type Piece = {
  id: PieceId;
  pos: Pos;
  alive: boolean;
  moved: boolean;
  acted: boolean;
  locked?: boolean;
};
export type Threat = { id: string; pos: Pos };
export type Spawn = { turn: number; pos: Pos; id: string };
export type Cornerstone = { pos: Pos; turnsRemaining: number; complete: boolean };
export type ActionEffect = {
  id: number;
  type: "block" | "release" | "build" | "prepare" | "destroy";
  pos: Pos;
};
export type Level = {
  id: number;
  turns: number;
  forecastWindow: number;
  startPositions: Record<PieceId, Pos>;
  spawns: Spawn[];
  soil: Record<string, Soil>;
};
export type CampaignSave = {
  version: 1;
  avoidableDestroys: number;
  highestUnlockedLevel: number;
};
export type GameState = {
  level: Level;
  turn: number;
  phase: Phase;
  helper: HelperId;
  pieces: Record<PieceId, Piece>;
  threats: Threat[];
  cornerstones: Cornerstone[];
  preparedSoil: string[];
  templeHits: number;
  destroyerCharges: number;
  avoidableDestroysAtLevelStart: number;
  campaign: CampaignSave;
  mode: ViewMode;
  selectedPieceId: PieceId | null;
  selectedSquare: Pos;
  actionEffect?: ActionEffect;
  message: string;
  destroyerAutonomous: boolean;
};
export type ThreatBoard = {
  threats: Threat[];
  locked: Pos[];
  protector: Pos;
  protectorCoversDiagonals: boolean;
  looser?: Pos;
  cornerstones: Pos[];
};
export type ThreatStepResult = {
  threats: Threat[];
  templeHits: number;
  looserKilled: boolean;
};
