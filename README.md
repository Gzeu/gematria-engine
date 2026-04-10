# ℵ Gematria Engine

> Advanced gematria & numerology analysis across 6 ancient cipher systems — live at **[gematria-engine.vercel.app](https://gematria-engine.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

---

## Features

### Engine (`lib/gematria-engine.ts`)
- **6 cipher systems** — English Ordinal, English Reduction (Pythagorean), Reverse Ordinal, Sumerian, Chaldean, Hebrew Standard
- **Character-by-character breakdown** with indexed duplicate letters (`G1`, `G2`…)
- **Word matching** — finds words from a built-in dictionary with the same cipher value
- **Numerology reduction** — reduces to single digit with Master Number support (11, 22, 33)
- **Zero dependencies** — pure TypeScript, no external packages
- **Full TypeScript types** — `GematriaResponse`, `CipherResult`, `CipherKey`

### UI (`/` — Analyze page)
- **Cipher Sidebar** — switch between all 6 ciphers with totals at a glance
- **Bar Chart** — visual overview of all cipher values simultaneously
- **Radar Chart** — hexagonal spider chart mapping all 6 cipher values
- **4 detail tabs per cipher:**
  - `Table` — letter-by-letter breakdown with values
  - `Grid` — visual letter grid with per-letter highlights
  - `Glyph` — Hebrew glyph matrix overlay
  - `JSON` — raw API output
- **Numerology Card** — base number with Master Number meaning
- **Search History** — last 12 analyzed words (in-session)
- **Dark / Light mode** toggle
- **Mobile bottom bar** — quick cipher switcher on small screens

### `/compare` page
- Side-by-side comparison of two words across all 6 ciphers
- **Δ column** — absolute difference per cipher
- Numerology summary for both inputs

### REST API
- `POST /api/gematria` — single word analysis
- `POST /api/gematria/batch` — analyze multiple words in one request

---

## Quick Start

```bash
git clone https://github.com/Gzeu/gematria-engine.git
cd gematria-engine
npm install
npm run dev        # http://localhost:3000
npm test           # Jest test suite
npm run build      # production build
```

---

## API Reference

### `POST /api/gematria`

**Request:**
```json
{ "input": "George" }
```

**Response:**
```json
{
  "original_input": "George",
  "ciphers": {
    "english_ordinal":   { "total": 57,  "breakdown": { "G1": 7, "E1": 5, "O": 15, "R": 18, "G2": 7, "E2": 5 }, "matching_words": ["moon", "human"] },
    "english_reduction": { "total": 39,  "breakdown": { ... }, "matching_words": [ ... ] },
    "reverse_ordinal":   { "total": 105, "breakdown": { ... }, "matching_words": [ ... ] },
    "sumerian":          { "total": 342, "breakdown": { ... }, "matching_words": [ ... ] },
    "chaldean":          { "total": 25,  "breakdown": { ... }, "matching_words": [ ... ] },
    "hebrew_standard":   { "total": 286, "breakdown": { ... }, "matching_words": [ ... ] }
  },
  "numerology_summary": "English Ordinal total 57 reduces to 3 — The number 3 vibrates with creativity...",
  "base_number": 3
}
```

### `POST /api/gematria/batch`

**Request:**
```json
{ "inputs": ["fire", "water", "cosmos"] }
```

**Response:**
```json
{ "results": [ { ... }, { ... }, { ... } ] }
```

---

## Project Structure

```
gematria-engine/
├── lib/
│   └── gematria-engine.ts          ← Pure engine, zero dependencies
├── pages/
│   ├── index.tsx                   ← Main analyze UI
│   ├── compare.tsx                 ← Side-by-side comparison page
│   └── api/
│       ├── gematria.ts             ← POST /api/gematria
│       └── gematria/
│           └── batch.ts            ← POST /api/gematria/batch
├── components/
│   ├── CipherSidebar.tsx           ← Cipher selector with totals
│   ├── CipherPanel.tsx             ← Letter breakdown table
│   ├── BarChart.tsx                ← All-ciphers bar chart
│   ├── RadarChart.tsx              ← Hexagonal radar chart
│   ├── LetterGrid.tsx              ← Visual letter grid
│   ├── GlyphMatrix.tsx             ← Hebrew glyph overlay
│   ├── NumerologyCard.tsx          ← Base number & meaning
│   ├── JsonOutput.tsx              ← Raw JSON view
│   ├── SearchHistory.tsx           ← Recent searches
│   └── ThemeToggle.tsx             ← Dark / light mode
├── styles/
│   ├── globals.css                 ← Design tokens & base styles
│   ├── Home.module.css
│   └── *.module.css
├── hooks/
│   └── useGematria.ts              ← React hook
├── __tests__/
│   └── gematria-engine.test.ts     ← Jest test suite
├── jest.config.js
├── tsconfig.json
└── package.json
```

---

## Cipher Reference

| Cipher | Method | Example (A) |
|---|---|---|
| English Ordinal | A=1 … Z=26 | 1 |
| English Reduction | Pythagorean digit sum | 1 |
| Reverse Ordinal | A=26 … Z=1 | 26 |
| Sumerian | Ordinal × 6 | 6 |
| Chaldean | Traditional Chaldean table | 1 |
| Hebrew Standard | Mispar Hechrachi | 1 |

---

## Deploy

```bash
npm i -g vercel
vercel deploy
```

Or connect the repo to [vercel.com](https://vercel.com) for automatic deployments on every push to `main`.

---

## License

MIT
