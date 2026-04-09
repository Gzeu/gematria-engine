import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeGematria, GematriaResponse } from '@/lib/gematria-engine';

export type BatchResponse = {
  results: Array<GematriaResponse | { error: string; input: string }>;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BatchResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { inputs } = req.body;

  if (!Array.isArray(inputs) || inputs.length === 0) {
    return res.status(400).json({ error: '"inputs" must be a non-empty array.' });
  }

  if (inputs.length > 50) {
    return res.status(400).json({ error: 'Maximum 50 inputs per batch request.' });
  }

  const results = inputs.map((input: any) => {
    if (typeof input !== 'string' || !input.trim()) {
      return { error: 'Invalid input', input: String(input) };
    }
    try {
      return analyzeGematria(input.trim());
    } catch (err: any) {
      return { error: err.message, input };
    }
  });

  return res.status(200).json({ results });
}
