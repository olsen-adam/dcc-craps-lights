import React from 'react';

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    buyIn: string;
    enabled: boolean;
  };
  isShooter: boolean;
  onShooterSelect: (id: number) => void;
  onNameChange: (id: number, name: string) => void;
  onBuyInClick: (id: number, buyIn: string) => void;
  onEnabledChange: (id: number, enabled: boolean) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isShooter, onShooterSelect, onNameChange, onBuyInClick, onEnabledChange }) => {
  return (
    <div
      className={`flex flex-col items-center p-2 rounded-lg border-2 w-28 mb-1
        ${isShooter ? 'border-green-500' : 'border-gray-500 bg-gray-900'}
        ${!player.enabled ? 'opacity-40 grayscale' : 'hover:bg-gray-800'}
      `}
    >
      <button
        className={`w-8 h-8 rounded-full font-bold border-2 mb-1 transition-colors
          ${isShooter ? 'border-green-600 text-white scale-110' : 'bg-gray-700 border-gray-500 text-white hover:bg-gray-600'}
        `}
        disabled={!player.enabled}
        onClick={() => player.enabled && onShooterSelect(player.id)}
        aria-label={`Select shooter P${player.id}`}
      >
        {`P${player.id}`}
      </button>
      <input
        className="w-full text-xs text-center rounded bg-gray-200 mb-1 px-1 py-0.5 text-black"
        placeholder="Name"
        value={player.name}
        disabled={!player.enabled}
        onChange={e => onNameChange(player.id, e.target.value)}
      />
      <input
        className="w-full text-xs text-center rounded bg-gray-200 mb-1 px-1 py-0.5 text-black cursor-pointer"
        placeholder="$ Buy-in"
        value={player.buyIn ? `$${player.buyIn}` : ''}
        disabled={!player.enabled}
        readOnly
        onClick={() => player.enabled && onBuyInClick(player.id, player.buyIn)}
      />
      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={player.enabled}
          onChange={e => onEnabledChange(player.id, e.target.checked)}
        />
        <span>Active</span>
      </label>
    </div>
  );
};

export default PlayerCard; 