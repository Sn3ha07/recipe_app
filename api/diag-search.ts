// TEMPORARY diagnostic: tries Google Search grounding on each model. Never returns the key. Delete after use.
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export default async function handler(_req: any, res: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { res.status(200).json({ error: 'no key' }); return; }
  const ai = new GoogleGenAI({ apiKey });
  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
  const prompt = 'Use Google Search to find 2 real vegetarian tofu and spinach recipes online. Return ONLY a JSON array of objects with title, sourceName, sourceUrl.';
  const out: any = {};
  await Promise.all(models.map(async (model) => {
    const variants: any = {
      tools_only: { tools: [{ googleSearch: {} }] },
      tools_low_thinking: { tools: [{ googleSearch: {} }], thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
    };
    out[model] = {};
    for (const [name, config] of Object.entries(variants)) {
      const t0 = Date.now();
      try {
        const r: any = await ai.models.generateContent({ model, contents: prompt, config: config as any });
        const g = r?.candidates?.[0]?.groundingMetadata;
        out[model][name] = { ok: true, ms: Date.now() - t0, chunks: (g?.groundingChunks || []).length, sites: (g?.groundingChunks || []).slice(0, 4).map((c: any) => c?.web?.title), queries: g?.webSearchQueries, textHead: String(r.text || '').slice(0, 160).replace(/\s+/g, ' ') };
      } catch (err: any) {
        out[model][name] = { ok: false, ms: Date.now() - t0, status: err?.status, message: String(err?.message || '').replace(/\s+/g, ' ').slice(0, 260) };
      }
    }
  }));
  res.status(200).json(out);
}
