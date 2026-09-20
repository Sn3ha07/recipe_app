import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

// Runs on Vercel as /api/suggest-recipes, and is mounted by server.ts for local use.

// Models to try in order. Each has its own free allowance, and any of them can be busy, so we move on to the next.
const DEFAULT_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
const MODELS = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL, ...DEFAULT_MODELS] : DEFAULT_MODELS;
const PER_MODEL_MS = 25000;
const TOTAL_MS = 45000;
const MOVE_ON_STATUSES = [404, 429, 500, 503, 504];

export async function askWithFallback(ai: GoogleGenAI, request: any): Promise<any> {
  const started = Date.now();
  const failures: any[] = [];
  for (const model of MODELS) {
    const remaining = TOTAL_MS - (Date.now() - started);
    if (remaining < 4000) break;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const call = ai.models.generateContent({ model, ...request });
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject({ status: 504, message: 'timeout' }), Math.min(PER_MODEL_MS, remaining));
      });
      return await Promise.race([call, timeout]);
    } catch (err: any) {
      failures.push(err);
      console.error(`model ${model} failed:`, err?.status ?? '', String(err?.message || '').slice(0, 120));
      if (!MOVE_ON_STATUSES.includes(err?.status)) throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw (
    failures.find((f) => f?.status === 429) ??
    failures.find((f) => f?.status === 503) ??
    failures.find((f) => f?.status === 504) ??
    failures[failures.length - 1] ??
    new Error('no model available')
  );
}

class PublicError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const clean = (v: unknown, max = 80) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
const cleanList = (v: unknown, max = 20) =>
  Array.isArray(v) ? v.slice(0, max).map((x) => clean(x, 40)).filter(Boolean) : [];

export function buildPrompt(body: any): string {
  const inventory: any[] = Array.isArray(body?.inventory) ? body.inventory.slice(0, 60) : [];
  const preferences = body?.preferences || {};
  const focusExpiring = Boolean(body?.focusExpiring);

  const inventoryList = inventory
    .map((item) => {
      const days = Number.isFinite(item?.daysLeft) ? item.daysLeft : undefined;
      return `${clean(item?.name, 60)} (${clean(item?.quantity, 40) || 'some'}, ${
        days !== undefined ? `${days} days left` : 'fresh'
      }${days !== undefined && days <= 3 ? ' - EXPIRING SOON!' : ''})`;
    })
    .filter((s) => !s.startsWith(' ('))
    .join(', ');

  const dietary = clean(preferences.dietaryNuance, 40) || 'pure_vegetarian';
  const budgetTier = clean(preferences.budgetTier, 20) || 'everyday';
  const maxTime = Number.isFinite(preferences.cookingTimeMax) ? preferences.cookingTimeMax : 40;
  const cuisines = cleanList(preferences.cuisinePreferences).join(', ') || 'Diverse global comfort & fresh flavours';
  const dislikes = cleanList(preferences.allergiesOrDislikes).join(', ') || 'None specified';
  const customQuery = clean(preferences.customQuery, 200)
    ? `User specifically asked for: "${clean(preferences.customQuery, 200)}". Prioritize this request.`
    : '';

  return `You are an expert vegetarian chef and food-waste prevention specialist.
Generate 4 inspiring, delicious, 100% VEGETARIAN recipes tailored to the user's available ingredients and preferences.

Available ingredients in the user's fridge/pantry:
${inventoryList || 'Assorted vegetables, tofu, greens, spices, and grains'}

${customQuery}

User Preferences:
- Dietary constraint: ${dietary} (All recipes MUST be strictly vegetarian. If vegan: no dairy/eggs/honey. If jain: no root vegetables, onions, or garlic. If gluten_free: strictly gluten-free ingredients.)
- Budget Level: ${budgetTier} (${budgetTier === 'budget' ? 'Maximize inexpensive pantry staples and cheap swaps' : budgetTier === 'gourmet' ? 'Elevated culinary technique and restaurant-style presentation' : 'Accessible everyday balanced cooking'})
- Maximum Cooking Time: ${maxTime} minutes
- Preferred Cuisines: ${cuisines}
- Allergies / Dislikes: ${dislikes} (never include these)
- Urgent Focus: ${focusExpiring ? 'PRIORITIZE USING UP THE INGREDIENTS MARKED AS EXPIRING SOON TO PREVENT SPOILAGE!' : 'Balance fridge ingredients with great flavor'}

Crucial Requirements:
1. Maximize use of items already in the fridge.
2. Explicitly note which items from the user's fridge are used in 'usedFridgeIngredients'.
3. Highlight any 'expiringItemsSaved'.
4. In 'additionalIngredientsNeeded', list any ingredients required that are NOT in the fridge.
5. Provide budget-conscious 'cheaperAlternatives'.
6. Numbered step-by-step instructions.`;
}

export const RECIPE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      prepTimeMinutes: { type: Type.INTEGER },
      cookTimeMinutes: { type: Type.INTEGER },
      servings: { type: Type.INTEGER },
      difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Advanced'] },
      cuisine: { type: Type.STRING },
      budgetTier: { type: Type.STRING, enum: ['budget', 'everyday', 'gourmet'] },
      usedFridgeIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
      expiringItemsSaved: { type: Type.ARRAY, items: { type: Type.STRING } },
      additionalIngredientsNeeded: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            amount: { type: Type.STRING },
            estimatedCost: { type: Type.STRING },
            optional: { type: Type.BOOLEAN },
          },
          required: ['name', 'amount'],
        },
      },
      cheaperAlternatives: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            originalIngredient: { type: Type.STRING },
            cheaperAlternative: { type: Type.STRING },
            why: { type: Type.STRING },
            savingsTip: { type: Type.STRING },
          },
          required: ['originalIngredient', 'cheaperAlternative', 'why', 'savingsTip'],
        },
      },
      instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
      nutritionHighlights: { type: Type.STRING },
      relatedRecipeLinks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            query: { type: Type.STRING },
            whyTry: { type: Type.STRING },
            suggestedSource: { type: Type.STRING },
          },
          required: ['title', 'query', 'whyTry'],
        },
      },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: [
      'title',
      'description',
      'prepTimeMinutes',
      'cookTimeMinutes',
      'servings',
      'difficulty',
      'cuisine',
      'usedFridgeIngredients',
      'instructions',
    ],
  },
};

export function formatRecipes(parsed: any): any[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((r) => r && typeof r.title === 'string' && Array.isArray(r.instructions) && r.instructions.length > 0)
    .map((r, idx) => {
      const needed = Array.isArray(r.additionalIngredientsNeeded) ? r.additionalIngredientsNeeded : [];
      let missingNotice: string | undefined;
      if (needed.length === 1) {
        missingNotice = `Requires 1 more ingredient to make this dish: ${needed[0].name}`;
      } else if (needed.length > 1) {
        missingNotice = `Requires ${needed.length} more ingredients to make this dish: ${needed.map((a: any) => a.name).join(', ')}`;
      }
      return {
        ...r,
        id: r.id || `recipe-${Date.now()}-${idx}`,
        usedFridgeIngredients: Array.isArray(r.usedFridgeIngredients) ? r.usedFridgeIngredients : [],
        expiringItemsSaved: Array.isArray(r.expiringItemsSaved) ? r.expiringItemsSaved : [],
        additionalIngredientsNeeded: needed,
        missingIngredientsCount: needed.length,
        missingIngredientsRequiredNotice: missingNotice,
      };
    });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "The AI helper isn't set up yet: the Gemini key is missing." });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response: any = await askWithFallback(ai, {
      contents: buildPrompt(req.body || {}),
      config: {
        responseMimeType: 'application/json',
        responseSchema: RECIPE_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    let parsed: any;
    try {
      parsed = JSON.parse(response.text || '[]');
    } catch {
      throw new PublicError(502, 'Gemini sent an answer the app could not read.');
    }

    const recipes = formatRecipes(parsed);
    if (recipes.length === 0) {
      throw new PublicError(502, 'Gemini did not return any usable recipes.');
    }
    res.status(200).json({ recipes });
  } catch (err: any) {
    console.error('suggest-recipes failed:', err?.status ?? '', err?.message);
    if (err instanceof PublicError) {
      res.status(err.status).json({ error: err.message });
    } else if (err?.status === 504) {
      res.status(504).json({ error: 'Gemini took too long to answer. Please try again.' });
    } else if (err?.status === 429) {
      res.status(429).json({ error: 'Gemini is busy or the free quota is used up. Please try again in a minute.' });
    } else if (err?.status === 503) {
      res.status(503).json({ error: 'Gemini is very busy right now. Please try again in a moment.' });
    } else if (err?.status === 400 || err?.status === 401 || err?.status === 403) {
      res.status(502).json({ error: 'Gemini did not accept the key. Check that it is valid and allowed to use the Gemini API.' });
    } else if (err?.status === 404) {
      res.status(502).json({ error: 'Gemini no longer offers the model this app asks for.' });
    } else {
      res.status(502).json({ error: 'Could not get recipes from Gemini right now.' });
    }
  }
}
