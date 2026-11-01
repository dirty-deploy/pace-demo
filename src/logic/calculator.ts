/** The basic on-screen calculator from the QA section. */
export type CalcState = { display: string; stored: number | null; op: string | null; fresh: boolean };

export const CALC_START: CalcState = { display: '0', stored: null, op: null, fresh: true };

function apply(a: number, op: string, b: number): number {
  if (op === '+') return a + b;
  if (op === '−') return a - b;
  if (op === '×') return a * b;
  return b === 0 ? NaN : a / b;
}

function show(n: number): string {
  if (!Number.isFinite(n)) return 'Error';
  return String(Number(n.toPrecision(10)));
}

export function calcPress(s: CalcState, key: string): CalcState {
  if (key === 'C') return CALC_START;
  if (s.display === 'Error') s = CALC_START;
  if (/^\d$/.test(key)) {
    if (s.fresh) return { ...s, display: key, fresh: false };
    return { ...s, display: s.display === '0' ? key : (s.display + key).slice(0, 12) };
  }
  if (key === '.') {
    if (s.fresh) return { ...s, display: '0.', fresh: false };
    return s.display.includes('.') ? s : { ...s, display: `${s.display}.` };
  }
  if (key === '⌫') {
    if (s.fresh) return s;
    return { ...s, display: s.display.length > 1 ? s.display.slice(0, -1) : '0' };
  }
  if (key === '±') return { ...s, display: show(-Number(s.display)) };
  if (key === '%') return { ...s, display: show(Number(s.display) / 100), fresh: true };
  if (key === '√') return { ...s, display: show(Math.sqrt(Number(s.display))), fresh: true };
  const value = Number(s.display);
  const carried = s.op !== null && s.stored !== null && !s.fresh ? apply(s.stored, s.op, value) : value;
  if (key === '=') return { display: show(carried), stored: null, op: null, fresh: true };
  return { display: show(carried), stored: carried, op: key, fresh: true };
}
