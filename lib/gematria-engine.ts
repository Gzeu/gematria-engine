// ─── CIPHER MAPS ──────────────────────────────────────────────────────────────
const ORD: Record<string, number> = {};
const RED: Record<string, number> = {};
const REV: Record<string, number> = {};
const SUM: Record<string, number> = {};
const CHA: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,J:1,K:2,L:3,M:4,N:5,
  O:7,P:8,Q:1,R:2,S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7
};
const HEB: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,J:10,K:20,L:30,M:40,N:50,
  O:70,P:80,Q:100,R:200,S:300,T:400,U:6,V:6,W:6,X:60,Y:10,Z:7
};

function reduceDigit(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return n;
}

for (let i = 0; i < 26; i++) {
  const l = String.fromCharCode(65 + i);
  ORD[l] = i + 1;
  RED[l] = reduceDigit(i + 1);
  REV[l] = 26 - i;
  SUM[l] = (i + 1) * 6;
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type CipherResult = {
  total: number;
  breakdown: Record<string, number>;
  matching_words: [string, string];
};

export type GematriaResponse = {
  original_input: string;
  ciphers: {
    english_ordinal: CipherResult;
    english_reduction: CipherResult;
    reverse_ordinal: CipherResult;
    sumerian: CipherResult;
    chaldean: CipherResult;
    hebrew_standard: CipherResult;
  };
  numerology_summary: string;
  base_number: number;
};

export type CipherKey = keyof GematriaResponse['ciphers'];

export const CIPHER_DEFS: { key: CipherKey; name: string; sub: string; color: string }[] = [
  { key: 'english_ordinal',   name: 'English Ordinal',   sub: 'A=1 … Z=26',        color: '#a78bfa' },
  { key: 'english_reduction', name: 'Eng. Reduction',    sub: 'Pythagorean',        color: '#e8af34' },
  { key: 'reverse_ordinal',   name: 'Reverse Ordinal',   sub: 'A=26 … Z=1',         color: '#4f98a3' },
  { key: 'sumerian',          name: 'Sumerian',          sub: 'Ordinal × 6',        color: '#d163a7' },
  { key: 'chaldean',          name: 'Chaldean',          sub: 'Traditional',        color: '#fdab43' },
  { key: 'hebrew_standard',   name: 'Hebrew Standard',   sub: 'Mispar Hechrachi',   color: '#5591c7' },
];

const MAPS: Record<CipherKey, Record<string, number>> = {
  english_ordinal:   ORD,
  english_reduction: RED,
  reverse_ordinal:   REV,
  sumerian:          SUM,
  chaldean:          CHA,
  hebrew_standard:   HEB,
};

// ─── WORD DICTIONARY ──────────────────────────────────────────────────────────
const WORD_LIST: string[] = [
  "sun","moon","star","fire","earth","water","wind","love","life","soul","gold",
  "king","god","sky","sea","tree","day","time","mind","word","light","dark","truth",
  "power","faith","hope","peace","joy","grace","will","free","name","real","true",
  "pure","wise","holy","good","evil","lord","angel","human","dream","heart","blood",
  "birth","death","world","chaos","order","magic","space","voice","force","glory",
  "honor","brave","trust","unity","crown","stone","rain","seed","wolf","lion","rose",
  "oak","iron","coin","path","gate","door","code","data","node","mesh","flux","wave",
  "core","link","rune","fate","myth","echo","void","aeon","sage","omen","sign","mars",
  "zeus","thor","eden","adam","noah","isis","ares","gaia","city","road","fort","wall",
  "hall","ring","song","tale","poem","book","fish","bird","bear","deer","hawk","dove",
  "crow","lamb","bull","goat","law","war","art","key","arc","age","era","spell","river",
  "bridge","forge","tower","flame","steel","frost","storm","vale","peak","mist","grove",
  "thorn","ember","crest","dusk","dawn","oracle","raven","blade","mirror","shadow",
  "silver","golden","mystic","solar","lunar","astral","primal","cipher","sacred",
  "divine","fallen","rising","cosmos","spirit","mortal","arcane","hidden","ancient",
  "eternal","crystal","vortex","portal","ritual","vessel","throne","temple","abyss",
  "nexus","matrix","herald","zenith","omega","alpha","sigma","delta","gamma"
];

function wordValue(word: string, map: Record<string, number>): number {
  return word.toUpperCase().split('').reduce((a, c) => a + (map[c] || 0), 0);
}

function findMatches(map: Record<string, number>, target: number, exclude: string): [string, string] {
  const results: string[] = [];
  for (const w of WORD_LIST) {
    if (w.toUpperCase() === exclude) continue;
    if (wordValue(w, map) === target) results.push(w);
    if (results.length === 2) break;
  }
  while (results.length < 2) results.push('—');
  return [results[0], results[1]];
}

// ─── NUMEROLOGY ───────────────────────────────────────────────────────────────
export const NUMEROLOGY_MEANINGS: Record<number, string> = {
  1: "The number 1 represents leadership, independence, and pioneering energy — a force that initiates new beginnings.",
  2: "The number 2 embodies duality, cooperation, and harmony — a mediating force that seeks balance and partnership.",
  3: "The number 3 vibrates with creativity, expression, and joy — the energy of manifestation through communication.",
  4: "The number 4 resonates with stability, order, and hard work — the foundation builder of the material world.",
  5: "The number 5 carries the energy of freedom, change, and adventure — a dynamic force of transformation.",
  6: "The number 6 represents love, responsibility, and nurturing — the caretaker that seeks harmony in relationships.",
  7: "The number 7 vibrates with mysticism, introspection, and spiritual seeking — the number of divine knowledge.",
  8: "The number 8 embodies power, abundance, and material mastery — the force of infinite manifestation.",
  9: "The number 9 carries completion, wisdom, and universal compassion — the final synthesis of human experience.",
  11: "Master Number 11 represents spiritual illumination and intuitive insight — a gateway between the physical and divine.",
  22: "Master Number 22 is the Master Builder — manifesting grand visions into concrete, lasting reality.",
  33: "Master Number 33 is the Master Teacher — embodying pure unconditional love and spiritual upliftment.",
};

function numerologyReduce(n: number): number {
  const master = new Set([11, 22, 33]);
  while (n > 9 && !master.has(n)) {
    n = String(n).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return n;
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────
export function analyzeGematria(input: string): GematriaResponse {
  const sanitized = input.toUpperCase().replace(/[^A-Z]/g, '');
  if (!sanitized) throw new Error('Input must contain at least one letter.');

  const letters = sanitized.split('');
  const ciphers = {} as GematriaResponse['ciphers'];

  for (const def of CIPHER_DEFS) {
    const map = MAPS[def.key];
    const count: Record<string, number> = {};
    const breakdown: Record<string, number> = {};

    for (const l of letters) {
      count[l] = (count[l] || 0) + 1;
      const key = letters.filter(x => x === l).length > 1 ? `${l}${count[l]}` : l;
      breakdown[key] = map[l] || 0;
    }

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    ciphers[def.key] = {
      total,
      breakdown,
      matching_words: findMatches(map, total, sanitized),
    };
  }

  const ordTotal = ciphers.english_ordinal.total;
  const baseNumber = numerologyReduce(ordTotal);

  return {
    original_input: input,
    ciphers,
    numerology_summary: `English Ordinal total ${ordTotal} reduces to ${baseNumber} — ${NUMEROLOGY_MEANINGS[baseNumber]}`,
    base_number: baseNumber,
  };
}
