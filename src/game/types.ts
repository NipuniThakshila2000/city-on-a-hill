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
  hp: number;
  maxHp: number;
  moved: boolean;
  acted: boolean;
  locked?: boolean;
};
export type MoveTrail = { pieceId: PieceId; from: Pos; to: Pos; turn: number };
export type ThreatTier = 1 | 2 | 3 | 4;
export type Threat = { id: string; pos: Pos; tier: ThreatTier; hp: number; maxHp: number };
export type Spawn = { turn: number; pos: Pos; id: string; tier?: ThreatTier };
export type Cornerstone = { pos: Pos; turnsRemaining: number; complete: boolean };
export type ActionEffect = {
  id: number;
  type: "block" | "release" | "build" | "prepare" | "destroy" | "damage" | "heal";
  pos: Pos;
  text?: string;
};
export type ActivityLogEntry = {
  id: number;
  turn: number;
  text: string;
  tone: "info" | "attack" | "success";
};
export type CombatCheck = {
  attackerId: Exclude<PieceId, "protector">;
  defenderThreatId: string;
  header: string;
  passage: string;
  prompt: string;
  answers: string[];
  blanks: number;
  mistakesMade: number;
  totalTries: number;
  triesRemaining: number;
  hint: string;
  announcement?: string;
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
  moveTrails: Partial<Record<PieceId, MoveTrail>>;
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
  combatCheck?: CombatCheck;
  message: string;
  activityLog: ActivityLogEntry[];
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
  pieceHits: { pieceId: PieceId; threatId: string; damage: number }[];
};
