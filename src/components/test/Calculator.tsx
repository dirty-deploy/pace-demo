import { useState } from 'react';
import { X } from 'lucide-react';
import { CALC_START, calcPress } from '../../logic/calculator';

const KEYS = ['C', '⌫', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '±', '0', '.', '=', '√'];

export function Calculator({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState(CALC_START);
  return (
    <section className="calc" aria-label="Calculator">
      <div className="row-between">
        <span className="small">Calculator</span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close calculator">
          <X size={16} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <output className="calc-display num" aria-live="polite">
        {state.display}
      </output>
      <div className="calc-keys">
        {KEYS.map((k) => (
          <button type="button" key={k} onClick={() => setState((s) => calcPress(s, k))} aria-label={k === '⌫' ? 'Delete' : k === 'C' ? 'Clear' : k === '√' ? 'Square root' : k === '±' ? 'Change sign' : k}>
            {k}
          </button>
        ))}
      </div>
    </section>
  );
}
