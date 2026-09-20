import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

// Runs on Vercel as /api/suggest-recipes, and is mounted by server.ts for local use.

// Models to try in order. Each has its own free allowance, and any of them can be busy, so we move on to the next.
const DEFAULT_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
const MODELS = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL, ...DEFAULT_MODELS] : DEFAULT_MODELS;
const PER_MODEL_MS = 30000;
const TOTAL_MS = 52000; // Vercel stops the function at 60 seconds
const GROUNDED_MS = 34000; // the Google Search attempt gets this long, so a plain attempt can still follow
const MOVE_ON_STATUSES = [404, 429, 500, 503, 504];

export async function askWithFallback(
  ai: GoogleGenAI,
  request: any,
  opts: { deadline?: number; moveOn?: number[] } = {}
): Promise<any> {
  const deadline = opts.deadline ?? Date.now() + TOTAL_MS;
  const moveOn = opts.moveOn ?? MOVE_ON_STATUSES;
  const failures: any[] = [];
  for (const model of MODELS) {
    const remaining = deadline - Date.now();
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
      if (!moveOn.includes(err?.status)) throw err;
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

// ---------------------------------------------------------------------------
// Recipes the person already has, and telling near-duplicates apart
// ---------------------------------------------------------------------------

interface Fingerprint {
  title: string;
  cuisine: string;
  ingredients: string[];
}

export function normalizeExisting(body: any): Fingerprint[] {
  const rich: Fingerprint[] = (Array.isArray(body?.alreadyShown) ? body.alreadyShown : [])
    .slice(0, 24)
    .map((e: any) => ({ title: clean(e?.title, 80), cuisine: clean(e?.cuisine, 40), ingredients: cleanList(e?.ingredients) }))
    .filter((e: Fingerprint) => e.title);
  if (rich.length) return rich;
  return (Array.isArray(body?.excludeTitles) ? body.excludeTitles : [])
    .slice(0, 24)
    .map((t: unknown) => ({ title: clean(t, 80), cuisine: '', ingredients: [] as string[] }))
    .filter((e: Fingerprint) => e.title);
}

const TITLE_STOP = new Set(
  ('and with the for style easy quick simple best one pot vegan vegetarian veggie healthy homemade classic creamy crispy spicy golden ' +
    'fresh roasted baked sweet savory hearty loaded ultimate delicious flavorful rustic smoky zesty warm cozy instant fast minute minutes recipe free').split(' ')
);
const INGREDIENT_STOP = new Set(
  ('fresh chopped extra firm baby organic raw large small ripe frozen canned dried whole sliced diced minced ground salt pepper oil water sugar flour ' +
    'garlic onion butter olive lemon lime spice spices seasoning sauce paste cup cups tbsp tsp').split(' ')
);
const DISH_TYPES = [
  'curry', 'pasta', 'stir fry', 'stirfry', 'soup', 'stew', 'salad', 'taco', 'wrap', 'bowl', 'skillet', 'scramble', 'burrito', 'fajita', 'pizza',
  'sandwich', 'burger', 'fritter', 'dumpling', 'noodle', 'risotto', 'casserole', 'bake', 'pie', 'tart', 'omelette', 'omelet', 'frittata', 'chili',
  'dal', 'tikka', 'masala', 'kebab', 'skewer', 'ramen', 'pilaf', 'fried rice', 'quesadilla', 'pancake', 'patty', 'cutlet', 'shakshuka', 'gratin',
  'lasagna', 'enchilada', 'paella', 'biryani', 'sushi', 'pad thai',
];

const singular = (w: string) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
const titleTokens = (title: string) => new Set(words(title).filter((w) => w.length > 2 && !TITLE_STOP.has(w)).map(singular));
const dishTypes = (title: string) => {
  const t = ' ' + words(title).join(' ') + ' ';
  return new Set(DISH_TYPES.filter((d) => t.includes(' ' + d + ' ') || t.includes(' ' + d + 's ')).map((d) => (d === 'stirfry' ? 'stir fry' : d)));
};
const ingredientTokens = (list: string[]) =>
  new Set(list.flatMap((i) => words(i)).filter((w) => w.length > 2 && !INGREDIENT_STOP.has(w)).map(singular));
const overlap = (a: Set<string>, b: Set<string>) => [...a].filter((x) => b.has(x)).length;
const jaccard = (a: Set<string>, b: Set<string>) => (a.size + b.size === 0 ? 0 : overlap(a, b) / (a.size + b.size - overlap(a, b)));

export function isNearDuplicate(a: Fingerprint, b: Fingerprint): boolean {
  // 1. Titles that share most of their words ("Tofu Spinach Curry" / "Creamy Spinach and Tofu Curry")
  if (jaccard(titleTokens(a.title), titleTokens(b.title)) >= 0.5) return true;
  // 2. The same kind of dish built from the same main ingredients
  const da = dishTypes(a.title);
  const db = dishTypes(b.title);
  const ia = ingredientTokens(a.ingredients);
  const ib = ingredientTokens(b.ingredients);
  if ([...da].some((d) => db.has(d)) && overlap(ia, ib) >= 2) return true;
  // 3. The same cuisine with almost the same ingredient list
  if (a.cuisine && a.cuisine.toLowerCase() === b.cuisine.toLowerCase() && ia.size >= 3 && jaccard(ia, ib) >= 0.75) return true;
  return false;
}

export function dedupeRecipes(candidates: any[], existing: Fingerprint[]): any[] {
  const print = (r: any): Fingerprint => ({
    title: String(r.title || ''),
    cuisine: String(r.cuisine || ''),
    ingredients: [...(r.usedFridgeIngredients || []), ...(r.additionalIngredientsNeeded || []).map((a: any) => a?.name || '')].map(String),
  });
  const kept: any[] = [];
  for (const c of candidates) {
    const fp = print(c);
    if (existing.some((e) => isNearDuplicate(fp, e))) continue;
    if (kept.some((k) => isNearDuplicate(fp, print(k)))) continue;
    kept.push(c);
  }
  return kept;
}

// ---------------------------------------------------------------------------
// The instructions for the AI
// ---------------------------------------------------------------------------

export function buildPrompt(body: any, opts: { grounded?: boolean; ask?: number } = {}): string {
  const grounded = Boolean(opts.grounded);
  const ask = opts.ask ?? 4;
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

  const existing = normalizeExisting(body);
  const alreadyShown = existing.length
    ? `\nThe user already has these recipes. Do NOT repeat any of them, and do not write the same dish again under a different name or with slightly different ingredients:\n${existing
        .map((e) => `- ${e.title}${e.cuisine ? ` (${e.cuisine})` : ''}`)
        .join('\n')}\n`
    : '';

  const variety = `Variety rules: all ${ask} recipes must be clearly different dishes. Never give two of the same dish type (for example two curries, two pastas or two stir-fries), never give the same dish under two names, and use as many different cuisines as the ingredients allow.`;

  const context = `Available ingredients in the user's fridge/pantry:
${inventoryList || 'Assorted vegetables, tofu, greens, spices, and grains'}

${customQuery}
${alreadyShown}
User Preferences:
- Dietary constraint: ${dietary} (All recipes MUST be strictly vegetarian. If vegan: no dairy/eggs/honey. If jain: no root vegetables, onions, or garlic. If gluten_free: strictly gluten-free ingredients.)
- Budget Level: ${budgetTier} (${budgetTier === 'budget' ? 'Maximize inexpensive pantry staples and cheap swaps' : budgetTier === 'gourmet' ? 'Elevated culinary technique and restaurant-style presentation' : 'Accessible everyday balanced cooking'})
- Maximum Cooking Time: ${maxTime} minutes
- Preferred Cuisines: ${cuisines}
- Allergies / Dislikes: ${dislikes} (never include these)
- Urgent Focus: ${focusExpiring ? 'PRIORITIZE USING UP THE INGREDIENTS MARKED AS EXPIRING SOON TO PREVENT SPOILAGE!' : 'Balance fridge ingredients with great flavor'}`;

  if (!grounded) {
    return `You are an expert vegetarian chef and food-waste prevention specialist.
Generate ${ask} inspiring, delicious, 100% VEGETARIAN recipes tailored to the user's available ingredients and preferences.

${context}

${variety}

Crucial Requirements:
1. Maximize use of items already in the fridge.
2. Explicitly note which items from the user's fridge are used in 'usedFridgeIngredients'.
3. Highlight any 'expiringItemsSaved'.
4. In 'additionalIngredientsNeeded', list any ingredients required that are NOT in the fridge.
5. Provide budget-conscious 'cheaperAlternatives'.
6. Numbered step-by-step instructions.`;
  }

  return `You are an expert vegetarian chef and food-waste prevention specialist.
Use Google Search to find ${ask} REAL, existing 100% VEGETARIAN recipes that were published online (on recipe websites, food blogs or food publications) and that suit the user's ingredients and preferences.

${context}

${variety}

Rules for each recipe:
1. It must be based on one specific real recipe you found with Google Search. Do not invent recipes.
2. Credit the original: "sourceName" is the website or publication name, "sourceCreator" is the author's name only if it appears on the page (otherwise an empty string), and "sourceUrl" is the exact web address of that recipe page.
3. Write the description and the numbered steps in your OWN words. Never copy sentences from the page. Keep the dish recognizable, and note any changes you made to suit the user's fridge.
4. Maximize use of items already in the fridge. List them in 'usedFridgeIngredients', highlight 'expiringItemsSaved', and list everything else the dish needs in 'additionalIngredientsNeeded'.
5. Add budget-conscious 'cheaperAlternatives'.

Return ONLY a JSON array (no markdown fences, no commentary). Each item must have exactly these fields:
id (string), title (string), description (string), prepTimeMinutes (integer), cookTimeMinutes (integer), servings (integer), difficulty ("Easy" | "Medium" | "Advanced"), cuisine (string), budgetTier ("budget" | "everyday" | "gourmet"), usedFridgeIngredients (array of strings), expiringItemsSaved (array of strings), additionalIngredientsNeeded (array of {name, amount, estimatedCost, optional}), cheaperAlternatives (array of {originalIngredient, cheaperAlternative, why, savingsTip}), instructions (array of strings), nutritionHighlights (string), tags (array of strings), sourceName (string), sourceCreator (string), sourceUrl (string).`;
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

// ---------------------------------------------------------------------------
// Reading the AI's answer, and checking the credits against what Google Search really returned
// ---------------------------------------------------------------------------

export function parseRecipeJson(text: string): any[] {
  const t = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    const v = JSON.parse(t);
    return Array.isArray(v) ? v : Array.isArray(v?.recipes) ? v.recipes : [];
  } catch {
    const a = t.indexOf('[');
    const b = t.lastIndexOf(']');
    if (a >= 0 && b > a) {
      try {
        const v = JSON.parse(t.slice(a, b + 1));
        return Array.isArray(v) ? v : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}

export interface GroundingChunk {
  uri: string; // a Google link that opens the page
  site: string; // the site's domain, when Google gives it (for example "minimalistbaker.com")
  title: string; // the page's title
}

export function readGrounding(response: any): { chunks: GroundingChunk[]; queries: string[] } {
  const g = response?.candidates?.[0]?.groundingMetadata;
  const chunks: GroundingChunk[] = (Array.isArray(g?.groundingChunks) ? g.groundingChunks : [])
    .map((c: any) => c?.web)
    .filter((w: any) => w && typeof w.uri === 'string' && w.uri)
    .map((w: any) => {
      const title = String(w.title || '').toLowerCase();
      const looksLikeDomain = /^[a-z0-9.-]+\.[a-z]{2,}$/.test(title);
      return {
        uri: String(w.uri),
        site: String(w.domain || (looksLikeDomain ? title : '')).toLowerCase().replace(/^www\./, ''),
        title,
      };
    });
  const queries = (Array.isArray(g?.webSearchQueries) ? g.webSearchQueries : []).slice(0, 6).map((q: unknown) => clean(q, 100)).filter(Boolean);
  return { chunks, queries };
}

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function resolveSource(r: any, chunks: GroundingChunk[]): { name: string; creator?: string; url: string } | undefined {
  if (!chunks.length) return undefined;
  const name = clean(r?.sourceName, 80);
  const creator = clean(r?.sourceCreator, 80);
  let host = '';
  let modelUrl = '';
  try {
    const u = new URL(String(r?.sourceUrl || '').trim());
    if (u.protocol === 'https:' || u.protocol === 'http:') {
      host = u.hostname.replace(/^www\./, '').toLowerCase();
      modelUrl = u.toString();
    }
  } catch {
    /* no usable address */
  }
  const sameSite = (domain: string) => Boolean(domain && host && (host === domain || host.endsWith('.' + domain) || domain.endsWith('.' + host)));
  const byUrl = chunks.find((c) => sameSite(c.site));
  const byName = name
    ? chunks.find(
        (c) =>
          (c.site && squash(name).includes(squash(c.site.split('.')[0]) || '~')) ||
          (c.title && squash(name).length >= 4 && squash(c.title).includes(squash(name)))
      )
    : undefined;
  const match = byUrl || byName;
  if (!match) return undefined; // Google did not return this site, so the credit cannot be trusted
  return {
    name: name || match.site || match.title,
    creator: creator || undefined,
    url: byUrl && modelUrl ? modelUrl : match.uri,
  };
}

export function formatRecipes(parsed: any, chunks?: GroundingChunk[]): any[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((r) => r && typeof r.title === 'string' && Array.isArray(r.instructions) && r.instructions.length > 0)
    .map((r, idx) => {
      const { sourceName, sourceCreator, sourceUrl, ...rest } = r;
      const needed = Array.isArray(r.additionalIngredientsNeeded) ? r.additionalIngredientsNeeded : [];
      let missingNotice: string | undefined;
      if (needed.length === 1) {
        missingNotice = `Requires 1 more ingredient to make this dish: ${needed[0].name}`;
      } else if (needed.length > 1) {
        missingNotice = `Requires ${needed.length} more ingredients to make this dish: ${needed.map((a: any) => a.name).join(', ')}`;
      }
      const source = chunks ? resolveSource(r, chunks) : undefined;
      return {
        ...rest,
        id: r.id || `recipe-${Date.now()}-${idx}`,
        usedFridgeIngredients: Array.isArray(r.usedFridgeIngredients) ? r.usedFridgeIngredients : [],
        expiringItemsSaved: Array.isArray(r.expiringItemsSaved) ? r.expiringItemsSaved : [],
        additionalIngredientsNeeded: needed,
        missingIngredientsCount: needed.length,
        missingIngredientsRequiredNotice: missingNotice,
        ...(source ? { source } : {}),
      };
    });
}

// ---------------------------------------------------------------------------
// Putting it together
// ---------------------------------------------------------------------------

export async function generateRecipes(
  ai: GoogleGenAI,
  body: any
): Promise<{ recipes: any[]; searchQueries: string[]; grounded: boolean }> {
  const started = Date.now();
  const existing = normalizeExisting(body);
  const ask = existing.length ? 6 : 4; // ask for extras when adding more, then keep the 4 that are truly different

  if (body?.withSources === true) {
    try {
      const response = await askWithFallback(
        ai,
        {
          contents: buildPrompt(body, { grounded: true, ask }),
          config: { tools: [{ googleSearch: {} }], thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
        },
        { deadline: started + GROUNDED_MS, moveOn: [...MOVE_ON_STATUSES, 400] }
      );
      const { chunks, queries } = readGrounding(response);
      const recipes = dedupeRecipes(formatRecipes(parseRecipeJson(response.text || ''), chunks), existing).slice(0, 4);
      if (recipes.length > 0) return { recipes, searchQueries: queries, grounded: true };
      console.error('grounded attempt gave no usable recipes');
    } catch (err: any) {
      console.error('grounded attempt failed:', err?.status ?? '', String(err?.message || '').slice(0, 160));
    }
  }

  const response = await askWithFallback(
    ai,
    {
      contents: buildPrompt(body, { grounded: false, ask }),
      config: {
        responseMimeType: 'application/json',
        responseSchema: RECIPE_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    },
    { deadline: started + TOTAL_MS }
  );

  let parsed: any;
  try {
    parsed = JSON.parse(response.text || '[]');
  } catch {
    throw new PublicError(502, 'Gemini sent an answer the app could not read.');
  }

  const recipes = dedupeRecipes(formatRecipes(parsed), existing).slice(0, 4);
  if (recipes.length === 0) {
    throw new PublicError(
      502,
      existing.length ? 'Gemini only sent recipes you already have. Try again for different ideas.' : 'Gemini did not return any usable recipes.'
    );
  }
  return { recipes, searchQueries: [], grounded: false };
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
    res.status(200).json(await generateRecipes(ai, req.body || {}));
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
