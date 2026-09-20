import React, { useState } from 'react';
import { 
  Coins, 
  Search, 
  Sparkles, 
  TrendingDown, 
  ShoppingCart, 
  Lightbulb, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { CheaperAlternative } from '../types';

interface CheaperSwapsModalProps {
  onAddToShoppingList: (ingredients: { name: string; amount: string; cheaperSwap?: string }[]) => void;
}

// Shared look, from docs/design-system.md
const CARD = 'bg-white rounded-3xl ring-1 ring-ink/10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55';
const FIELD = 'w-full px-5 py-3 rounded-full bg-cream/60 ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink';
const PILL_DARK = 'rounded-full bg-ink text-cream font-medium hover:bg-ink-soft transition-colors cursor-pointer';

export const CheaperSwapsModal: React.FC<CheaperSwapsModalProps> = ({
  onAddToShoppingList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  // Curated high-impact vegetarian ingredient swaps
  const [swaps, setSwaps] = useState<CheaperAlternative[]>([
    {
      originalIngredient: 'Pine Nuts',
      cheaperAlternative: 'Toasted Raw Sunflower Seeds or Pumpkin Seeds (Pepitas)',
      why: 'Delivers the exact same buttery, nutty fat and crunch for pesto, salads, and pasta at 80% lower cost.',
      savingsTip: 'Toast in a dry skillet over medium heat for 90 seconds until fragrant and golden.',
      estimatedSavingsPercentage: 80,
    },
    {
      originalIngredient: 'Saffron Strands',
      cheaperAlternative: 'Turmeric Pinch + Sweet Smoked Paprika',
      why: 'Gives the luminous golden hue and warm earthy undertone for paella, risotto, and curries.',
      savingsTip: 'Bloom in warm olive oil or plant milk for 3 minutes before stirring in.',
      estimatedSavingsPercentage: 90,
    },
    {
      originalIngredient: 'Artisanal Vegan Cashew Cheese',
      cheaperAlternative: 'Pressed Firm Tofu + Nutritional Yeast + Lemon Juice',
      why: 'Creates rich, velvety ricotta and spreadable cheeses with high protein (20g+) for pennies.',
      savingsTip: 'Crumble firm tofu with a fork, mix with 2 tbsp nutritional yeast, 1 tbsp olive oil, salt, and lemon.',
      estimatedSavingsPercentage: 75,
    },
    {
      originalIngredient: 'Fresh Out-of-Season Berries',
      cheaperAlternative: 'Frozen Berry Medley',
      why: 'Frozen at peak ripeness, richer in antioxidants, zero food waste, and half the price per pound.',
      savingsTip: 'Simmer gently with a splash of maple syrup or chia seeds for instant warm compote.',
      estimatedSavingsPercentage: 50,
    },
    {
      originalIngredient: 'Pre-Cooked Vacuum-Packed Grains / Microwave Rice',
      cheaperAlternative: 'Dry Jasmine / Basmati Rice or Dry Brown Lentils in Bulk',
      why: 'Dry bulk grains cost $0.15 per serving vs $2.50 for single-use plastic pouches.',
      savingsTip: 'Batch cook 4 servings on Sunday and store in airtight glass containers in fridge.',
      estimatedSavingsPercentage: 85,
    },
    {
      originalIngredient: 'Fresh Exotic Mushrooms (Chanterelles, Morels)',
      cheaperAlternative: 'Cremini / Brown Button Mushrooms + Dried Porcini Pinch or Tamari',
      why: 'Delivers deep earthy forest umami without the luxury market markup.',
      savingsTip: 'Sear brown mushrooms hard in a dry pan until caramelized, then finish with soy sauce.',
      estimatedSavingsPercentage: 70,
    },
  ]);

  const handleSearchAlternatives = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    setIsLoading(true);
    setSearchMessage(null);
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 55000);
    try {
      const res = await fetch('/api/cheaper-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ ingredients: [term] }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok || !data) {
        throw new Error(
          data?.error ||
            (res.status === 404
              ? "The swap finder isn't available on this site yet."
              : 'Could not find swaps right now.')
        );
      }
      if (data.alternatives && data.alternatives.length > 0) {
        setSwaps((prev) => [...data.alternatives, ...prev]);
        setSearchTerm('');
      } else {
        setSearchMessage({ kind: 'info', text: `No swaps found for "${term}". Try a more specific ingredient.` });
      }
    } catch (err: any) {
      console.error('Failed to fetch cheaper alternatives:', err);
      setSearchMessage({
        kind: 'error',
        text:
          err?.name === 'AbortError'
            ? 'Gemini took too long to answer. Please try again.'
            : err?.message || 'Could not find swaps right now.',
      });
    } finally {
      clearTimeout(abortTimer);
      setIsLoading(false);
    }
  };

  const handleAddSwap = (swap: CheaperAlternative) => {
    onAddToShoppingList([
      {
        name: swap.cheaperAlternative.split('(')[0].trim(),
        amount: '1 package',
        cheaperSwap: `Replaces ${swap.originalIngredient}: ${swap.savingsTip}`,
      },
    ]);
    setAddedSuccess(swap.cheaperAlternative);
    setTimeout(() => setAddedSuccess(null), 2500);
  };

  return (
    <div id="cheaper-swaps-view" className="space-y-8">
      {/* Header */}
      <div className={`${CARD} p-6 sm:p-7`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cream text-ink flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <h2 className="text-3xl font-normal tracking-[-0.03em] text-ink">
                Cheaper Ingredient Swaps
              </h2>
            </div>
            <p className="text-sm text-ink/60 mt-3 max-w-xl">
              Discover clever, budget-conscious ingredient substitutions for expensive vegetarian recipes without sacrificing depth of flavor or nutritional value.
            </p>
          </div>

          <div className="px-4 py-3 bg-cream rounded-2xl flex items-center gap-3 shrink-0">
            <TrendingDown className="w-5 h-5 text-emerald-700" />
            <div className="text-xs">
              <div className="font-semibold text-ink">Avg. 60–85% Savings</div>
              <div className="text-ink/55">Per recipe batch</div>
            </div>
          </div>
        </div>

        {/* Search custom swap */}
        <form onSubmit={handleSearchAlternatives} className="mt-6 pt-6 border-t border-ink/10 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink/40 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find cheaper alternative for: e.g. Truffle oil, Pine nuts, Macadamia milk, Fresh herbs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-3 rounded-full bg-cream/60 ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <button
            type="submit"
            disabled={!searchTerm.trim() || isLoading}
            className={`px-6 py-3 text-sm shrink-0 flex items-center gap-1.5 disabled:bg-ink/10 disabled:text-ink/35 disabled:cursor-not-allowed ${PILL_DARK}`}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Find Swaps</span>
          </button>
        </form>
      </div>

      {searchMessage && (
        <div
          id="swaps-message"
          className={`p-4 rounded-2xl text-sm ${
            searchMessage.kind === 'error' ? 'bg-rose-50 ring-1 ring-rose-200 text-rose-700' : 'bg-white ring-1 ring-ink/10 text-ink/75'
          }`}
        >
          {searchMessage.text}
        </div>
      )}

      {addedSuccess && (
        <div className="p-4 bg-emerald-50 ring-1 ring-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Added swap to your Shopping List: <strong>{addedSuccess}</strong></span>
        </div>
      )}

      {/* Grid of Swaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {swaps.map((swap, idx) => (
          <div
            key={idx}
            className="bg-white ring-1 ring-ink/10 hover:ring-ink/25 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header: Original vs Alternative */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`${LABEL} block`}>
                    Expensive Ingredient
                  </span>
                  <h3 className="text-xl font-normal tracking-[-0.02em] text-ink mt-1 line-through decoration-ink/40">
                    {swap.originalIngredient}
                  </h3>
                </div>

                {swap.estimatedSavingsPercentage !== undefined && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                    Save ~{swap.estimatedSavingsPercentage}%
                  </span>
                )}
              </div>

              {/* Cheaper Alternative */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-800 block">
                  Delicious Budget Swap
                </span>
                <p className="text-lg font-medium tracking-[-0.02em] text-ink mt-1">
                  {swap.cheaperAlternative}
                </p>
                <p className="text-sm text-ink/65 mt-2 leading-relaxed">
                  {swap.why}
                </p>
              </div>

              {/* Prep Tip */}
              <div className="mt-4 flex items-start gap-2 text-sm text-ink/65">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-ink">Chef's Prep Tip:</strong> {swap.savingsTip}
                </span>
              </div>
            </div>

            {/* Bottom Action: Add to shopping list */}
            <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-end">
              <button
                onClick={() => handleAddSwap(swap)}
                className={`px-4 py-2 text-xs flex items-center gap-1.5 ${PILL_DARK}`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add Swap to Shopping List</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
