import { describe, expect, it } from 'vitest';
import { ALUM_NOTES, READING_WPM, readingMinutesFor, wordCount } from '../src/content/notes';

const SECTIONS = ['VARC', 'DILR', 'QA', 'Strategy'];
const allText = (n: (typeof ALUM_NOTES)[number]) => [n.title, n.topic, n.authorLabel, ...n.body].join('\n');

describe('alum notes', () => {
  it('has at least 12 notes, each with a known section and a topic', () => {
    expect(ALUM_NOTES.length).toBeGreaterThanOrEqual(12);
    for (const n of ALUM_NOTES) {
      expect(SECTIONS).toContain(n.section);
      expect(n.topic).not.toBe('');
      expect(n.upvotes).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps every note between 200 and 500 words', () => {
    for (const n of ALUM_NOTES) {
      const words = wordCount(n.body);
      expect(words, n.id).toBeGreaterThanOrEqual(200);
      expect(words, n.id).toBeLessThanOrEqual(500);
    }
  });

  it('uses unique ids and titles', () => {
    expect(new Set(ALUM_NOTES.map((n) => n.id)).size).toBe(ALUM_NOTES.length);
    expect(new Set(ALUM_NOTES.map((n) => n.title)).size).toBe(ALUM_NOTES.length);
  });

  it('labels every author as a sample alum', () => {
    for (const n of ALUM_NOTES) expect(n.authorLabel.startsWith('Sample alum')).toBe(true);
  });

  it('never mentions Prepito and keeps the tone', () => {
    for (const n of ALUM_NOTES) {
      const text = allText(n);
      expect(text, n.id).not.toMatch(/prepito/i);
      expect(text, n.id).not.toContain('!');
      expect(text, n.id).not.toMatch(/unlock|supercharge|seamless|AI-powered|revolutionary/i);
    }
  });

  it('derives reading minutes from the word count', () => {
    for (const n of ALUM_NOTES) {
      expect(n.readingMinutes, n.id).toBe(readingMinutesFor(n.body));
      expect(n.readingMinutes, n.id).toBe(Math.max(1, Math.round(wordCount(n.body) / READING_WPM)));
    }
  });

  it('gets the percentage-fraction pairs right', () => {
    const note = ALUM_NOTES.find((n) => n.id === 'qa-percent-fraction-pairs')!;
    const pairs = [...note.body.join(' ').matchAll(/(\d+)\/(\d+) = ([\d.]+)%/g)];
    expect(pairs).toHaveLength(12);
    for (const [, a, b, pct] of pairs) expect(Math.abs((Number(a) / Number(b)) * 100 - Number(pct))).toBeLessThan(0.01);
  });
});
