// Light API Configuration
export interface LightEffect {
  fx: number;
  sx: number;
  ix: number;
  r: number;
  g: number;
  b: number;
}

export interface LightSettings {
  ipAddress: string;
  effects: {
    default: LightEffect[];
    win: LightEffect;
    loss: LightEffect;
    playerChange1: LightEffect;
    playerChange2: LightEffect;
    playerChange3: LightEffect;
    playerChange4: LightEffect;
    playerChange5: LightEffect;
    playerChange6: LightEffect;
    playerChange7: LightEffect;
    playerChange8: LightEffect;
    point: LightEffect;
    clear: LightEffect;
    fireBet1: LightEffect;
    fireBet2: LightEffect;
    fireBet3: LightEffect;
    fireBet4: LightEffect;
    fireBet5: LightEffect;
    fireBet6: LightEffect;
  };
}

// Default light settings
export const DEFAULT_LIGHT_SETTINGS: LightSettings = {
  ipAddress: 'https://dcclights.netlify.app/.netlify/functions/led-proxy',
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
};

// Function to generate URL from effect settings
export const generateLightUrl = (ipAddress: string, effect: LightEffect): string => {
  return `${ipAddress}/win&FX=${effect.fx}&SX=${effect.sx}&IX=${effect.ix}&R=${effect.r}&G=${effect.g}&B=${effect.b}`;
};

// Function to get light URL from settings
export const getLightUrl = (settings: LightSettings, lightType: keyof LightSettings['effects']): string => {
  const effect = settings.effects[lightType];
  
  // Handle default effects array - randomly select one
  if (lightType === 'default' && Array.isArray(effect)) {
    const randomIndex = Math.floor(Math.random() * effect.length);
    return generateLightUrl(settings.ipAddress, effect[randomIndex]);
  }
  
  // Handle single effects
  if (!Array.isArray(effect)) {
    return generateLightUrl(settings.ipAddress, effect);
  }
  
  // Fallback for unexpected array types
  return generateLightUrl(settings.ipAddress, effect[0]);
};

// Helper function to trigger a light
export const triggerLight = async (lightType: keyof LightSettings['effects'], settings: LightSettings): Promise<{ success: boolean; error?: string }> => {
  try {
    const url = getLightUrl(settings, lightType);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorMessage = `Failed to trigger ${String(lightType)} light: ${response.statusText}`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = `Error triggering ${String(lightType)} light: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Helper function to trigger player change light for specific player
export const triggerPlayerChange = async (playerId: number, settings: LightSettings): Promise<{ success: boolean; error?: string }> => {
  const lightType = `playerChange${playerId}` as keyof LightSettings['effects'];
  return await triggerLight(lightType, settings);
};

// Helper function to trigger Fire Bet light for specific level
export const triggerFireBet = async (level: number, settings: LightSettings): Promise<{ success: boolean; error?: string }> => {
  const lightType = `fireBet${level}` as keyof LightSettings['effects'];
  return await triggerLight(lightType, settings);
};

// Helper function to trigger light with data
export const triggerLightWithData = async (lightType: keyof LightSettings['effects'], settings: LightSettings, data?: unknown): Promise<{ success: boolean; error?: string }> => {
  try {
    const url = getLightUrl(settings, lightType);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const errorMessage = `Failed to trigger ${String(lightType)} light: ${response.statusText}`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = `Error triggering ${String(lightType)} light: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}; 