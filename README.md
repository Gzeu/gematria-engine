# Gematria Engine

> Cryptolinguistic analysis tool — 6 ciphers, numerology reduction, JSON output

[![License: MIT](https://img.shields.io/badge/License-MIT-7c3aed.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)](src/gematria-engine.ts)

---

## What is Gematria?

Gematria is an alphanumeric code of assigning a numerical value to a word based on its letters. Each cipher uses a different mapping system, revealing different numerical signatures for the same text.

## Ciphers Included

| Cipher | System | Example (A) |
|--------|--------|-------------|
| **English Ordinal** | A=1 … Z=26 | 1 |
| **English Reduction** | Pythagorean single-digit | 1 |
| **Reverse Ordinal** | A=26 … Z=1 | 26 |
| **Sumerian** | Ordinal × 6 | 6 |
| **Chaldean** | Traditional Chaldean | 1 |
| **Hebrew Standard** | Mispar Hechrachi | 1 |

## Quick Start

### As a TypeScript Module

```ts
import { analyzeGematria } from './src/gematria-engine';

const result = analyzeGematria('George');
console.log(result);
```

### As a Next.js API Route

```ts
// pages/api/gematria.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeGematria } from '@/src/gematria-engine';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'Missing input' });
  return res.status(200).json(analyzeGematria(input));
}
```

POST `/api/gematria` with body `{ "input": "George" }`

## Response Structure

```json
{
  "original_input": "George",
  "sanitized": "GEORGE",
  "ciphers": {
    "english_ordinal": {
      "total": 57,
      "breakdown": { "G1": 7, "E1": 5, "O": 15, "R": 18, "G2": 7, "E2": 5 },
      "matching_words": ["moon", "human"]
    },
    "english_reduction":  { "total": 30 },
    "reverse_ordinal":    { "total": 99 },
    "sumerian":           { "total": 342 },
    "chaldean":           { "total": 38 },
    "hebrew_standard":    { "total": 282 }
  },
  "numerology_number": 3,
  "numerology_summary": "English Ordinal total 57 reduces to 3 — The number 3 vibrates with creativity, expression, and joy."
}
```

## Features

- ✅ Pure TypeScript — zero dependencies
- ✅ 6 cipher systems in one call
- ✅ Character-level breakdown with duplicate indexing (`G1`, `G2`)
- ✅ Matching words list per cipher
- ✅ Numerology reduction with Master Number support (11, 22, 33)
- ✅ Sanitizes input (strips spaces, punctuation, numbers)
- ✅ Single-file HTML demo included

## Demo UI

Open `demo/gematria-engine.html` in any browser — no server needed.

## File Structure

```
gematria-engine/
├── src/
│   └── gematria-engine.ts    ← Core engine (pure TS, no deps)
├── demo/
│   └── gematria-engine.html  ← Single-file browser demo
├── tests/
│   └── gematria.test.ts      ← Unit tests
├── README.md
└── LICENSE
```

## Tests

```bash
npx jest tests/gematria.test.ts
```

## License

MIT © George Pricop
