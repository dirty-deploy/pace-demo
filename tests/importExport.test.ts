import { describe, expect, it } from 'vitest';
import { exportFilename, exportJson, importSummary, parseImport } from '../src/state/importExport';
import { emptyState, newProfile, SCHEMA_VERSION, type AppState } from '../src/state/schema';

const student = (): AppState => ({
  ...emptyState(),
  profile: newProfile({ name: 'Asha', onboarded: true }),
  coins: [{ id: 'c1', at: 1, dayISO: '2026-11-01', delta: 50, action: 'mock', label: 'Full mock finished' }],
  redo: [{ id: 'r1', setId: 'S07', label: 'Set S07', reason: 'A wrong answer', minutes: 8, dueISO: '2026-11-02', done: false, fromAttempt: null }],
});

const failure = (text: string) => {
  const r = parseImport(text);
  if (r.ok) throw new Error('Expected this file to be rejected');
  return r.message;
};

describe('export', () => {
  it('names the file by date', () => {
    expect(exportFilename('2026-11-01')).toBe('pace-data-2026-11-01.json');
  });

  it('round-trips through import unchanged', () => {
    const s = student();
    const r = parseImport(exportJson(s));
    expect(r).toEqual({ ok: true, state: s });
  });
});

describe('import', () => {
  it('fills missing parts of an older partial export', () => {
    const r = parseImport(JSON.stringify({ version: 1, profile: newProfile({ name: 'Asha' }), settings: { theme: 'dark' } }));
    if (!r.ok) throw new Error(r.message);
    expect(r.state.settings).toEqual({ ...emptyState().settings, theme: 'dark' });
    expect(r.state.attempts).toEqual([]);
    expect(r.state.purchases.coupons).toEqual([]);
  });

  it('rejects text that is not JSON', () => {
    expect(failure('{not json')).toContain("isn't valid JSON");
  });

  it('rejects an empty file', () => {
    expect(failure('   ')).toContain('empty');
  });

  it.each([['[]'], ['null'], ['12'], ['"pace"'], ['{"name":"Asha"}'], ['{"version":"1"}'], ['{"version":1}']])('rejects %s as not a Pace export', (text) => {
    expect(failure(text)).toContain("isn't a Pace export");
  });

  it('rejects a file from a newer schema', () => {
    expect(failure(JSON.stringify({ ...student(), version: SCHEMA_VERSION + 1 }))).toContain('newer version');
  });

  it.each<[string, Partial<Record<keyof AppState, unknown>>]>([
    ['attempts', { attempts: 'none' }],
    ['attempts', { attempts: [{ id: 'a1' }] }],
    ['coins', { coins: [{ delta: '50' }] }],
    ['days', { days: [] }],
    ['profile', { profile: { name: 'Asha', exam: 'GMAT' } }],
    ['settings', { settings: { theme: 'neon' } }],
    ['redo', { redo: [{ id: 'r1', setId: 'S07', dueISO: 'soon' }] }],
    ['community', { community: { threads: 'none' } }],
    ['purchases', { purchases: { shields: 'two' } }],
  ])('names the damaged part: %s', (part, patch) => {
    expect(failure(JSON.stringify({ ...student(), ...patch }))).toContain(`its ${part} data is damaged`);
  });

  it('says nothing changed on every failure', () => {
    for (const text of ['', '{', '[]', '{"version":99}', JSON.stringify({ ...student(), coins: 'x' })]) {
      expect(failure(text)).toContain('Nothing was changed.');
    }
  });

  it('accepts a profile of null, which is what a fresh export holds', () => {
    expect(parseImport(exportJson(emptyState())).ok).toBe(true);
  });
});

describe('importSummary', () => {
  it('says what the file holds', () => {
    expect(importSummary(student())).toBe("Asha's data: 0 attempts, 50 coins.");
    expect(importSummary(emptyState())).toBe('Data with no profile: 0 attempts, 0 coins.');
  });
});
