# Gematria Engine

A production-ready Gematria / Numerology analysis engine with a Next.js API layer.

## Features

- 6 ciphers: English Ordinal, English Reduction (Pythagorean), Reverse Ordinal, Sumerian, Chaldean, Hebrew Standard
- Full character-by-character breakdowns with indexed duplicate letters (G1, G2…)
- Matching words lookup per cipher
- Numerology reduction with Master Number support (11, 22, 33)
- REST API: single input + batch endpoint
- Full TypeScript types
- Jest test suite

## Quick Start

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # run test suite
npm run build     # production build
```

## API Reference

### POST /api/gematria

**Request:**
```json
{ "input": "George" }
```

**Response:**
```json
{
  "original_input": "George",
  "ciphers": {
    "english_ordinal":   { "total": 57,  "breakdown": {"G1":7,"E1":5,"O":15,"R":18,"G2":7,"E2":5}, "matching_words": ["moon","human"] },
    "english_reduction": { "total": 39,  "breakdown": {...}, "matching_words": [...] },
    "reverse_ordinal":   { "total": 105, "breakdown": {...}, "matching_words": [...] },
    "sumerian":          { "total": 342, "breakdown": {...}, "matching_words": [...] },
    "chaldean":          { "total": 25,  "breakdown": {...}, "matching_words": [...] },
    "hebrew_standard":   { "total": 286, "breakdown": {...}, "matching_words": [...] }
  },
  "numerology_summary": "English Ordinal total 57 reduces to 3 — The number 3 vibrates with creativity...",
  "base_number": 3
}
```

### POST /api/gematria/batch

**Request:**
```json
{ "inputs": ["George", "fire", "cosmos"] }
```

**Response:**
```json
{ "results": [ {...}, {...}, {...} ] }
```

## Project Structure

```
gematria-engine/
├── lib/
│   └── gematria-engine.ts          ← Pure engine, zero dependencies
├── pages/
│   └── api/
│       ├── gematria.ts              ← POST /api/gematria
│       └── gematria/
│           └── batch.ts             ← POST /api/gematria/batch
├── hooks/
│   └── useGematria.ts               ← React hook
├── __tests__/
│   └── gematria-engine.test.ts      ← Jest test suite
├── jest.config.js
├── tsconfig.json
└── package.json
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel deploy
```
