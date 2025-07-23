import React, { useState } from 'react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  winDuration: number;
  lossDuration: number;
  onWinDurationChange: (duration: number) => void;
  onLossDurationChange: (duration: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  winDuration,
  lossDuration,
  onWinDurationChange,
  onLossDurationChange
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
      <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-4 min-w-[400px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xl font-bold text-gray-900">Settings</div>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Win Light Duration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Win Light Duration</label>
              <span className="text-sm text-gray-500">{winDuration}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={winDuration}
              onChange={(e) => onWinDurationChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1s</span>
              <span>10s</span>
            </div>
          </div>

          {/* Loss Light Duration */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Loss Light Duration</label>
              <span className="text-sm text-gray-500">{lossDuration}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={lossDuration}
              onChange={(e) => onLossDurationChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1s</span>
              <span>10s</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 