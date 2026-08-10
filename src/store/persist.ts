import type { CampaignSave } from "../game/types";

const KEY = "city-on-a-hill-save";
const DEFAULT_SAVE: CampaignSave = {
  version: 1,
  avoidableDestroys: 0,
  highestUnlockedLevel: 1
};

export const loadCampaign = (): CampaignSave => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw) as CampaignSave;
    if (parsed.version !== 1) return DEFAULT_SAVE;
    return { ...DEFAULT_SAVE, ...parsed };
  } catch {
    return DEFAULT_SAVE;
  }
};

export const saveCampaign = (save: CampaignSave) => {
  localStorage.setItem(KEY, JSON.stringify(save));
};
