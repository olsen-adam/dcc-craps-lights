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
  playSounds: boolean;
  repeatFireBetLight: boolean;
  lightSettings: {
    ipAddress: string;
    effects: {
      default: { fx: number; sx: number; ix: number; r: number; g: number; b: number }[];
      win: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      loss: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      playerChange1: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      playerChange2: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      playerChange3: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      playerChange4: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      playerChange5: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      playerChange6: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      playerChange7: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      playerChange8: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      point: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      clear: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      fireBet1: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      fireBet2: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      fireBet3: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      fireBet4: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      fireBet5: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
      fireBet6: { fx: number; sx: number; ix: number; r: number; g: number; b: number };
    };
  };
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
  playSounds: false,
  repeatFireBetLight: true,
  lightSettings: {
    ipAddress: 'http://192.168.1.77',
    effects: {
      default: [
        { fx: 15, sx: 110, ix: 90, r: 255, g: 255, b: 0 },
        { fx: 16, sx: 120, ix: 85, r: 255, g: 200, b: 50 },
        { fx: 17, sx: 100, ix: 95, r: 200, g: 255, b: 100 }
      ],
      win: { fx: 16, sx: 255, ix: 31, r: 0, g: 255, b: 0 },
      loss: { fx: 78, sx: 210, ix: 255, r: 255, g: 0, b: 0 },
      playerChange1: { fx: 15, sx: 110, ix: 90, r: 0, g: 255, b: 255 },
      playerChange2: { fx: 15, sx: 110, ix: 90, r: 255, g: 0, b: 255 },
      playerChange3: { fx: 15, sx: 110, ix: 90, r: 255, g: 255, b: 0 },
      playerChange4: { fx: 15, sx: 110, ix: 90, r: 0, g: 0, b: 255 },
      playerChange5: { fx: 15, sx: 110, ix: 90, r: 255, g: 128, b: 0 },
      playerChange6: { fx: 15, sx: 110, ix: 90, r: 128, g: 0, b: 255 },
      playerChange7: { fx: 15, sx: 110, ix: 90, r: 255, g: 0, b: 128 },
      playerChange8: { fx: 15, sx: 110, ix: 90, r: 0, g: 255, b: 128 },
      point: { fx: 15, sx: 110, ix: 90, r: 255, g: 165, b: 0 },
      clear: { fx: 15, sx: 110, ix: 90, r: 128, g: 128, b: 128 },
      fireBet1: { fx: 50, sx: 10, ix: 90, r: 255, g: 255, b: 0 },
      fireBet2: { fx: 50, sx: 80, ix: 90, r: 255, g: 255, b: 0 },
      fireBet3: { fx: 50, sx: 150, ix: 90, r: 255, g: 255, b: 0 },
      fireBet4: { fx: 50, sx: 190, ix: 90, r: 255, g: 165, b: 0 },
      fireBet5: { fx: 50, sx: 230, ix: 90, r: 228, g: 0, b: 120 },
      fireBet6: { fx: 50, sx: 230, ix: 90, r: 180, g: 40, b: 255 }
    }
  }
}); 