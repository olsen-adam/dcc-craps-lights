import React, { useState, useEffect } from 'react';
import { DEFAULT_LIGHT_SETTINGS } from '../config/lights';

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

interface LightSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: LightSettings;
  onSettingsChange: (settings: LightSettings) => void;
}

const LightSettingsModal: React.FC<LightSettingsModalProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<LightSettings>(settings);
  const [showResetConfirmation, setShowResetConfirmation] = useState<boolean>(false);

  // Update local settings when modal opens or settings prop changes
  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  const handleResetToDefaults = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    setLocalSettings(DEFAULT_LIGHT_SETTINGS);
    setShowResetConfirmation(false);
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

  const updateEffect = (effectKey: keyof LightSettings['effects'], field: keyof LightEffect, value: number, index?: number) => {
    setLocalSettings(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [effectKey]: effectKey === 'default' && Array.isArray(prev.effects[effectKey]) && typeof index === 'number'
          ? (prev.effects[effectKey] as LightEffect[]).map((effect, i) => 
              i === index ? { ...effect, [field]: value } : effect
            )
          : !Array.isArray(prev.effects[effectKey])
          ? { ...(prev.effects[effectKey] as LightEffect), [field]: value }
          : prev.effects[effectKey]
      }
    }));
  };

  const updateColor = (effectKey: keyof LightSettings['effects'], color: 'r' | 'g' | 'b', value: number, index?: number) => {
    setLocalSettings(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [effectKey]: effectKey === 'default' && Array.isArray(prev.effects[effectKey]) && typeof index === 'number'
          ? (prev.effects[effectKey] as LightEffect[]).map((effect, i) => 
              i === index ? { ...effect, [color]: value } : effect
            )
          : !Array.isArray(prev.effects[effectKey])
          ? { ...(prev.effects[effectKey] as LightEffect), [color]: value }
          : prev.effects[effectKey]
      }
    }));
  };

  const addDefaultEffect = () => {
    setLocalSettings(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        default: [...(prev.effects.default as LightEffect[]), { fx: 15, sx: 110, ix: 90, r: 255, g: 255, b: 0 }]
      }
    }));
  };

  const removeDefaultEffect = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        default: (prev.effects.default as LightEffect[]).filter((_, i) => i !== index)
      }
    }));
  };

  const generateUrl = (effect: LightEffect) => {
    return `${localSettings.ipAddress}/win&FX=${effect.fx}&SX=${effect.sx}&IX=${effect.ix}&R=${effect.r}&G=${effect.g}&B=${effect.b}`;
  };

  if (!open) return null;

  const effectLabels: Record<keyof LightSettings['effects'], string> = {
    default: 'Default',
    win: 'Win',
    loss: 'Loss',
    playerChange1: 'Player Change 1',
    playerChange2: 'Player Change 2',
    playerChange3: 'Player Change 3',
    playerChange4: 'Player Change 4',
    playerChange5: 'Player Change 5',
    playerChange6: 'Player Change 6',
    playerChange7: 'Player Change 7',
    playerChange8: 'Player Change 8',
    point: 'Point',
    clear: 'Clear',
    fireBet1: 'Fire Bet 1',
    fireBet2: 'Fire Bet 2',
    fireBet3: 'Fire Bet 3',
    fireBet4: 'Fire Bet 4',
    fireBet5: 'Fire Bet 5',
    fireBet6: 'Fire Bet 6'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
      <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-4 min-w-[800px] max-w-[95vw] max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xl font-bold text-gray-900">Light Settings</div>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={handleCancel}
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-6">
          {/* IP Address */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">IP Address</label>
            <input
              type="text"
              value={localSettings.ipAddress}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, ipAddress: e.target.value }))}
              placeholder="http://192.168.1.77"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Effects Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Light Effects</h3>
            {Object.entries(localSettings.effects).map(([key, effect]) => {
              // Handle default effects array specially
              if (key === 'default' && Array.isArray(effect)) {
                return (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">Default Effects (Random Selection)</h4>
                      <button
                        onClick={addDefaultEffect}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200"
                      >
                        + Add Effect
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Multiple default effects will be randomly chosen when triggered. At least one effect is required.
                    </p>
                    
                    {effect.map((defaultEffect, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-3 mb-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Default Effect {index + 1}</span>
                          {effect.length > 1 && (
                            <button
                              onClick={() => removeDefaultEffect(index)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors duration-200"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mb-2">
                          {generateUrl(defaultEffect)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Effect Number */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">FX (Effect)</label>
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={defaultEffect.fx}
                              onChange={(e) => updateEffect(key as keyof LightSettings['effects'], 'fx', parseInt(e.target.value) || 0, index)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                            />
                          </div>

                          {/* Speed */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">SX (Speed)</label>
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={defaultEffect.sx}
                              onChange={(e) => updateEffect(key as keyof LightSettings['effects'], 'sx', parseInt(e.target.value) || 0, index)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                            />
                          </div>

                          {/* Pixel Length */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">IX (Pixel Length)</label>
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={defaultEffect.ix}
                              onChange={(e) => updateEffect(key as keyof LightSettings['effects'], 'ix', parseInt(e.target.value) || 0, index)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                            />
                          </div>

                          {/* Color Preview */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Color</label>
                            <div className="flex gap-1">
                              <input
                                type="color"
                                value={`#${defaultEffect.r.toString(16).padStart(2, '0')}${defaultEffect.g.toString(16).padStart(2, '0')}${defaultEffect.b.toString(16).padStart(2, '0')}`}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  const r = parseInt(hex.slice(1, 3), 16);
                                  const g = parseInt(hex.slice(3, 5), 16);
                                  const b = parseInt(hex.slice(5, 7), 16);
                                  updateEffect(key as keyof LightSettings['effects'], 'r', r, index);
                                  updateEffect(key as keyof LightSettings['effects'], 'g', g, index);
                                  updateEffect(key as keyof LightSettings['effects'], 'b', b, index);
                                }}
                                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                              />
                              <div className="flex-1 grid grid-cols-3 gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="255"
                                  value={defaultEffect.r}
                                  onChange={(e) => updateColor(key as keyof LightSettings['effects'], 'r', parseInt(e.target.value) || 0, index)}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                  placeholder="R"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="255"
                                  value={defaultEffect.g}
                                  onChange={(e) => updateColor(key as keyof LightSettings['effects'], 'g', parseInt(e.target.value) || 0, index)}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                  placeholder="G"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="255"
                                  value={defaultEffect.b}
                                  onChange={(e) => updateColor(key as keyof LightSettings['effects'], 'b', parseInt(e.target.value) || 0, index)}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                                  placeholder="B"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // Handle single effects
              if (!Array.isArray(effect)) {
                return (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">{effectLabels[key as keyof LightSettings['effects']]}</h4>
                      <div className="text-xs text-gray-500 font-mono">
                        {generateUrl(effect)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Effect Number */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">FX (Effect)</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={effect.fx}
                          onChange={(e) => updateEffect(key as keyof LightSettings['effects'], 'fx', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        />
                      </div>

                      {/* Speed */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">SX (Speed)</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={effect.sx}
                          onChange={(e) => updateEffect(key as keyof LightSettings['effects'], 'sx', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        />
                      </div>

                      {/* Pixel Length */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">IX (Pixel Length)</label>
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={effect.ix}
                          onChange={(e) => updateEffect(key as keyof LightSettings['effects'], 'ix', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        />
                      </div>

                      {/* Color Preview */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Color</label>
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={`#${effect.r.toString(16).padStart(2, '0')}${effect.g.toString(16).padStart(2, '0')}${effect.b.toString(16).padStart(2, '0')}`}
                            onChange={(e) => {
                              const hex = e.target.value;
                              const r = parseInt(hex.slice(1, 3), 16);
                              const g = parseInt(hex.slice(3, 5), 16);
                              const b = parseInt(hex.slice(5, 7), 16);
                              updateEffect(key as keyof LightSettings['effects'], 'r', r);
                              updateEffect(key as keyof LightSettings['effects'], 'g', g);
                              updateEffect(key as keyof LightSettings['effects'], 'b', b);
                            }}
                            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <div className="flex-1 grid grid-cols-3 gap-1">
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={effect.r}
                              onChange={(e) => updateColor(key as keyof LightSettings['effects'], 'r', parseInt(e.target.value) || 0)}
                              className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                              placeholder="R"
                            />
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={effect.g}
                              onChange={(e) => updateColor(key as keyof LightSettings['effects'], 'g', parseInt(e.target.value) || 0)}
                              className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                              placeholder="G"
                            />
                            <input
                              type="number"
                              min="0"
                              max="255"
                              value={effect.b}
                              onChange={(e) => updateColor(key as keyof LightSettings['effects'], 'b', parseInt(e.target.value) || 0)}
                              className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                              placeholder="B"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <button
            className="px-4 py-2 text-red-600 hover:text-red-800 font-medium border border-red-300 hover:border-red-400 rounded-lg transition-colors duration-200 hover:bg-red-50 flex items-center gap-2"
            onClick={handleResetToDefaults}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
              onClick={handleSave}
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirmation && (
          <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reset to Defaults?</h3>
                  <p className="text-sm text-gray-600">This will reset all light settings to their original values.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  onClick={cancelReset}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
                  onClick={confirmReset}
                >
                  Reset All Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LightSettingsModal; 