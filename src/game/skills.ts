import type { CampaignSave, PieceId, SkillId } from "./types";

export type SkillDefinition = {
  id: SkillId;
  piece: PieceId;
  tier: 1 | 2 | 3;
  fork: "a" | "b";
  name: string;
  passage: string;
  cost: number;
  effect: string;
};

export const SKILL_COSTS = {
  1: 8,
  2: 16,
  3: 30
} as const;

export const SKILLS: SkillDefinition[] = [
  { id: "protector-shield-of-faith", piece: "protector", tier: 1, fork: "a", name: "Shield of Faith", passage: "Psalm 91", cost: 8, effect: "+3 max HP" },
  { id: "protector-belt-of-truth", piece: "protector", tier: 1, fork: "b", name: "Belt of Truth", passage: "Psalm 91", cost: 8, effect: "Verse checks where he defends get one fewer blank" },
  { id: "protector-breastplate-of-righteousness", piece: "protector", tier: 2, fork: "a", name: "Breastplate of Righteousness", passage: "Psalm 91", cost: 16, effect: "Takes 2 less damage from every failed check" },
  { id: "protector-feet-shod", piece: "protector", tier: 2, fork: "b", name: "Feet Shod with the Gospel of Peace", passage: "Psalm 91", cost: 16, effect: "Moves 2 squares instead of 1" },
  { id: "protector-under-his-wings", piece: "protector", tier: 3, fork: "a", name: "Under His Wings", passage: "Psalm 91", cost: 30, effect: "His cover extends to all 8 adjacent squares, not 4" },
  { id: "protector-ten-thousand", piece: "protector", tier: 3, fork: "b", name: "Ten Thousand at Thy Right Hand", passage: "Psalm 91", cost: 30, effect: "Any threat that ends its turn beside him loses 1 HP. He still cannot attack." },
  { id: "destroyer-the-tower", piece: "destroyer", tier: 1, fork: "a", name: "The Tower", passage: "Psalm 109", cost: 8, effect: "Reveals one extra turn of forecast on the Coming board" },
  { id: "destroyer-wings-as-a-bat", piece: "destroyer", tier: 1, fork: "b", name: "Wings as a Bat", passage: "Psalm 109", cost: 8, effect: "+2 max HP" },
  { id: "destroyer-seeing-from-far-off", piece: "destroyer", tier: 2, fork: "a", name: "Seeing From Far Off", passage: "Psalm 109", cost: 16, effect: "Shows the exact tile each threat will move to next turn" },
  { id: "destroyer-set-at-his-right-hand", piece: "destroyer", tier: 2, fork: "b", name: "Set at His Right Hand", passage: "Psalm 109", cost: 16, effect: "+3 attack" },
  { id: "destroyer-fourth-charge", piece: "destroyer", tier: 3, fork: "a", name: "Fourth Charge", passage: "Psalm 109", cost: 30, effect: "4 strikes per level instead of 3" },
  { id: "destroyer-without-malice", piece: "destroyer", tier: 3, fork: "b", name: "Without Malice", passage: "Psalm 109", cost: 30, effect: "If he ends a level with 0 avoidable strikes, refund 10 Oil" },
  { id: "binder-solid-rock", piece: "binder", tier: 1, fork: "a", name: "Solid Rock", passage: "Matthew 16:19", cost: 8, effect: "+4 max HP" },
  { id: "binder-long-arms", piece: "binder", tier: 1, fork: "b", name: "Long Arms", passage: "Matthew 16:19", cost: 8, effect: "Can lock an adjacent square instead of only his own" },
  { id: "binder-whatsoever-thou-shalt-bind", piece: "binder", tier: 2, fork: "a", name: "Whatsoever Thou Shalt Bind", passage: "Matthew 16:19", cost: 16, effect: "Locked squares also block movement diagonally through their corners" },
  { id: "binder-keys-of-the-kingdom", piece: "binder", tier: 2, fork: "b", name: "Keys of the Kingdom", passage: "Matthew 16:19", cost: 16, effect: "Unlocking is free - it no longer costs his action" },
  { id: "binder-bound-in-heaven", piece: "binder", tier: 3, fork: "a", name: "Bound in Heaven", passage: "Matthew 16:19", cost: 30, effect: "One lock per level persists after he leaves the square" },
  { id: "binder-immovable", piece: "binder", tier: 3, fork: "b", name: "Immovable", passage: "Matthew 16:19", cost: 30, effect: "While locked, he takes no damage at all" },
  { id: "looser-shoal", piece: "looser", tier: 1, fork: "a", name: "Shoal", passage: "Colossians 1:13", cost: 8, effect: "+2 max HP" },
  { id: "looser-swift-waters", piece: "looser", tier: 1, fork: "b", name: "Swift Waters", passage: "Colossians 1:13", cost: 8, effect: "Moves 4 squares instead of 3" },
  { id: "looser-the-one-who-unravels", piece: "looser", tier: 2, fork: "a", name: "The One Who Unravels", passage: "Colossians 1:13", cost: 16, effect: "Release also removes 2 HP from an adjacent threat" },
  { id: "looser-delivered-from-darkness", piece: "looser", tier: 2, fork: "b", name: "Delivered From Darkness", passage: "Colossians 1:13", cost: 16, effect: "Survives a fatal hit once per level at 1 HP" },
  { id: "looser-translated-into-the-kingdom", piece: "looser", tier: 3, fork: "a", name: "Translated Into the Kingdom", passage: "Colossians 1:13", cost: 30, effect: "Once per level, teleport to any lit square" },
  { id: "looser-loosed-on-earth", piece: "looser", tier: 3, fork: "b", name: "Loosed on Earth", passage: "Colossians 1:13", cost: 30, effect: "Adjacent friendly pieces gain +1 movement" }
];

export const hasSkill = (campaign: Pick<CampaignSave, "purchasedSkills">, id: SkillId) =>
  campaign.purchasedSkills.includes(id);

export const skillById = (id: SkillId) => SKILLS.find((skill) => skill.id === id);

export const skillTierBought = (campaign: CampaignSave, piece: PieceId, tier: SkillDefinition["tier"]) =>
  SKILLS.some((skill) => skill.piece === piece && skill.tier === tier && hasSkill(campaign, skill.id));

export const skillClosed = (campaign: CampaignSave, skill: SkillDefinition) =>
  skillTierBought(campaign, skill.piece, skill.tier) && !hasSkill(campaign, skill.id);

export const skillAvailable = (campaign: CampaignSave, skill: SkillDefinition) =>
  !hasSkill(campaign, skill.id) &&
  !skillClosed(campaign, skill) &&
  (skill.tier === 1 || skillTierBought(campaign, skill.piece, (skill.tier - 1) as SkillDefinition["tier"])) &&
  campaign.oil >= skill.cost;

export const maxHpBonus = (campaign: CampaignSave, piece: PieceId) => {
  if (piece === "protector" && hasSkill(campaign, "protector-shield-of-faith")) return 3;
  if (piece === "destroyer" && hasSkill(campaign, "destroyer-wings-as-a-bat")) return 2;
  if (piece === "binder" && hasSkill(campaign, "binder-solid-rock")) return 4;
  if (piece === "looser" && hasSkill(campaign, "looser-shoal")) return 2;
  return 0;
};

export const attackBonus = (campaign: CampaignSave, piece: PieceId) =>
  piece === "destroyer" && hasSkill(campaign, "destroyer-set-at-his-right-hand") ? 3 : 0;

export const destroyerChargeLimit = (campaign: CampaignSave) =>
  hasSkill(campaign, "destroyer-fourth-charge") ? 4 : 3;
