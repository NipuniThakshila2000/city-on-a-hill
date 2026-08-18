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
export type HelpTopicId =
  | "level"
  | "save"
  | "now"
  | "coming"
  | "square"
  | "cornerstone"
  | "house"
  | "checkpoint"
  | "darkness"
  | "servant"
  | "protector"
  | "binder"
  | "looser"
  | "destroyer"
  | "bind"
  | "release"
  | "brace"
  | "anchor"
  | "free"
  | "disperse"
  | "watch"
  | "stay"
  | "scripture"
  | "establish"
  | "forecast"
  | "order"
  | "oil";
export type SkillId =
  | "protector-shield-of-faith"
  | "protector-belt-of-truth"
  | "protector-breastplate-of-righteousness"
  | "protector-feet-shod"
  | "protector-under-his-wings"
  | "protector-ten-thousand"
  | "destroyer-the-tower"
  | "destroyer-wings-as-a-bat"
  | "destroyer-seeing-from-far-off"
  | "destroyer-set-at-his-right-hand"
  | "destroyer-fourth-charge"
  | "destroyer-without-malice"
  | "binder-solid-rock"
  | "binder-long-arms"
  | "binder-whatsoever-thou-shalt-bind"
  | "binder-keys-of-the-kingdom"
  | "binder-bound-in-heaven"
  | "binder-immovable"
  | "looser-shoal"
  | "looser-swift-waters"
  | "looser-the-one-who-unravels"
  | "looser-delivered-from-darkness"
  | "looser-translated-into-the-kingdom"
  | "looser-loosed-on-earth";
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
export type DarknessBehaviour = "direct" | "avoidLight" | "targetCheckpoint" | "suppressLight";
export type Threat = {
  id: string;
  pos: Pos;
  tier: ThreatTier;
  hp: number;
  maxHp: number;
  anchoredTurns?: number;
};
export type Spawn = { turn: number; pos: Pos; id: string; tier?: ThreatTier };
export type CheckpointState =
  | "planned"
  | "targeted"
  | "preparing"
  | "establishing"
  | "active"
  | "threatened"
  | "suppressed"
  | "disconnected";
export type Checkpoint = {
  pos: Pos;
  turnsRemaining: number;
  complete: boolean;
  suppressedTurns?: number;
};
export type HouseObjective =
  | { type: "continuousLight"; turns: number }
  | { type: "scripture" }
  | { type: "noAdjacentDarkness" }
  | { type: "standard" };
export type House = {
  id: string;
  name: string;
  pos: Pos;
  objective: HouseObjective;
};
export type HouseProgress = {
  litTurns: number;
  scriptureComplete: boolean;
  stabilized: boolean;
};
export type OrderLevel = 0 | 1 | 2 | 3;
export type ActionEffect = {
  id: number;
  type: "block" | "release" | "establish" | "prepare" | "destroy" | "damage" | "heal" | "brace" | "anchor" | "disperse" | "order";
  pos: Pos;
  text?: string;
};
export type ActivityLogEntry = {
  id: number;
  turn: number;
  text: string;
  tone: "info" | "attack" | "success";
};
export type WarningNotice = {
  id: number;
  text: string;
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
  attackerName: string;
  defenderName: string;
  attackerOffense: number;
  defenderDefense: number;
  defenderAttack: number;
  margin: number;
  sequence: ScripturePrompt[];
  currentPromptIndex: number;
};
export type ScripturePrompt = {
  passage: string;
  prompt: string;
  answers: string[];
  blanks: number;
  mistakesMade: number;
  totalTries: number;
  triesRemaining: number;
  hint: string;
};
export type Level = {
  id: number;
  turns: number;
  forecastWindow: number;
  startPositions: Record<PieceId, Pos>;
  spawns: Spawn[];
  soil: Record<string, Soil>;
  houses?: House[];
};
export type CampaignSave = {
  version: 2;
  avoidableDestroys: number;
  highestUnlockedLevel: number;
  oil: number;
  purchasedSkills: SkillId[];
};
export type GameSettings = {
  contextualHelpEnabled: boolean;
};
export type SavedGame = {
  version: 1;
  savedAt: number;
  state: Pick<
    GameState,
    | "level"
    | "turn"
    | "phase"
    | "helper"
    | "pieces"
    | "moveTrails"
    | "threats"
    | "checkpoints"
    | "houseProgress"
    | "order"
    | "protectorBraced"
    | "preparedSoil"
    | "templeHits"
    | "destroyerCharges"
    | "firstTryVersePasses"
    | "looserSecondChanceUsed"
    | "avoidableDestroysAtLevelStart"
    | "campaign"
    | "mode"
    | "selectedPieceId"
    | "selectedSquare"
    | "message"
    | "activityLog"
    | "destroyerAutonomous"
  >;
};
export type OilAwardLine = {
  label: string;
  amount: number;
  prominent?: boolean;
};
export type OilAward = {
  total: number;
  lines: OilAwardLine[];
};
export type GameState = {
  level: Level;
  turn: number;
  phase: Phase;
  helper: HelperId;
  pieces: Record<PieceId, Piece>;
  moveTrails: Partial<Record<PieceId, MoveTrail>>;
  threats: Threat[];
  checkpoints: Checkpoint[];
  houseProgress: Record<string, HouseProgress>;
  order: OrderLevel;
  protectorBraced: boolean;
  preparedSoil: string[];
  templeHits: number;
  destroyerCharges: number;
  firstTryVersePasses: number;
  looserSecondChanceUsed: boolean;
  avoidableDestroysAtLevelStart: number;
  campaign: CampaignSave;
  oilAward?: OilAward;
  mode: ViewMode;
  selectedPieceId: PieceId | null;
  selectedSquare: Pos;
  actionEffect?: ActionEffect;
  combatCheck?: CombatCheck;
  warningNotice?: WarningNotice;
  contextualHelpEnabled: boolean;
  activeHelpTopic?: HelpTopicId;
  lastSavedAt?: number;
  hasSavedGame: boolean;
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
  checkpoints: Pos[];
  constructingCheckpoints: Pos[];
  lit: Pos[];
  threatenedCheckpoints: Pos[];
  anchoredThreatIds: string[];
};
export type ThreatStepResult = {
  threats: Threat[];
  templeHits: number;
  pieceHits: { pieceId: PieceId; threatId: string; damage: number }[];
  disruptedCheckpoints: Pos[];
  suppressedCheckpoints: Pos[];
};
