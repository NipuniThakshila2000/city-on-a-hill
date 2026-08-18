import type { CombatCheck, HelperId, PieceId, ScripturePrompt, Threat, ThreatTier } from "./types";
import type { CampaignSave } from "./types";
import { attackBonus } from "./skills";

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

const PASSAGE_LINES: Record<PieceId, string[]> = {
  protector: [
    "He is my refuge and my fortress",
    "He shall give his angels charge over thee",
    "Thou shalt not be afraid for the terror by night",
    "He shall cover thee with his feathers",
    "His truth shall be thy shield and buckler",
    "Because thou hast made the Lord thy habitation"
  ],
  destroyer: [
    "Hold not thy peace O God of my praise",
    "Let his days be few and let another take his office",
    "Let them be before the Lord continually",
    "Set thou a wicked man over him",
    "Let the adversary stand at his right hand",
    "I will greatly praise the Lord with my mouth"
  ],
  binder: [
    "Whatsoever thou shalt bind on earth shall be bound in heaven",
    "Whatsoever thou shalt loose on earth shall be loosed in heaven",
    "I will give unto thee the keys of the kingdom",
    "Thou art Peter and upon this rock I will build my church",
    "The gates of hell shall not prevail against it",
    "I will give unto thee the keys"
  ],
  looser: [
    "Who hath delivered us from the power of darkness",
    "And hath translated us into the kingdom of his dear Son",
    "In whom we have redemption through his blood",
    "Giving thanks unto the Father",
    "Made us meet to be partakers of the inheritance",
    "The kingdom of his dear Son"
  ]
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

const deterministicIndex = (seed: string, length: number) =>
  [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % length;

export const scriptureSequenceLength = (darknessTier: ThreatTier, margin: number) => {
  let base = darknessTier === 4 ? 3 : darknessTier >= 2 ? 2 : 1;
  if (margin <= -3) base += 1;
  return Math.min(base, 3);
};

const createScripturePrompt = (
  attackerId: Exclude<PieceId, "protector">,
  defender: Threat,
  promptIndex: number,
  blanks: number,
  tries: number
): ScripturePrompt => {
  const lines = PASSAGE_LINES[attackerId];
  const line = lines[(deterministicIndex(`${attackerId}:${defender.id}`, lines.length) + promptIndex) % lines.length];
  const words = line.split(" ");
  const candidates = words.map((word, index) => ({ word, index })).filter(({ word }) => word.length > 3);
  const blanked = new Set<number>();
  let cursor = deterministicIndex(`${defender.id}:${promptIndex}`, Math.max(candidates.length, 1));

  while (blanked.size < blanks && blanked.size < candidates.length) {
    blanked.add(candidates[cursor % candidates.length].index);
    cursor += 2;
  }

  const answers = words.filter((_, index) => blanked.has(index));
  return {
    passage: PIECE_STATS[attackerId].passage,
    prompt: words.map((word, index) => blanked.has(index) ? "_____" : word).join(" "),
    answers: answers.map((answer) => normalize(answer)[0] ?? answer.toLowerCase()),
    blanks,
    mistakesMade: 0,
    totalTries: tries,
    triesRemaining: tries,
    hint: answers.map((answer) => `${answer[0]}...`).join(", ")
  };
};

export const createCombatCheck = (
  attackerId: Exclude<PieceId, "protector">,
  defender: Threat,
  campaign?: CampaignSave
): CombatCheck => {
  const attacker = PIECE_STATS[attackerId];
  const defenderStats = THREAT_STATS[defender.tier];
  const offense = (attacker.offense ?? 0) + (campaign ? attackBonus(campaign, attackerId) : 0);
  const difficulty = checkDifficulty(offense, defenderStats.defense);
  const sequence = Array.from({ length: scriptureSequenceLength(defender.tier, difficulty.margin) }, (_, index) =>
    createScripturePrompt(attackerId, defender, index, difficulty.blanks, difficulty.tries)
  );
  const first = sequence[0];
  const attackerName = attackerId === "looser" ? "Looser" : attackerId[0].toUpperCase() + attackerId.slice(1);

  return {
    attackerId,
    defenderThreatId: defender.id,
    header: `Attack ${offense} vs Defense ${defenderStats.defense} -> Margin ${difficulty.margin >= 0 ? "+" : ""}${difficulty.margin} -> ${difficulty.blanks} blanks, ${difficulty.tries} ${difficulty.tries === 1 ? "try" : "tries"}`,
    passage: first.passage,
    prompt: first.prompt,
    answers: first.answers,
    blanks: first.blanks,
    mistakesMade: 0,
    totalTries: first.totalTries,
    triesRemaining: first.triesRemaining,
    hint: first.hint,
    attackerName,
    defenderName: defenderStats.name,
    attackerOffense: offense,
    defenderDefense: defenderStats.defense,
    defenderAttack: defenderStats.attack,
    margin: difficulty.margin,
    sequence,
    currentPromptIndex: 0
  };
};

export const checkVerseAnswer = (input: string, answers: string[]) => {
  const words = normalize(input);
  return answers.every((answer) => words.includes(answer));
};
