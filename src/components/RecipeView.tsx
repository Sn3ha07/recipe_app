import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  ChefHat,
  Flame,
  Bookmark,
  BookmarkCheck,
  ShoppingCart,
  Coins,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Recipe, FridgeItem, UserPreferences } from '../types';
import { RecipeDetailModal } from './RecipeDetailModal';

interface RecipeViewProps {
  recipes: Recipe[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onGenerateRecipes: (focusExpiring: boolean, customQuery?: string, selectedIngredients?: string[]) => void;
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  onAddToShoppingList: (ingredients: { name: string; amount: string; cheaperSwap?: string }[]) => void;
  fridgeItems: FridgeItem[];
  preferences: UserPreferences;
  onOpenPreferences: () => void;
  selectedCookingIngredients?: string[];
  onClearCookingIngredients?: () => void;
}

// Shared look, from docs/design-system.md
const CARD = 'bg-white rounded-3xl ring-1 ring-ink/10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55';
const FIELD = 'w-full pl-12 pr-5 py-3 rounded-full bg-cream/60 ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink';
const PILL_DARK = 'rounded-full bg-ink text-cream font-medium hover:bg-ink-soft transition-colors cursor-pointer';
const filterPill = (active: boolean, idle = 'bg-white text-ink/75 ring-1 ring-ink/10 hover:bg-cream') =>
  `px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
    active ? 'bg-ink text-cream' : idle
  }`;

export const RecipeView: React.FC<RecipeViewProps> = ({
  recipes,
  isLoading,
  error,
  onRetry,
  onGenerateRecipes,
  favorites,
  onToggleFavorite,
  onAddToShoppingList,
  fridgeItems,
  preferences,
  onOpenPreferences,
  selectedCookingIngredients = [],
  onClearCookingIngredients,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [customSearch, setCustomSearch] = useState('');

  const expiringCount = fridgeItems.filter((i) => i.estimatedDays <= 3).length;
  const favoriteIds = new Set(favorites.map((f) => f.id || f.title));

  // Categorize recipes by missing ingredient status
  const readyToCookRecipes = recipes.filter(
    (r) => (r.missingIngredientsCount === 0 || (!r.additionalIngredientsNeeded || r.additionalIngredientsNeeded.length === 0))
  );
  const needOneIngredientRecipes = recipes.filter(
    (r) => (r.missingIngredientsCount === 1 || r.additionalIngredientsNeeded?.length === 1)
  );
  const needMultipleIngredientsRecipes = recipes.filter(
    (r) => ((r.missingIngredientsCount || 0) > 1 || (r.additionalIngredientsNeeded && r.additionalIngredientsNeeded.length > 1))
  );

  const filteredRecipes = recipes.filter((r) => {
    const missingCount = r.missingIngredientsCount !== undefined
      ? r.missingIngredientsCount
      : (r.additionalIngredientsNeeded?.length || 0);

    if (filterTag === 'ready-now') return missingCount === 0;
    if (filterTag === 'need-one') return missingCount === 1;
    if (filterTag === 'need-multiple') return missingCount > 1;
    if (filterTag === 'quick') return (r.prepTimeMinutes + r.cookTimeMinutes) <= 25;
    if (filterTag === 'budget') return r.budgetTier === 'budget';
    if (filterTag === 'saved-expiring') return (r.expiringItemsSaved && r.expiringItemsSaved.length > 0);
    return true;
  });

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    onGenerateRecipes(false, customSearch.trim(), selectedCookingIngredients);
  };

  const handleAddAllMissing = (recipe: Recipe) => {
    if (!recipe.additionalIngredientsNeeded) return;
    const items = recipe.additionalIngredientsNeeded.map((ing) => {
      const swap = recipe.cheaperAlternatives?.find(
        (alt) => alt.originalIngredient.toLowerCase().includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(alt.originalIngredient.toLowerCase())
      );
      return {
        name: ing.name,
        amount: ing.amount,
        cheaperSwap: swap ? `${swap.cheaperAlternative} (${swap.savingsTip})` : undefined,
      };
    });
    onAddToShoppingList(items);
  };

  return (
    <div id="recipes-view" className="space-y-8">
      {/* Active Ingredient Selection Banner (When user cooks with specific fridge items) */}
      {selectedCookingIngredients.length > 0 && (
        <div className={`${CARD} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in`}>
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-ink text-cream flex items-center justify-center shrink-0">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <p className={LABEL}>
                Finding recipes for your ingredients
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {selectedCookingIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-cream text-ink"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => onGenerateRecipes(false, undefined, selectedCookingIngredients)}
              disabled={isLoading}
              className={`px-4 py-2 text-xs flex items-center gap-1.5 ${PILL_DARK}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh for These</span>
            </button>
            {onClearCookingIngredients && (
              <button
                onClick={onClearCookingIngredients}
                className="p-2 rounded-full text-ink/50 hover:text-ink hover:bg-cream transition-colors cursor-pointer"
                title="Clear selected ingredients"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Generator Header & Quick Action */}
      <div className={`${CARD} p-6 sm:p-7`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-cream text-ink flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-3xl font-normal tracking-[-0.03em] text-ink">
                Vegetarian Recipes for Your Fridge
              </h2>
            </div>
            <p className="text-sm text-ink/60 mt-3 max-w-xl">
              Recipes written by AI (Google Gemini) to use what is in your fridge. If a recipe needs an extra ingredient, we will clearly tell you!
            </p>
          </div>

          {/* Generate Button Group */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onGenerateRecipes(false, undefined, selectedCookingIngredients)}
              disabled={isLoading || fridgeItems.length === 0}
              className={`px-5 py-3 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${PILL_DARK}`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Finding Recipes...' : 'Suggest More Recipes'}</span>
            </button>

            {expiringCount > 0 && (
              <button
                onClick={() => onGenerateRecipes(true)}
                disabled={isLoading}
                className="px-5 py-3 rounded-full bg-amber-200 hover:bg-amber-300 text-ink font-medium text-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-4 h-4 text-amber-700 fill-amber-700" />
                <span>Rescue Expiring ({expiringCount})</span>
              </button>
            )}

            <button
              onClick={onOpenPreferences}
              className="p-3 rounded-full bg-white ring-1 ring-ink/10 hover:bg-cream text-ink transition-colors cursor-pointer"
              title="Customize taste and dietary restrictions"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom Recipe Prompt / Exploration */}
        <form onSubmit={handleCustomSearchSubmit} className="mt-6 pt-6 border-t border-ink/10 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink/40 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Or request a specific dish/ingredient: e.g. 'Stir-fry with tofu', 'Warm curry', 'Mushroom pasta'..."
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              className={FIELD}
            />
          </div>
          <button
            type="submit"
            disabled={!customSearch.trim() || isLoading}
            className={`px-6 py-3 text-sm shrink-0 disabled:bg-ink/10 disabled:text-ink/35 disabled:cursor-not-allowed ${PILL_DARK}`}
          >
            Find Ideas
          </button>
        </form>
      </div>

      {/* Missing Ingredients Context Banner when no dishes are 100% in-fridge */}
      {recipes.length > 0 && readyToCookRecipes.length === 0 && (
        <div className="p-5 bg-amber-50 ring-1 ring-amber-200 rounded-3xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-ink text-sm">
              Notice: Making complete dishes requires 1 or more extra ingredients.
            </p>
            <p className="text-ink/70 mt-1 text-sm">
              We have listed recipes that make great use of your fridge ingredients below. Each card shows the exact missing item(s) needed, and you can add them to your shopping list with one click!
            </p>
          </div>
        </div>
      )}

      {/* 2. Filter Pills */}
      {recipes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className={`${LABEL} mr-1`}>Filter</span>
          <button onClick={() => setFilterTag('all')} className={filterPill(filterTag === 'all')}>
            All Recipes ({recipes.length})
          </button>

          {readyToCookRecipes.length > 0 && (
            <button
              onClick={() => setFilterTag('ready-now')}
              className={filterPill(filterTag === 'ready-now', 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100')}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready to Cook (0 Missing) ({readyToCookRecipes.length})</span>
            </button>
          )}

          {needOneIngredientRecipes.length > 0 && (
            <button
              onClick={() => setFilterTag('need-one')}
              className={filterPill(filterTag === 'need-one', 'bg-amber-50 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100')}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Requires 1 More Ingredient ({needOneIngredientRecipes.length})</span>
            </button>
          )}

          {needMultipleIngredientsRecipes.length > 0 && (
            <button onClick={() => setFilterTag('need-multiple')} className={filterPill(filterTag === 'need-multiple')}>
              <span>Requires 2+ More ({needMultipleIngredientsRecipes.length})</span>
            </button>
          )}

          <button onClick={() => setFilterTag('quick')} className={filterPill(filterTag === 'quick')}>
            ⚡ Under 25 mins
          </button>
          <button onClick={() => setFilterTag('budget')} className={filterPill(filterTag === 'budget')}>
            💰 Budget Stars
          </button>
          {recipes.some((r) => r.expiringItemsSaved && r.expiringItemsSaved.length > 0) && (
            <button onClick={() => setFilterTag('saved-expiring')} className={filterPill(filterTag === 'saved-expiring')}>
              🔥 Rescues Expiring Items
            </button>
          )}
        </div>
      )}

      {/* 3. Recipes List */}
      {isLoading ? (
        <div className={`${CARD} p-14 text-center space-y-3`}>
          <div className="w-10 h-10 border-[3px] border-ink border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-2xl font-normal tracking-[-0.03em] text-ink">
            Asking Gemini for recipes...
          </h3>
          <p className="text-sm text-ink/60 max-w-sm mx-auto">
            Gemini is reading your fridge and writing recipes just for you. This can take 10 to 20 seconds.
          </p>
        </div>
      ) : error ? (
        <div id="recipes-error" className={`${CARD} p-12 text-center`}>
          <div className="w-12 h-12 rounded-full bg-cream text-ink/50 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-normal tracking-[-0.03em] text-ink">Couldn't get recipes right now</h3>
          <p className="text-sm text-ink/60 mt-2 max-w-md mx-auto">{error}</p>
          <div className="mt-6 flex justify-center">
            <button onClick={onRetry} className={`px-6 py-3 text-sm flex items-center gap-2 ${PILL_DARK}`}>
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
          </div>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="bg-white/60 border border-dashed border-ink/20 rounded-3xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-cream text-ink/50 mx-auto flex items-center justify-center mb-4">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-normal tracking-[-0.02em] text-ink">No recipes found under this filter</h3>
          <p className="text-sm text-ink/60 mt-2 max-w-sm mx-auto">
            Try switching filter to &quot;All Recipes&quot; or generate fresh suggestions!
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-5 py-2.5 text-xs ${PILL_DARK}`}
            >
              Show All Recipes
            </button>
            <button
              onClick={() => onGenerateRecipes(false)}
              className="px-5 py-2.5 rounded-full bg-white text-ink ring-1 ring-ink/15 hover:bg-cream text-xs font-medium transition-colors cursor-pointer"
            >
              Generate Vegetarian Recipes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => {
            const isFav = favoriteIds.has(recipe.id) || favoriteIds.has(recipe.title);
            const totalMins = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
            const missingCount = recipe.missingIngredientsCount !== undefined
              ? recipe.missingIngredientsCount
              : (recipe.additionalIngredientsNeeded?.length || 0);

            return (
              <div
                key={recipe.id}
                className="bg-white ring-1 ring-ink/10 hover:ring-ink/25 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-sky text-ink">
                      {recipe.cuisine || 'Vegetarian'}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(recipe)}
                      className="text-ink/40 hover:text-amber-600 transition-colors p-1 cursor-pointer"
                      title={isFav ? 'Remove favorite' : 'Save favorite'}
                    >
                      {isFav ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Missing Ingredient Status Callout Header */}
                  {missingCount === 0 ? (
                    <div className="mb-3 px-3 py-1.5 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready to Cook • 100% in your fridge</span>
                    </div>
                  ) : missingCount === 1 ? (
                    <div className="mb-3 px-3 py-2 rounded-2xl bg-amber-50 ring-1 ring-amber-200 flex items-start gap-1.5 text-[11px] font-semibold text-ink">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span className="text-ink/75">Requires 1 more ingredient: </span>
                        <strong className="text-ink underline decoration-amber-300">
                          {recipe.additionalIngredientsNeeded?.[0]?.name || '1 staple'}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 px-3 py-2 rounded-2xl bg-stone-100 ring-1 ring-stone-300/70 flex items-start gap-1.5 text-[11px] font-semibold text-ink">
                      <AlertCircle className="w-3.5 h-3.5 text-ink/50 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span>Requires {missingCount} more ingredients: </span>
                        <span className="font-normal text-ink/65">
                          {recipe.additionalIngredientsNeeded?.map((a) => a.name).join(', ')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Title & Description */}
                  <h3 className="text-2xl font-normal tracking-[-0.03em] leading-tight text-ink">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-ink/65 mt-2 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Quick Info (Cook time, difficulty, budget) */}
                  <div className="flex items-center gap-3 mt-4 text-xs text-ink/55">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ink/40" />
                      {totalMins}m
                    </span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    <span>•</span>
                    <span className="capitalize">{recipe.budgetTier || 'Everyday'}</span>
                  </div>

                  {/* Expiring Ingredients Saved Badge */}
                  {recipe.expiringItemsSaved && recipe.expiringItemsSaved.length > 0 && (
                    <div className="mt-4 px-3 py-2 rounded-2xl bg-amber-50 ring-1 ring-amber-200 flex items-center gap-2 text-[11px] text-ink font-medium">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600 shrink-0" />
                      <span>Rescues: {recipe.expiringItemsSaved.join(', ')}</span>
                    </div>
                  )}

                  {/* Used Fridge Items Chips */}
                  <div className="mt-4 space-y-2">
                    <p className={LABEL}>
                      From Your Fridge ({recipe.usedFridgeIngredients?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.usedFridgeIngredients?.slice(0, 4).map((ing, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 font-medium"
                        >
                          ✓ {ing}
                        </span>
                      ))}
                      {(recipe.usedFridgeIngredients?.length || 0) > 4 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream text-ink/60">
                          +{(recipe.usedFridgeIngredients?.length || 0) - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cheaper Alternative Highlight */}
                  {recipe.cheaperAlternatives && recipe.cheaperAlternatives.length > 0 && (
                    <div className="mt-4 p-3 rounded-2xl bg-cream flex items-start gap-2 text-[11px] text-ink/75">
                      <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span className="font-semibold text-ink">Budget swap: </span>
                        <span>{recipe.cheaperAlternatives[0].cheaperAlternative}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-between gap-2">
                  {missingCount > 0 ? (
                    <button
                      onClick={() => handleAddAllMissing(recipe)}
                      className="text-[11px] font-medium text-amber-900 flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full ring-1 ring-amber-200 transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>
                        {missingCount === 1 ? '+ Add missing item' : `+ Add ${missingCount} missing`}
                      </span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready to make!
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`px-4 py-2 text-xs flex items-center gap-1 ${PILL_DARK}`}
                  >
                    <span>View Recipe</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
        isFavorite={Boolean(selectedRecipe && (favoriteIds.has(selectedRecipe.id) || favoriteIds.has(selectedRecipe.title)))}
        onToggleFavorite={onToggleFavorite}
        onAddToShoppingList={onAddToShoppingList}
        onExploreRelatedRecipe={(query) => {
          setSelectedRecipe(null);
          onGenerateRecipes(false, query);
        }}
      />
    </div>
  );
};
