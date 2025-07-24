// Light API Configuration
export const LIGHT_CONFIG = {
  // Default light for any number roll
  default: '/api/lights/default',
  
  // Win light (7/11 on come-out, or point hit)
  win: '/api/lights/win',
  
  // Loss light (2/3/12 on come-out, or 7-out)
  loss: '/api/lights/loss',
  
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
  fireBet1: '/api/lights/fire-bet/1',
  fireBet2: '/api/lights/fire-bet/2',
  fireBet3: '/api/lights/fire-bet/3',
  fireBet4: '/api/lights/fire-bet/4',
  fireBet5: '/api/lights/fire-bet/5',
  fireBet6: '/api/lights/fire-bet/6'
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