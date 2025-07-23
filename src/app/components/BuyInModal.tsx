import React from 'react';

interface BuyInModalProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onIncrement: (amount: number) => void;
  onSave: () => void;
  onCancel: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const BuyInModal: React.FC<BuyInModalProps> = ({ open, value, onChange, onIncrement, onSave, onCancel, inputRef }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
      <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-4 min-w-[300px] max-w-[90vw]">
        <div className="text-lg font-bold mb-2 text-gray-900">Set Buy-in</div>
        <input
          ref={inputRef}
          className="w-full text-lg rounded border border-gray-400 px-2 py-1 mb-2 text-black"
          type="number"
          min="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSave(); }}
        />
        <div className="flex flex-row gap-2 mb-2">
          {[50, 100, 200, 500].map((amt) => (
            <button
              key={amt}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-1 rounded"
              onClick={() => onIncrement(amt)}
              type="button"
            >
              +{amt}
            </button>
          ))}
        </div>
        <div className="flex flex-row gap-2 justify-end">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-1 rounded"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1 rounded"
            onClick={onSave}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyInModal; 