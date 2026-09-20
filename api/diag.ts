// TEMPORARY diagnostic: measures how reliably each Gemini model answers. Never returns the key. Delete after use.
import { GoogleGenAI } from '@google/genai';

export default async function handler(_req: any, res: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(200).json({ error: 'no key' });
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  const models = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
  const out: any = {};
  await Promise.all(
    models.map(async (model) => {
      const results: string[] = [];
      const times: number[] = [];
      for (let i = 0; i < 4; i++) {
        const t0 = Date.now();
        try {
          await ai.models.generateContent({ model, contents: 'Reply with the single word: ok' });
          results.push('ok');
        } catch (err: any) {
          results.push(String(err?.status ?? 'err') + (err?.status === 429 ? ':' + String(err?.message || '').replace(/\s+/g, ' ').slice(0, 200) : ''));
        }
        times.push(Date.now() - t0);
      }
      out[model] = { results, ms: times };
    })
  );
  res.status(200).json(out);
}
