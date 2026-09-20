// TEMPORARY diagnostic: shows the full quota message for Google Search grounding, plus a plain call for comparison. Never returns the key. Delete after use.
import { GoogleGenAI } from '@google/genai';

export default async function handler(_req: any, res: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { res.status(200).json({ error: 'no key' }); return; }
  const ai = new GoogleGenAI({ apiKey });
  const out: any = {};
  for (const [name, config] of Object.entries({ plain: {}, with_google_search: { tools: [{ googleSearch: {} }] } } as any)) {
    try {
      const r: any = await ai.models.generateContent({ model: 'gemini-3.5-flash-lite', contents: 'Reply with the single word: ok', config });
      out[name] = { ok: true, text: String(r.text || '').slice(0, 40), grounded: !!r?.candidates?.[0]?.groundingMetadata };
    } catch (err: any) {
      out[name] = { ok: false, status: err?.status, message: String(err?.message || '').replace(/\s+/g, ' ').slice(0, 1500) };
    }
  }
  res.status(200).json(out);
}
