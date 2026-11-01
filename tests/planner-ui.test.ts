import { describe, expect, it } from 'vitest';
import { activityOf, creditSession, layoutDay, parseBlock, quickAddChip, snapLength, snapStart, stepLength, stepStart, tomorrowSlot } from '../src/components/planner/model';
import type { PlannerBlock } from '../src/state/schema';

const NOW = new Date(2026, 10, 1, 10, 30);

const block = (over: Partial<PlannerBlock>): PlannerBlock => ({
  id: 'x',
  title: 'Block',
  subject: 'QA',
  dateISO: '2026-11-02',
  startMin: 19 * 60,
  minutes: 45,
  done: false,
  activity: null,
  ...over,
});

describe('layoutDay', () => {
  it('gives overlapping blocks their own lanes and leaves separate blocks full width', () => {
    const map = layoutDay([
      { id: 'a', startMin: 600, minutes: 60 },
      { id: 'b', startMin: 630, minutes: 60 },
      { id: 'c', startMin: 900, minutes: 30 },
    ]);
    expect(map.get('a')).toEqual({ lane: 0, lanes: 2 });
    expect(map.get('b')).toEqual({ lane: 1, lanes: 2 });
    expect(map.get('c')).toEqual({ lane: 0, lanes: 1 });
  });

  it('reuses a lane once it is free, within one cluster', () => {
    const map = layoutDay([
      { id: 'long', startMin: 600, minutes: 120 },
      { id: 'first', startMin: 600, minutes: 30 },
      { id: 'after', startMin: 630, minutes: 30 },
    ]);
    expect(map.get('long')?.lanes).toBe(2);
    expect(map.get('after')?.lane).toBe(map.get('first')?.lane);
  });

  it('treats a 4 minute block as a full row, because that is how it is drawn', () => {
    const map = layoutDay([
      { id: 'short', startMin: 600, minutes: 4 },
      { id: 'next', startMin: 610, minutes: 30 },
    ]);
    expect(map.get('short')?.lanes).toBe(2);
  });
});

describe('moving and resizing', () => {
  it('keeps a block inside 6 am to midnight', () => {
    expect(stepStart({ startMin: 360, minutes: 30 }, -1)).toBe(360);
    expect(stepStart({ startMin: 1395, minutes: 45 }, 1)).toBe(1395);
    expect(stepStart({ startMin: 600, minutes: 30 }, 1)).toBe(630);
  });

  it('resizes in half hours and never below one row', () => {
    expect(stepLength({ startMin: 600, minutes: 45 }, 1)).toBe(60);
    expect(stepLength({ startMin: 600, minutes: 45 }, -1)).toBe(30);
    expect(stepLength({ startMin: 600, minutes: 30 }, -1)).toBe(30);
    expect(stepLength({ startMin: 600, minutes: 4 }, -1)).toBe(4);
    expect(stepLength({ startMin: 1410, minutes: 30 }, 1)).toBe(30);
  });

  it('snaps a drag to the half hour', () => {
    expect(snapStart(611, 45)).toBe(600);
    expect(snapStart(620, 45)).toBe(630);
    expect(snapStart(100, 45)).toBe(360);
    expect(snapStart(1439, 45)).toBe(1380);
    expect(snapLength(640, 600)).toBe(30);
    expect(snapLength(5000, 1380)).toBe(60);
  });
});

describe('creditSession', () => {
  const planned = 90;

  it('adds a row for a date that has none', () => {
    expect(creditSession([], '2026-11-01', planned, 45)).toEqual([{ date: '2026-11-01', plannedMinutes: planned, completedMinutes: 45 }]);
  });

  it('adds to an existing row and keeps the larger plan', () => {
    const rows = [{ date: '2026-11-01', plannedMinutes: 60, completedMinutes: 20 }];
    expect(creditSession(rows, '2026-11-01', planned, 45)).toEqual([{ date: '2026-11-01', plannedMinutes: planned, completedMinutes: 65 }]);
  });

  it('takes minutes back when a block is unticked, never below zero', () => {
    const rows = [{ date: '2026-11-01', plannedMinutes: 60, completedMinutes: 20 }];
    expect(creditSession(rows, '2026-11-01', 60, -45)[0].completedMinutes).toBe(0);
    expect(creditSession([], '2026-11-01', 60, -45)).toEqual([]);
  });
});

describe('parseBlock', () => {
  it('builds the preview text from the brief', () => {
    const q = parseBlock('DILR sets 7pm 45m', NOW, []);
    expect(q && quickAddChip(q, NOW)).toBe('DILR · DILR sets · Today 7 pm · 45 min');
  });

  it('keeps a typed time inside the grid', () => {
    expect(parseBlock('Vocab 5am 30m', NOW, [])?.startMin).toBe(360);
    expect(parseBlock('Mock 11:30 pm 2h', NOW, [])?.startMin).toBe(22 * 60);
  });

  it('uses the next free slot when no time is typed', () => {
    const q = parseBlock('Vocab tomorrow 10m', NOW, [block({ startMin: 19 * 60, minutes: 60 })]);
    expect(q?.dateISO).toBe('2026-11-02');
    expect(q?.startMin).toBe(20 * 60);
  });

  it('returns null without a title', () => {
    expect(parseBlock('7pm 45m', NOW, [])).toBeNull();
  });
});

describe('tomorrowSlot', () => {
  const missed = block({ id: 'missed', dateISO: '2026-10-29', minutes: 30 });

  it('lands on tomorrow from 7 pm', () => {
    expect(tomorrowSlot([missed], missed, NOW)).toEqual({ dateISO: '2026-11-02', startMin: 19 * 60 });
  });

  it('falls back to earlier in the day when the evening is full', () => {
    const evening = block({ id: 'evening', startMin: 19 * 60, minutes: 300 });
    expect(tomorrowSlot([missed, evening], missed, NOW)).toEqual({ dateISO: '2026-11-02', startMin: 6 * 60 });
  });
});

describe('activityOf', () => {
  it('links typed titles to the matching activity', () => {
    expect(activityOf('Sectional QA')).toBe('/practice/tests?tab=sectional');
    expect(activityOf('DILR set-pick')).toBe('/practice/drill');
    expect(activityOf('RC passages')).toBeNull();
  });
});
