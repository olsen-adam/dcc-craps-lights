// Light API Configuration
export const LIGHT_CONFIG = {
  // Default light for any number roll
  default: 'http://192.168.1.77/win&FX=15&SX=110&IX=90&R=255&G=255&B=0',
  
  // Win light (7/11 on come-out, or point hit)
  win: 'http://192.168.1.77/win&FX=16&SX=255&IX=31&R=0&G=255&B=0',
  
  // Loss light (2/3/12 on come-out, or 7-out)
  loss: 'http://192.168.1.77/win&FX=78&SX=210&IX=255&R=255&G=0&B=0',
  
  // Player change lights (one for each player position)
  playerChange1: '/api/lights/player-change/1',
  playerChange2: '/api/lights/player-change/2',
  playerChange3: '/api/lights/player-change/3',
  playerChange4: '/api/lights/player-change/4',
  playerChange5: '/api/lights/player-change/5',
  playerChange6: '/api/lights/player-change/6',
  playerChange7: '/api/lights/player-change/7',
  playerChange8: '/api/lights/player-change/8',
  
  // Point light (when point is established)
  point: '/api/lights/point',
  
  // Clear lights (when point is cleared)
  clear: '/api/lights/clear',
  
  // Fire Bet lights (for different win levels)
  fireBet1: 'http://192.168.1.77/win&FX=50&SX=10&IX=90&R=255&G=255&B=0',
  fireBet2: 'http://192.168.1.77/win&FX=50&SX=80&IX=90&R=255&G=255&B=0',
  fireBet3: 'http://192.168.1.77/win&FX=50&SX=150&IX=90&R=255&G=255&B=0',
  fireBet4: 'http://192.168.1.77/win&FX=50&SX=190&IX=90&R=255&G=165&B=0',
  fireBet5: 'http://192.168.1.77/win&FX=50&SX=230&IX=90&R=228&G=0&B=120',
  fireBet6: 'http://192.168.1.77/win&FX=50&SX=230&IX=90&R=180&G=40&B=255'
};

// Helper function to trigger a light
export const triggerLight = async (lightType: keyof typeof LIGHT_CONFIG) => {
  try {
    const response = await fetch(LIGHT_CONFIG[lightType], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to trigger ${lightType} light:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error triggering ${lightType} light:`, error);
  }
};

// Helper function to trigger player change light for specific player
export const triggerPlayerChange = async (playerId: number) => {
  const lightType = `playerChange${playerId}` as keyof typeof LIGHT_CONFIG;
  await triggerLight(lightType);
};

// Helper function to trigger Fire Bet light for specific level
export const triggerFireBet = async (level: number) => {
  const lightType = `fireBet${level}` as keyof typeof LIGHT_CONFIG;
  await triggerLight(lightType);
};

// Helper function to trigger light with data
export const triggerLightWithData = async (lightType: keyof typeof LIGHT_CONFIG, data?: unknown) => {
  try {
    const response = await fetch(LIGHT_CONFIG[lightType], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      console.error(`Failed to trigger ${lightType} light:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error triggering ${lightType} light:`, error);
  }
}; 