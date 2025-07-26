export interface Player {
  id: number;
  name: string;
  buyIn: string;
  enabled: boolean;
}

export interface Settings {
  winLightDuration: number;
  lossLightDuration: number;
  numpadMode: boolean;
  autoChangePlayers: boolean;
}

export interface SavedData {
  players: Player[];
  settings: Settings;
  fireBetNumbers: number[];
  fireBetWinLevel: number;
  history: {num: number, result: 'win' | 'loss' | 'normal'}[];
  hitCounts: { [key: number]: number };
}

const STORAGE_KEY = 'dcc-craps-lights-data';

export const saveToLocalStorage = (data: SavedData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): SavedData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return null;
};

export const getDefaultPlayers = (): Player[] => [
  { id: 1, name: '', buyIn: '', enabled: false },
  { id: 2, name: '', buyIn: '', enabled: false },
  { id: 3, name: '', buyIn: '', enabled: false },
  { id: 4, name: '', buyIn: '', enabled: false },
  { id: 5, name: '', buyIn: '', enabled: false },
  { id: 6, name: '', buyIn: '', enabled: false },
  { id: 7, name: '', buyIn: '', enabled: false },
  { id: 8, name: '', buyIn: '', enabled: false },
];

export const getDefaultSettings = (): Settings => ({
  winLightDuration: 3,
  lossLightDuration: 2,
  numpadMode: false,
  autoChangePlayers: false,
}); 