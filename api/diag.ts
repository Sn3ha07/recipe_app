// TEMPORARY diagnostic: lists Gemini models and Google's raw error text. Never returns the key. Delete after use.
import { GoogleGenAI } from '@google/genai';

export default async function handler(_req: any, res: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(200).json({ error: 'no key' });
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  const out: any = { models: [], tests: [] };
  try {
    const pager: any = await ai.models.list({ config: { pageSize: 100 } });
    for await (const m of pager) {
      const actions = m.supportedActions || [];
      if (actions.includes('generateContent') && /gemini/i.test(m.name || '')) out.models.push(String(m.name).replace('models/', ''));
    }
  } catch (err: any) {
    out.listError = `${err?.status ?? ''} ${String(err?.message || '').slice(0, 300)}`;
  }
  const candidates = out.models.filter((n: string) => /flash|lite/i.test(n) && !/image|tts|live|audio|embedding|robotics/i.test(n)).slice(0, 8);
  for (const model of candidates) {
    try {
      await ai.models.generateContent({ model, contents: 'Reply with the single word: ok' });
      out.tests.push({ model, result: 'ok' });
    } catch (err: any) {
      out.tests.push({ model, result: `${err?.status ?? ''} ${String(err?.message || '').replace(/\s+/g, ' ').slice(0, 350)}` });
    }
  }
  res.status(200).json(out);
}
