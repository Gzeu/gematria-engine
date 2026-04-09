import { analyzeGematria, NUMEROLOGY_MEANINGS } from '@/lib/gematria-engine';

describe('analyzeGematria()', () => {

  // ─── INPUT SANITIZATION ───────────────────────────────────────────────
  test('preserves original input', () => {
    const result = analyzeGematria('George');
    expect(result.original_input).toBe('George');
  });

  test('ignores spaces and punctuation', () => {
    const a = analyzeGematria('George');
    const b = analyzeGematria('  G e o r g e! ');
    expect(a.ciphers.english_ordinal.total).toBe(b.ciphers.english_ordinal.total);
  });

  test('is case-insensitive', () => {
    const a = analyzeGematria('george');
    const b = analyzeGematria('GEORGE');
    expect(a.ciphers.english_ordinal.total).toBe(b.ciphers.english_ordinal.total);
  });

  test('throws on input with no letters', () => {
    expect(() => analyzeGematria('123 !!!')).toThrow();
  });

  // ─── ENGLISH ORDINAL ──────────────────────────────────────────────────
  test('English Ordinal: George = 57', () => {
    const result = analyzeGematria('George');
    expect(result.ciphers.english_ordinal.total).toBe(57);
  });

  test('English Ordinal: A = 1', () => {
    expect(analyzeGematria('A').ciphers.english_ordinal.total).toBe(1);
  });

  test('English Ordinal: Z = 26', () => {
    expect(analyzeGematria('Z').ciphers.english_ordinal.total).toBe(26);
  });

  // ─── ENGLISH REDUCTION ────────────────────────────────────────────────
  test('English Reduction: S reduces 19 -> 1', () => {
    expect(analyzeGematria('S').ciphers.english_reduction.total).toBe(1);
  });

  test('English Reduction: George = 39', () => {
    expect(analyzeGematria('George').ciphers.english_reduction.total).toBe(39);
  });

  // ─── REVERSE ORDINAL ──────────────────────────────────────────────────
  test('Reverse Ordinal: A = 26', () => {
    expect(analyzeGematria('A').ciphers.reverse_ordinal.total).toBe(26);
  });

  test('Reverse Ordinal: Z = 1', () => {
    expect(analyzeGematria('Z').ciphers.reverse_ordinal.total).toBe(1);
  });

  test('Reverse Ordinal: George = 105', () => {
    expect(analyzeGematria('George').ciphers.reverse_ordinal.total).toBe(105);
  });

  // ─── SUMERIAN ─────────────────────────────────────────────────────────
  test('Sumerian = English Ordinal x 6', () => {
    const result = analyzeGematria('George');
    expect(result.ciphers.sumerian.total).toBe(
      result.ciphers.english_ordinal.total * 6
    );
  });

  // ─── CHALDEAN ─────────────────────────────────────────────────────────
  test('Chaldean: George = 25', () => {
    expect(analyzeGematria('George').ciphers.chaldean.total).toBe(25);
  });

  // ─── HEBREW STANDARD ──────────────────────────────────────────────────
  test('Hebrew Standard: George = 286', () => {
    expect(analyzeGematria('George').ciphers.hebrew_standard.total).toBe(286);
  });

  // ─── BREAKDOWN ────────────────────────────────────────────────────────
  test('Breakdown indexes duplicate letters (G1, G2)', () => {
    const bd = analyzeGematria('George').ciphers.english_ordinal.breakdown;
    expect(bd['G1']).toBe(7);
    expect(bd['G2']).toBe(7);
    expect(bd['E1']).toBe(5);
    expect(bd['E2']).toBe(5);
    expect(bd['O']).toBe(15);
    expect(bd['R']).toBe(18);
  });

  test('Single letters have no index suffix', () => {
    const bd = analyzeGematria('ABC').ciphers.english_ordinal.breakdown;
    expect(Object.keys(bd)).toEqual(['A', 'B', 'C']);
  });

  // ─── NUMEROLOGY ───────────────────────────────────────────────────────
  test('George reduces to 3 (57 -> 12 -> 3)', () => {
    expect(analyzeGematria('George').base_number).toBe(3);
  });

  test('K = 11 preserved as Master Number', () => {
    expect(analyzeGematria('K').base_number).toBe(11);
  });

  test('Numerology summary contains base number', () => {
    const result = analyzeGematria('George');
    expect(result.numerology_summary).toContain('3');
  });

  test('All NUMEROLOGY_MEANINGS keys exist', () => {
    [1,2,3,4,5,6,7,8,9,11,22,33].forEach(n => {
      expect(NUMEROLOGY_MEANINGS[n]).toBeTruthy();
    });
  });
});
