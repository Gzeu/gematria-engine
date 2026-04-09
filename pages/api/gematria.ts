import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeGematria, GematriaResponse } from '@/lib/gematria-engine';

export type ApiError = { error: string };
export type ApiResponse = GematriaResponse | ApiError;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { input } = req.body;

  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid "input" field.' });
  }

  try {
    const result = analyzeGematria(input.trim());
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(422).json({ error: err.message || 'Analysis failed.' });
  }
}
