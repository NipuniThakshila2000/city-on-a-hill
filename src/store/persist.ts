import type { CampaignSave, GameSettings, SavedGame } from "../game/types";

const KEY = "city-on-a-hill-save";
const GAME_KEY = "city-on-a-hill-current-run";
const SETTINGS_KEY = "city-on-a-hill-settings";
const DEFAULT_SAVE: CampaignSave = {
  version: 2,
  avoidableDestroys: 0,
  highestUnlockedLevel: 1,
  oil: 0,
  purchasedSkills: []
};
const DEFAULT_SETTINGS: GameSettings = {
  contextualHelpEnabled: true
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

export const loadSettings = (): GameSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: GameSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSavedGame = (): SavedGame | null => {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedGame;
    if (parsed.version !== 1 || !parsed.state) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveGame = (save: SavedGame) => {
  localStorage.setItem(GAME_KEY, JSON.stringify(save));
};

export const hasSavedGame = () => !!loadSavedGame();
