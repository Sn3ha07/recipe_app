// TEMPORARY diagnostic: runs the real recipe and receipt jobs on candidate models. Never returns the key. Delete after use.
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { buildPrompt, RECIPE_SCHEMA } from './suggest-recipes.js';
import { PROMPT, ITEM_SCHEMA } from './scan-receipt.js';

export default async function handler(_req: any, res: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(200).json({ error: 'no key' });
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.6-flash'];
  const recipePrompt = buildPrompt({ inventory: [{ name: 'Baby Spinach', quantity: '1 bag', daysLeft: 1 }, { name: 'Tofu', quantity: '400g', daysLeft: 2 }, { name: 'Bell Peppers', quantity: '2', daysLeft: 6 }], preferences: { dietaryNuance: 'vegan', budgetTier: 'budget', cookingTimeMax: 30 }, focusExpiring: true });
  const receiptPrompt = `${PROMPT}\n\nReceipt text:\n1 Firm Tofu 400g 2.99\n2 Baby Spinach tub 6.98\n1 Oat Milk 1L 3.99\n1 Chicken Breast 1lb 7.49\n1 Dish Soap 3.99`;
  const out: any = {};
  await Promise.all(
    models.map(async (model) => {
      out[model] = {};
      for (const [job, contents, schema] of [['receipt', receiptPrompt, ITEM_SCHEMA], ['recipes', recipePrompt, RECIPE_SCHEMA]] as any[]) {
        const t0 = Date.now();
        try {
          const r: any = await ai.models.generateContent({ model, contents, config: { responseMimeType: 'application/json', responseSchema: schema, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } });
          const parsed = JSON.parse(r.text || '[]');
          out[model][job] = `ok ${Array.isArray(parsed) ? parsed.length : '?'} results in ${((Date.now() - t0) / 1000).toFixed(1)}s` + (job === 'receipt' ? ' -> ' + parsed.map((p: any) => p.name).join(', ') : '');
        } catch (err: any) {
          out[model][job] = `FAIL ${err?.status ?? ''} ${String(err?.message || '').replace(/\s+/g, ' ').slice(0, 160)}`;
        }
      }
    })
  );
  res.status(200).json(out);
}
