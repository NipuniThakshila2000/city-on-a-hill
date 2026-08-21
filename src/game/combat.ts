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
    "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty",
    "I will say of the Lord He is my refuge and my fortress my God in him will I trust",
    "Surely he shall deliver thee from the snare of the fowler and from the noisome pestilence",
    "He shall cover thee with his feathers and under his wings shalt thou trust his truth shall be thy shield and buckler",
    "Thou shalt not be afraid for the terror by night nor for the arrow that flieth by day",
    "Nor for the pestilence that walketh in darkness nor for the destruction that wasteth at noonday",
    "A thousand shall fall at thy side and ten thousand at thy right hand but it shall not come nigh thee",
    "Only with thine eyes shalt thou behold and see the reward of the wicked",
    "Because thou hast made the Lord which is my refuge even the most High thy habitation",
    "There shall no evil befall thee neither shall any plague come nigh thy dwelling",
    "For he shall give his angels charge over thee to keep thee in all thy ways",
    "They shall bear thee up in their hands lest thou dash thy foot against a stone",
    "Thou shalt tread upon the lion and adder the young lion and the dragon shalt thou trample under feet",
    "Because he hath set his love upon me therefore will I deliver him I will set him on high because he hath known my name",
    "He shall call upon me and I will answer him I will be with him in trouble I will deliver him and honour him",
    "With long life will I satisfy him and shew him my salvation"
  ],
  destroyer: [
    "Hold not thy peace O God of my praise",
    "For the mouth of the wicked and the mouth of the deceitful are opened against me they have spoken against me with a lying tongue",
    "They compassed me about also with words of hatred and fought against me without a cause",
    "For my love they are my adversaries but I give myself unto prayer",
    "And they have rewarded me evil for good and hatred for my love",
    "Set thou a wicked man over him and let Satan stand at his right hand",
    "When he shall be judged let him be condemned and let his prayer become sin",
    "Let his days be few and let another take his office",
    "Let his children be fatherless and his wife a widow",
    "Let his children be continually vagabonds and beg let them seek their bread also out of their desolate places",
    "Let the extortioner catch all that he hath and let the strangers spoil his labour",
    "Let there be none to extend mercy unto him neither let there be any to favour his fatherless children",
    "Let his posterity be cut off and in the generation following let their name be blotted out",
    "Let the iniquity of his fathers be remembered with the Lord and let not the sin of his mother be blotted out",
    "Let them be before the Lord continually that he may cut off the memory of them from the earth",
    "Because that he remembered not to shew mercy but persecuted the poor and needy man that he might even slay the broken in heart",
    "As he loved cursing so let it come unto him as he delighted not in blessing so let it be far from him",
    "As he clothed himself with cursing like as with his garment so let it come into his bowels like water and like oil into his bones",
    "Let it be unto him as the garment which covereth him and for a girdle wherewith he is girded continually",
    "Let this be the reward of mine adversaries from the Lord and of them that speak evil against my soul",
    "But do thou for me O God the Lord for thy name's sake because thy mercy is good deliver thou me",
    "For I am poor and needy and my heart is wounded within me",
    "I am gone like the shadow when it declineth I am tossed up and down as the locust",
    "My knees are weak through fasting and my flesh faileth of fatness",
    "I became also a reproach unto them when they looked upon me they shaked their heads",
    "Help me O Lord my God O save me according to thy mercy",
    "That they may know that this is thy hand that thou Lord hast done it",
    "Let them curse but bless thou when they arise let them be ashamed but let thy servant rejoice",
    "Let mine adversaries be clothed with shame and let them cover themselves with their own confusion as with a mantle",
    "I will greatly praise the Lord with my mouth yea I will praise him among the multitude",
    "For he shall stand at the right hand of the poor to save him from those that condemn his soul"
  ],
  binder: [
    "Whatsoever thou shalt bind on earth shall be bound in heaven",
    "Whatsoever thou shalt loose on earth shall be loosed in heaven",
    "I will give unto thee the keys of the kingdom",
    "Thou art Peter and upon this rock I will build my church",
    "The gates of hell shall not prevail against it",
    "I will give unto thee the keys",
    "Whom do men say that I the Son of man am",
    "Thou art the Christ the Son of the living God",
    "Flesh and blood hath not revealed it unto thee",
    "Blessed art thou Simon Barjona",
    "Upon this rock I will build my church",
    "The gates of hell shall not prevail"
  ],
  looser: [
    "Who hath delivered us from the power of darkness",
    "And hath translated us into the kingdom of his dear Son",
    "In whom we have redemption through his blood",
    "Giving thanks unto the Father",
    "Made us meet to be partakers of the inheritance",
    "The kingdom of his dear Son",
    "Giving thanks unto the Father which hath made us meet",
    "Partakers of the inheritance of the saints in light",
    "Through his blood even the forgiveness of sins",
    "The image of the invisible God",
    "By him were all things created",
    "By him all things consist"
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
