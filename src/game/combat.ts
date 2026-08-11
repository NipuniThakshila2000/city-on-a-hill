import type { HelperId, PieceId, Threat, ThreatTier } from "./types";

export type PieceStat = {
  maxHp: number;
  defense: number;
  passage: string;
  actionLabel?: "Attack" | "Binding" | "Loosing";
  offense?: number;
};

export type ThreatStat = {
  name: string;
  maxHp: number;
  attack: number;
  defense: number;
};

export const PIECE_STATS: Record<PieceId, PieceStat> = {
  protector: { maxHp: 12, defense: 6, passage: "Psalm 91" },
  destroyer: { maxHp: 4, offense: 8, defense: 1, passage: "Psalm 109", actionLabel: "Attack" },
  binder: { maxHp: 10, offense: 5, defense: 5, passage: "Matthew 16:19", actionLabel: "Binding" },
  looser: { maxHp: 3, offense: 6, defense: 2, passage: "Colossians 1:13", actionLabel: "Loosing" }
};

export const THREAT_STATS: Record<ThreatTier, ThreatStat> = {
  1: { name: "Shade", maxHp: 3, attack: 2, defense: 1 },
  2: { name: "Shroud", maxHp: 5, attack: 4, defense: 3 },
  3: { name: "Depth", maxHp: 8, attack: 6, defense: 5 },
  4: { name: "Abyss", maxHp: 12, attack: 9, defense: 7 }
};

export const CHECK_RULES = [
  { min: 4, blanks: 1, tries: 3 },
  { min: 1, blanks: 2, tries: 3 },
  { min: -2, blanks: 3, tries: 2 },
  { min: Number.NEGATIVE_INFINITY, blanks: 4, tries: 1 }
];

export const checkDifficulty = (offense: number, defense: number) => {
  const margin = offense - defense;
  const rule = CHECK_RULES.find((entry) => margin >= entry.min) ?? CHECK_RULES[CHECK_RULES.length - 1];
  return { margin, blanks: rule.blanks, tries: rule.tries };
};

export const makeThreat = (spawn: { id: string; pos: Threat["pos"]; tier?: ThreatTier }): Threat => {
  const tier = spawn.tier ?? 1;
  const stats = THREAT_STATS[tier];
  return { id: spawn.id, pos: spawn.pos, tier, hp: stats.maxHp, maxHp: stats.maxHp };
};

export const helperName = (helper: HelperId) => helper[0].toUpperCase() + helper.slice(1);
