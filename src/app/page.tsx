'use client';
import { useState, useEffect, useRef } from "react";
import PlayerCard from "./components/PlayerCard";
import BuyInModal from "./components/BuyInModal";
import SettingsModal from "./components/SettingsModal";
import LightSettingsModal from "./components/LightSettingsModal";
import Toast from "./components/Toast";
import { triggerLight, triggerPlayerChange, triggerFireBet, type LightSettings, DEFAULT_LIGHT_SETTINGS } from "./config/lights";
import { 
  loadFromLocalStorage, 
  saveToLocalStorage, 
  getDefaultPlayers, 
  getDefaultSettings,
  type Player,
  type Settings 
} from "./utils/localStorage";
import { playSound } from "./utils/sounds";

const POINT_NUMBERS = [4, 5, 6, 8, 9, 10];
const ALL_NUMBERS = Array.from({ length: 11 }, (_, i) => i + 2);

// Key mapping for numbers
const getKeyForNumber = (num: number, numpadMode: boolean): string => {
  if (num >= 2 && num <= 9) return String(num);
  if (num === 10) return '0';
  if (num === 11) return '1';
  if (num === 12) return numpadMode ? '.' : '-';
  return '';
};

export default function Home() {
  const [point, setPoint] = useState<number | null>(null);
  // History now tracks number and result
  type RollResult = 'win' | 'loss' | 'normal';
  const [history, setHistory] = useState<{num: number, result: RollResult}[]>([]);
  const [hitCounts, setHitCounts] = useState<{ [key: number]: number }>(() => {
    const counts: { [key: number]: number } = {};
    ALL_NUMBERS.forEach((n) => (counts[n] = 0));
    return counts;
  });
  const [winLoss, setWinLoss] = useState<null | 'win' | 'loss'>(null);

  // Fire Bet state
  const [fireBetNumbers, setFireBetNumbers] = useState<Set<number>>(new Set());
  const [fireBetWinLevel, setFireBetWinLevel] = useState<number>(0);

  // Previous game state for undo functionality
  type GameState = {
    point: number | null;
    history: {num: number, result: RollResult}[];
    hitCounts: { [key: number]: number };
    winLoss: null | 'win' | 'loss';
    shouldSwitchPlayer: boolean;
    currentLight: 'default' | 'win' | 'loss' | 'player';
    currentPlayerLight: number | null;
    fireBetNumbers: Set<number>;
    fireBetWinLevel: number;
    autoChangePlayers: boolean;
  };
  const [previousState, setPreviousState] = useState<GameState | null>(null);
  // Player state: name, buy-in, enabled
  const [players, setPlayers] = useState<Player[]>(getDefaultPlayers());

  // Shooter must be enabled
  const [shooter, setShooter] = useState<number>(1);
  // Track if player should switch after a loss
  const [shouldSwitchPlayer, setShouldSwitchPlayer] = useState<boolean>(false);

  // Modal state for buy-in
  const [buyInModal, setBuyInModal] = useState<{ open: boolean; playerId: number | null; value: string }>({ open: false, playerId: null, value: '' });
  const buyInInputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [lightSettingsOpen, setLightSettingsOpen] = useState<boolean>(false);
  const [winLightDuration, setWinLightDuration] = useState<number>(getDefaultSettings().winLightDuration);
  const [lossLightDuration, setLossLightDuration] = useState<number>(getDefaultSettings().lossLightDuration);
  const [numpadMode, setNumpadMode] = useState<boolean>(getDefaultSettings().numpadMode);
  const [autoChangePlayers, setAutoChangePlayers] = useState<boolean>(getDefaultSettings().autoChangePlayers);
  const [playSounds, setPlaySounds] = useState<boolean>(getDefaultSettings().playSounds);
  const [repeatFireBetLight, setRepeatFireBetLight] = useState<boolean>(getDefaultSettings().repeatFireBetLight);
  const [lightSettings, setLightSettings] = useState<LightSettings>(DEFAULT_LIGHT_SETTINGS);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'error',
    isVisible: false
  });

  // Light status state
  const [currentLight, setCurrentLight] = useState<'default' | 'win' | 'loss' | 'player'>('default');
  const [currentPlayerLight, setCurrentPlayerLight] = useState<number | null>(null);

  // State for keyboard press animation
  const [keyPressed, setKeyPressed] = useState<number | null>(null);

  // Helper function to show toast messages
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type, isVisible: true });
  };

  // Helper function to close toast
  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Helper function to handle light errors
  const handleLightError = (result: { success: boolean; error?: string }, lightEffect: string) => {
    if (!result.success && result.error) {
      showToast(`Error Playing Light: ${lightEffect}`);
    }
  };

  // Helper function to trigger default light with error handling
  const triggerDefaultLight = async () => {
    const result = await triggerLight('default', lightSettings);
    handleLightError(result, 'Default');
  };

  // Helper function to trigger loss light with error handling
  const triggerLossLight = async () => {
    const result = await triggerLight('loss', lightSettings);
    handleLightError(result, 'Loss');
  };

  // Save current game state
  const saveGameState = () => {
    const currentState: GameState = {
      point,
      history: [...history],
      hitCounts: { ...hitCounts },
      winLoss,
      shouldSwitchPlayer,
      currentLight,
      currentPlayerLight,
      fireBetNumbers: new Set(fireBetNumbers),
      fireBetWinLevel,
      autoChangePlayers
    };
    setPreviousState(currentState);
  };

  // Undo last action
  const undoLastAction = () => {
    if (!previousState) return;
    
    setPoint(previousState.point);
    setHistory(previousState.history);
    setHitCounts(previousState.hitCounts);
    setWinLoss(previousState.winLoss);
    setShouldSwitchPlayer(previousState.shouldSwitchPlayer);
    setCurrentLight(previousState.currentLight);
    setCurrentPlayerLight(previousState.currentPlayerLight);
    setFireBetNumbers(new Set(previousState.fireBetNumbers));
    setFireBetWinLevel(previousState.fireBetWinLevel);
    setAutoChangePlayers(previousState.autoChangePlayers);
    
    // Clear the previous state after undoing
    setPreviousState(null);
  };

  // Open modal for a player
  const openBuyInModal = (id: number, currentValue: string) => {
    setBuyInModal({ open: true, playerId: id, value: currentValue });
  };
  // Close modal
  const closeBuyInModal = () => setBuyInModal({ open: false, playerId: null, value: '' });
  // Save modal value
  const saveBuyInModal = () => {
    if (buyInModal.playerId !== null) {
      handlePlayerChange(buyInModal.playerId, 'buyIn', buyInModal.value);
    }
    closeBuyInModal();
  };
  // Increment modal value
  const incrementBuyIn = (amount: number) => {
    setBuyInModal((prev) => {
      const current = parseInt(prev.value || '0', 10);
      return { ...prev, value: String(current + amount) };
    });
  };
  // Focus input when modal opens
  useEffect(() => {
    if (buyInModal.open && buyInInputRef.current) {
      buyInInputRef.current.focus();
    }
  }, [buyInModal.open]);

  const handleNumberClick = async (num: number) => {
    // Determine result for history
    let result: RollResult = 'normal';
    if (point === null) {
      if ((num === 7 || num === 11) || (POINT_NUMBERS.includes(num))) {
        if (num === 7 || num === 11) result = 'win';
      } else if ([2, 3, 12].includes(num)) {
        result = 'loss';
      }
    } else {
      if (num === 7) {
        result = 'loss';
      } else if (POINT_NUMBERS.includes(num) && point === num) {
        result = 'win';
      }
    }
    
    // Save current state before making changes
    saveGameState();
    
    setHistory((prev) => [{num, result}, ...prev.slice(0, 19)]); // keep last 20
    setHitCounts((prev) => ({ ...prev, [num]: prev[num] + 1 }));

    // Clear swap button when any number is rolled
    setShouldSwitchPlayer(false);

    // Reset win/loss by default
    setWinLoss(null);

    // Handle Fire Bet logic - only count if point is established and then hit
    if (point !== null && POINT_NUMBERS.includes(num) && point === num) {
      const newFireBetNumbers = new Set(fireBetNumbers);
      const wasAlreadyHit = newFireBetNumbers.has(num);
      newFireBetNumbers.add(num);
      setFireBetNumbers(newFireBetNumbers);
      
      // Calculate win level based on unique numbers hit
      const uniqueCount = newFireBetNumbers.size;
      let newLevel = 0;
      if (uniqueCount === 1) {
        newLevel = 1;
      } else if (uniqueCount === 2) {
        newLevel = 2;
      } else if (uniqueCount === 3) {
        newLevel = 3;
      } else if (uniqueCount === 4) {
        newLevel = 4;
      } else if (uniqueCount === 5) {
        newLevel = 5;
      } else if (uniqueCount === 6) {
        newLevel = 6;
      }
      
      // Handle light triggering based on whether this is a new hit or repeat
      if (newLevel > fireBetWinLevel) {
        // New level achieved - always trigger fire bet light
        setFireBetWinLevel(newLevel);
        const result = await triggerFireBet(newLevel, lightSettings);
        handleLightError(result, `Fire Bet ${newLevel}`);
        if (playSounds) {
          playSound('point', newLevel);
        }
        console.log(`FIRE BET LEVEL ${newLevel}!`);
      } else if (wasAlreadyHit) {
        // Same number hit again - check setting
        if (repeatFireBetLight) {
          // Play the same fire bet light
          const result = await triggerFireBet(newLevel, lightSettings);
          handleLightError(result, `Fire Bet ${newLevel} (repeated)`);
          if (playSounds) {
            playSound('point', newLevel);
          }
          console.log(`FIRE BET LEVEL ${newLevel} (repeated)!`);
        } else {
          // Play default win light
          const result = await triggerLight('win', lightSettings);
          handleLightError(result, 'Win (repeated Fire Bet)');
          if (playSounds) {
            playSound('win');
          }
          console.log(`FIRE BET ${newLevel} repeated - playing win light`);
        }
      } else {
        // Same level but different number - trigger current level's fire bet light
        setFireBetWinLevel(newLevel);
        const result = await triggerFireBet(newLevel, lightSettings);
        handleLightError(result, `Fire Bet ${newLevel}`);
        if (playSounds) {
          playSound('point', newLevel);
        }
        console.log(`FIRE BET LEVEL ${newLevel} (different number)!`);
      }
    }

    if (point === null) {
      // No point established
      if (POINT_NUMBERS.includes(num)) {
        setPoint(num); // Set new point
      } else if (num === 7 || num === 11) {
        setWinLoss('win');
        setCurrentLight('win');
        const result = await triggerLight('win', lightSettings);
        handleLightError(result, 'Win');
        if (playSounds) {
          playSound('win');
        }
        console.log('WIN');
        // After win duration, return to default
        setTimeout(() => {
          setCurrentLight('default');
          triggerDefaultLight();
        }, winLightDuration * 1000);
      } else if ([2, 3, 12].includes(num)) {
        setWinLoss('loss');
        setCurrentLight('loss');
        const result = await triggerLight('loss', lightSettings);
        handleLightError(result, 'Loss');
        if (playSounds) {
          playSound('loss');
        }
        console.log('LOSS');
        // After loss duration, return to default
        setTimeout(() => {
          setCurrentLight('default');
          triggerDefaultLight();
        }, lossLightDuration * 1000);
      }
      // Other numbers do nothing
    } else {
      // Point is established
      if (POINT_NUMBERS.includes(num)) {
        if (point === num) {
          setWinLoss('win');
          setCurrentLight('win');
          
          // Check if this is a Fire Bet scenario
          const isFireBetScenario = fireBetNumbers.has(num);
          
          if (playSounds && !isFireBetScenario) {
            // Only play sound if it's not a Fire Bet scenario (Fire Bet logic will handle sounds)
            playSound('win');
          }
          console.log('WIN');
          setPoint(null); // Deselect if same point is rolled again
          // Don't trigger win light here - Fire Bet logic will handle the light
          // After win duration, return to default
          setTimeout(() => {
            setCurrentLight('default');
            triggerDefaultLight();
          }, winLightDuration * 1000);
        }
        // If another point is on, do nothing (cannot change point except by hitting same or 7)
      } else if (num === 7) {
        setWinLoss('loss');
        setCurrentLight('loss');
        if (playSounds) {
          playSound('loss');
        }
        console.log('LOSS');
        setPoint(null); // Clear point on 7
        
        // Reset Fire Bet on seven out
        setFireBetNumbers(new Set());
        setFireBetWinLevel(0);
        
        const result = await triggerLight('loss', lightSettings);
        handleLightError(result, 'Loss');
        // After loss duration, return to default
        setTimeout(() => {
          setCurrentLight('default');
          triggerDefaultLight();
        }, lossLightDuration * 1000);
        // Handle player switching based on auto-change setting
        if (players.filter(p => p.enabled).length > 1) {
          if (autoChangePlayers) {
            // Auto-advance to next player
            setTimeout(() => {
              advanceShooter();
            }, lossLightDuration * 1000 + 500); // Wait for loss light to finish + small delay
          } else {
            // Show swap button for manual change
            setShouldSwitchPlayer(true);
          }
        }
      }
      // Other numbers do nothing
    }
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't handle if modals are open or if typing in input fields
      if (buyInModal.open || settingsOpen || lightSettingsOpen) return;
      
      const key = event.key;
      const code = event.code;
      let targetNumber: number | null = null;
      
      if (numpadMode) {
        // Numpad mode: only allow numpad keys
        if (code === 'Numpad2') {
          targetNumber = 2;
        } else if (code === 'Numpad3') {
          targetNumber = 3;
        } else if (code === 'Numpad4') {
          targetNumber = 4;
        } else if (code === 'Numpad5') {
          targetNumber = 5;
        } else if (code === 'Numpad6') {
          targetNumber = 6;
        } else if (code === 'Numpad7') {
          targetNumber = 7;
        } else if (code === 'Numpad8') {
          targetNumber = 8;
        } else if (code === 'Numpad9') {
          targetNumber = 9;
        } else if (code === 'Numpad0') {
          targetNumber = 10;
        } else if (code === 'Numpad1') {
          targetNumber = 11;
        } else if (code === 'NumpadDecimal') {
          targetNumber = 12;
        }
      } else {
        // Regular mode: allow both regular number keys and numpad keys
        if (key >= '2' && key <= '9') {
          targetNumber = parseInt(key);
        } else if (key === '0' || code === 'Numpad0') {
          targetNumber = 10;
        } else if (key === '1' || code === 'Numpad1') {
          targetNumber = 11;
        } else if (key === '-' || code === 'NumpadDecimal') {
          targetNumber = 12;
        } else if (code === 'Numpad2') {
          targetNumber = 2;
        } else if (code === 'Numpad3') {
          targetNumber = 3;
        } else if (code === 'Numpad4') {
          targetNumber = 4;
        } else if (code === 'Numpad5') {
          targetNumber = 5;
        } else if (code === 'Numpad6') {
          targetNumber = 6;
        } else if (code === 'Numpad7') {
          targetNumber = 7;
        } else if (code === 'Numpad8') {
          targetNumber = 8;
        } else if (code === 'Numpad9') {
          targetNumber = 9;
        }
      }
      
      if (targetNumber) {
        // Trigger visual feedback
        setKeyPressed(targetNumber);
        setTimeout(() => setKeyPressed(null), 150);
        
        handleNumberClick(targetNumber);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyInModal.open, settingsOpen, point, numpadMode]);

  // Helper to advance shooter to next enabled player
  const advanceShooter = async () => {
    if (players.filter(p => p.enabled).length <= 1) return; // Only advance if more than one enabled
    const currentIdx = players.findIndex(p => p.id === shooter);
    let nextIdx = (currentIdx + 1) % players.length;
    while (!players[nextIdx].enabled || players[nextIdx].id === shooter) {
      nextIdx = (nextIdx + 1) % players.length;
    }
    const result = await triggerPlayerChange(players[nextIdx].id, lightSettings);
    handleLightError(result, `Player Change ${players[nextIdx].id}`);
    setShooter(players[nextIdx].id);
    setShouldSwitchPlayer(false);
    
    // Reset Fire Bet for new player
    setFireBetNumbers(new Set());
    setFireBetWinLevel(0);
    
    // Set light states for player change
    setCurrentLight('player');
    setCurrentPlayerLight(players[nextIdx].id);
    
    // Return to default after a short delay
    setTimeout(() => {
      setCurrentLight('default');
      setCurrentPlayerLight(null);
      triggerDefaultLight();
    }, 2000);
  };

  // Manual shooter selection
  const handleShooterSelect = async (id: number) => {
    setShooter(id);
    setShouldSwitchPlayer(false);
    
    // Reset Fire Bet for new player
    setFireBetNumbers(new Set());
    setFireBetWinLevel(0);
    
    // Trigger player change light
    setCurrentLight('player');
    setCurrentPlayerLight(id);
    const result = await triggerPlayerChange(id, lightSettings);
    handleLightError(result, `Player Change ${id}`);
    
    // Return to default after a short delay
    setTimeout(() => {
      setCurrentLight('default');
      setCurrentPlayerLight(null);
      triggerDefaultLight();
    }, 2000);
  };

  const handlePlayerChange = (id: number, field: 'name' | 'buyIn' | 'enabled', value: string | boolean) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  // If the current shooter is disabled, auto-advance to the next enabled player
  useEffect(() => {
    const current = players.find((p) => p.id === shooter);
    if (!current || !current.enabled) {
      const next = players.find((p) => p.enabled);
      if (next) setShooter(next.id);
    }
  }, [players, shooter]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setPlayers(savedData.players);
      setWinLightDuration(savedData.settings.winLightDuration);
      setLossLightDuration(savedData.settings.lossLightDuration);
      setNumpadMode(savedData.settings.numpadMode);
      setAutoChangePlayers(savedData.settings.autoChangePlayers);
      setPlaySounds(savedData.settings.playSounds ?? false);
      setRepeatFireBetLight(savedData.settings.repeatFireBetLight ?? true);
      if (savedData.settings.lightSettings) {
        setLightSettings(savedData.settings.lightSettings);
      }
      if (savedData.fireBetNumbers) {
        setFireBetNumbers(new Set(savedData.fireBetNumbers));
        setFireBetWinLevel(savedData.fireBetWinLevel);
      }
      if (savedData.history) {
        setHistory(savedData.history);
      }
      if (savedData.hitCounts) {
        setHitCounts(savedData.hitCounts);
      }
    }
  }, []);

  // Save data to localStorage whenever players or settings change
  useEffect(() => {
    const dataToSave = {
      players,
      settings: {
        winLightDuration,
        lossLightDuration,
        numpadMode,
        autoChangePlayers,
        playSounds,
        repeatFireBetLight,
        lightSettings,
      },
      fireBetNumbers: Array.from(fireBetNumbers),
      fireBetWinLevel,
      history,
      hitCounts,
    };
    saveToLocalStorage(dataToSave);
  }, [players, winLightDuration, lossLightDuration, numpadMode, autoChangePlayers, playSounds, repeatFireBetLight, lightSettings, fireBetNumbers, fireBetWinLevel, history, hitCounts]);

  // For bar graph
  const maxHits = Math.max(...Object.values(hitCounts));

  return (
    <>
      <div className="min-h-screen w-full font-sans flex flex-col items-center bg-gradient-to-br from-gray-900 to-gray-700">
        <div className="w-full max-w-screen-2xl mx-auto flex flex-col items-center p-4 gap-6">
          <h1 className="text-3xl font-extrabold text-white drop-shadow">DCC Craps Table</h1>
          <div className="w-full max-w-6xl">
            <div className="flex flex-row gap-4 w-full overflow-x-auto justify-center py-1">
              {ALL_NUMBERS.map((num) => {
                const isPoint = point === num && POINT_NUMBERS.includes(num);
                return (
                  <div key={num} className="flex flex-col items-center">
                    <button
                      className={`w-18 h-18 rounded-3xl text-2xl font-extrabold border-4 shadow-lg transition-all duration-150 flex items-center justify-center
                        ${isPoint ? "bg-yellow-300 border-yellow-500 text-black scale-105" : "bg-gray-800 border-gray-600 text-white hover:bg-gray-600 active:scale-95"}
                        ${keyPressed === num ? "scale-95 bg-gray-600" : ""}
                      `}
                      onClick={() => {
                        handleNumberClick(num);
                      }}
                      aria-label={`Roll ${num}`}
                    >
                      {num}
                    </button>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {getKeyForNumber(num, numpadMode)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl px-2 overflow-x-auto">
            {/* Combined History and Graph */}
            <div className="flex-[1.2] bg-gray-800 rounded-xl p-5 shadow-md min-w-[320px] flex flex-col">
              <div className="text-base text-white mb-1">
                {point ? (
                  <span>
                    Point is <span className="font-bold text-yellow-300">{point}</span>
                  </span>
                ) : (
                  <span>No point set</span>
                )}
              </div>
              {winLoss && (
                <div className={`mb-1 text-base font-bold ${winLoss === 'win' ? 'text-green-400' : 'text-red-400'}`}>{winLoss === 'win' ? 'WIN!' : 'LOSS'}</div>
              )}
              <div className="flex justify-between items-center mb-1">
                <div className="text-white text-base font-semibold">History</div>
                <div className="flex gap-2">
                  <button
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={undoLastAction}
                    disabled={!previousState}
                    title="Undo last roll"
                  >
                    Undo
                  </button>
                  <button
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    onClick={() => {
                      setHistory([]);
                      setHitCounts(() => {
                        const counts: { [key: number]: number } = {};
                        ALL_NUMBERS.forEach((n) => (counts[n] = 0));
                        return counts;
                      });
                      setFireBetNumbers(new Set());
                      setFireBetWinLevel(0);
                      setPreviousState(null);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[32px] mb-3">
                {history.length === 0 ? (
                  <span className="text-gray-400">No rolls yet</span>
                ) : (
                  history.map((h, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded-lg text-lg font-mono border-2
                        ${h.result === 'win' ? "border-green-500 bg-green-100 text-green-800" :
                          h.result === 'loss' && h.num === 7 ? "border-red-500 bg-red-100 text-red-700" :
                          "border-gray-500 bg-gray-900 text-white"}
                      `}
                    >
                      {h.num}
                    </span>
                  ))
                )}
              </div>
              <div className="text-white text-base mb-2 font-semibold">Fire Bet Status</div>
              <div className={`mb-3 p-2 bg-gray-700 rounded-lg relative ${
                fireBetWinLevel >= 3 ? 'fire-effect' : ''
              }`} style={{
                '--fire-level': fireBetWinLevel >= 3 ? fireBetWinLevel : 0
              } as React.CSSProperties}>
                {fireBetWinLevel >= 3 && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className="fire-flames"></div>
                  </div>
                )}
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm">Current Level: <span className="font-bold text-yellow-300">{fireBetWinLevel}</span></span>
                    <span className="text-white text-sm">Player {shooter}</span>
                  </div>
                  <div className="flex flex-wrap gap-8 justify-center">
                    {POINT_NUMBERS.map((num) => (
                      <div
                        key={num}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                          fireBetNumbers.has(num)
                            ? 'bg-green-600 border-green-400 text-white'
                            : 'bg-gray-600 border-gray-500 text-gray-300'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-white text-base mb-2 font-semibold">Number Frequency</div>
                              <div className="flex flex-col gap-1">
                  {ALL_NUMBERS.map((num) => (
                    <div key={num} className="flex items-center gap-1 h-6">
                    <span className="w-6 text-right text-sm text-yellow-300 font-bold font-mono">{num}</span>
                    <div className="flex-1 h-5 bg-gray-700 rounded">
                      <div
                        className="h-5 rounded bg-green-400 transition-all"
                        style={{ width: `${maxHits ? (hitCounts[num] / maxHits) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="w-6 text-left text-sm text-gray-200">{hitCounts[num]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Player Selector as large box */}
            <div className="flex-[2] bg-gray-800 rounded-xl p-6 shadow-md min-w-[400px] flex flex-col items-center">
              <div className="flex justify-between items-center mb-4 w-full">
                <div className="text-white text-2xl font-semibold">Shooter & Players</div>
                <button
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setPlayers(getDefaultPlayers());
                    setShooter(1);
                  }}
                >
                  Clear Board
                </button>
              </div>
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Top row: 3 4 5 6 */}
                <div className="flex flex-row gap-5 mb-3 w-full justify-center">
                  {[3,4,5,6].map((id) => (
                    <PlayerCard
                      key={id}
                      player={players.find((p) => p.id === id)!}
                      isShooter={shooter === id}
                      onShooterSelect={handleShooterSelect}
                      onNameChange={(id, name) => handlePlayerChange(id, 'name', name)}
                      onBuyInClick={openBuyInModal}
                      onEnabledChange={(id, enabled) => handlePlayerChange(id, 'enabled', enabled)}
                    />
                  ))}
                </div>
                {/* Middle row: 2 (left), 7 (right) */}
                <div className="flex flex-row gap-32 mb-3 w-full justify-between">
                  <PlayerCard
                    player={players.find((p) => p.id === 2)!}
                    isShooter={shooter === 2}
                    onShooterSelect={handleShooterSelect}
                    onNameChange={(id, name) => handlePlayerChange(id, 'name', name)}
                    onBuyInClick={openBuyInModal}
                    onEnabledChange={(id, enabled) => handlePlayerChange(id, 'enabled', enabled)}
                  />
                  <PlayerCard
                    player={players.find((p) => p.id === 7)!}
                    isShooter={shooter === 7}
                    onShooterSelect={handleShooterSelect}
                    onNameChange={(id, name) => handlePlayerChange(id, 'name', name)}
                    onBuyInClick={openBuyInModal}
                    onEnabledChange={(id, enabled) => handlePlayerChange(id, 'enabled', enabled)}
                  />
                </div>
                {/* Bottom row: 1 (left), 8 (right) */}
                <div className="flex flex-row gap-32 w-full justify-between">
                  <PlayerCard
                    player={players.find((p) => p.id === 1)!}
                    isShooter={shooter === 1}
                    onShooterSelect={handleShooterSelect}
                    onNameChange={(id, name) => handlePlayerChange(id, 'name', name)}
                    onBuyInClick={openBuyInModal}
                    onEnabledChange={(id, enabled) => handlePlayerChange(id, 'enabled', enabled)}
                  />
                  <PlayerCard
                    player={players.find((p) => p.id === 8)!}
                    isShooter={shooter === 8}
                    onShooterSelect={handleShooterSelect}
                    onNameChange={(id, name) => handlePlayerChange(id, 'name', name)}
                    onBuyInClick={openBuyInModal}
                    onEnabledChange={(id, enabled) => handlePlayerChange(id, 'enabled', enabled)}
                  />
                </div>
              </div>
              {/* Swap Players Button */}
              {shouldSwitchPlayer && (
                <div className="flex justify-center mt-4">
                  <button
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-lg"
                    onClick={advanceShooter}
                  >
                    Swap Players?
                  </button>
                </div>
              )}
              
              {/* Light Status Display */}
              <div className="mt-4 p-3 bg-gray-700 rounded-lg -mb-2">
                <div className="text-white text-center mb-2 font-semibold">Current Light Status</div>
                <div className="flex justify-center">
                  <div className={`px-4 py-2 rounded-lg font-bold text-white ${
                    currentLight === 'win' ? 'bg-green-600' :
                    currentLight === 'loss' ? 'bg-red-600' :
                    currentLight === 'player' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}>
                    {currentLight === 'win' ? 'WIN LIGHT' :
                     currentLight === 'loss' ? 'LOSS LIGHT' :
                     currentLight === 'player' ? `PLAYER ${currentPlayerLight} LIGHT` :
                     'DEFAULT LIGHT'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BuyInModal
        open={buyInModal.open}
        value={buyInModal.value}
        onChange={val => setBuyInModal(prev => ({ ...prev, value: val }))}
        onIncrement={incrementBuyIn}
        onSave={saveBuyInModal}
        onCancel={closeBuyInModal}
        inputRef={buyInInputRef as React.RefObject<HTMLInputElement>}
      />
      {/* Settings Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        winDuration={winLightDuration}
        lossDuration={lossLightDuration}
        numpadMode={numpadMode}
        autoChangePlayers={autoChangePlayers}
        playSounds={playSounds}
        repeatFireBetLight={repeatFireBetLight}
        onWinDurationChange={setWinLightDuration}
        onLossDurationChange={setLossLightDuration}
        onNumpadModeChange={setNumpadMode}
        onAutoChangePlayersChange={setAutoChangePlayers}
        onPlaySoundsChange={setPlaySounds}
        onRepeatFireBetLightChange={setRepeatFireBetLight}
        onOpenLightSettings={() => setLightSettingsOpen(true)}
      />

      {/* Light Settings Modal */}
      <LightSettingsModal
        open={lightSettingsOpen}
        onClose={() => setLightSettingsOpen(false)}
        settings={lightSettings}
        onSettingsChange={setLightSettings}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </>
  );
}
