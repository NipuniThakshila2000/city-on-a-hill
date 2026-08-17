import type { CampaignSave } from "../game/types";

const KEY = "city-on-a-hill-save";
const DEFAULT_SAVE: CampaignSave = {
  version: 2,
  avoidableDestroys: 0,
  highestUnlockedLevel: 1,
  oil: 0,
  purchasedSkills: []
};

type LegacyCampaignSave = {
  version: 1;
  avoidableDestroys: number;
  highestUnlockedLevel: number;
};

export const loadCampaign = (): CampaignSave => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw) as CampaignSave | LegacyCampaignSave;
    if (parsed.version === 1) {
      return {
        ...DEFAULT_SAVE,
        avoidableDestroys: parsed.avoidableDestroys,
        highestUnlockedLevel: parsed.highestUnlockedLevel
      };
    }
    if (parsed.version !== 2) return DEFAULT_SAVE;
    return { ...DEFAULT_SAVE, ...parsed };
  } catch {
    return DEFAULT_SAVE;
  }
};

export const saveCampaign = (save: CampaignSave) => {
  localStorage.setItem(KEY, JSON.stringify(save));
};
