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
  Plus,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Recipe, FridgeItem, UserPreferences } from '../types';
import { RecipeDetailModal } from './RecipeDetailModal';
import { getDaysRemaining } from '../utils/expiryRules';
import { creditLine } from '../utils/recipeSource';

interface RecipeViewProps {
  recipes: Recipe[];
  isLoading: boolean;
  error?: string | null;
  focusExpiring?: boolean;
  searchInfo?: { grounded: boolean; queries: string[] } | null;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  moreError?: string | null;
  maxRecipes?: number;
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
const LABEL = 'font-mono text-xs uppercase tracking-[0.18em] text-ink/65';
const FIELD = 'w-full pl-12 pr-5 py-3 rounded-full bg-cream/60 ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-ink';
const PILL_DARK = 'rounded-full bg-ink text-cream font-medium hover:bg-ink-soft transition-colors cursor-pointer';
const filterPill = (active: boolean, idle = 'bg-white text-ink/75 ring-1 ring-ink/10 hover:bg-cream') =>
  `px-4 min-h-11 md:min-h-10 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
    active ? 'bg-ink text-cream' : idle
  }`;

const SkeletonCards: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="bg-white ring-1 ring-ink/10 rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="h-4 w-24 rounded-full bg-cream" />
        <div className="h-8 w-4/5 rounded-lg bg-cream" />
        <div className="h-9 rounded-2xl bg-cream" />
        <div className="h-4 w-1/2 rounded bg-cream" />
        <div className="flex justify-between pt-4">
          <div className="h-11 w-32 rounded-full bg-cream" />
          <div className="h-11 w-32 rounded-full bg-ink/10" />
        </div>
      </div>
    ))}
  </div>
);

export const RecipeView: React.FC<RecipeViewProps> = ({
  recipes,
  isLoading,
  error,
  focusExpiring = false,
  searchInfo = null,
  onLoadMore,
  isLoadingMore = false,
  moreError = null,
  maxRecipes = 20,
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

  const expiringCount = fridgeItems.filter((i) => getDaysRemaining(i.expiryDate) <= 3).length;
  const favoriteIds = new Set(favorites.map((f) => f.id || f.title));

  const missingOf = (r: Recipe) =>
    r.missingIngredientsCount !== undefined ? r.missingIngredientsCount : (r.additionalIngredientsNeeded?.length || 0);

  // Only offer a filter when it would actually change the list
  const filterOptions = [
    { id: 'ready-now', label: 'Ready to cook', test: (r: Recipe) => missingOf(r) === 0 },
    { id: 'need-one', label: 'Needs 1 more ingredient', test: (r: Recipe) => missingOf(r) === 1 },
    { id: 'need-multiple', label: 'Needs 2+ more', test: (r: Recipe) => missingOf(r) > 1 },
    { id: 'quick', label: 'Under 25 mins', test: (r: Recipe) => (r.prepTimeMinutes + r.cookTimeMinutes) <= 25 },
    { id: 'budget', label: 'Budget', test: (r: Recipe) => r.budgetTier === 'budget' },
    { id: 'saved-expiring', label: 'Uses expiring items', test: (r: Recipe) => Boolean(r.expiringItemsSaved && r.expiringItemsSaved.length > 0) },
  ]
    .map((o) => ({ ...o, count: recipes.filter(o.test).length }))
    .filter((o) => o.count > 0 && o.count < recipes.length);

  const activeFilter = filterOptions.some((o) => o.id === filterTag) ? filterTag : 'all';
  const filteredRecipes = activeFilter === 'all' ? recipes : recipes.filter(filterOptions.find((o) => o.id === activeFilter)!.test);

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
              onClick={() => onGenerateRecipes(focusExpiring, undefined, selectedCookingIngredients)}
              disabled={isLoading}
              className={`min-h-11 px-5 text-xs flex items-center gap-1.5 ${PILL_DARK}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh for These</span>
            </button>
            {onClearCookingIngredients && (
              <button
                onClick={onClearCookingIngredients}
                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-ink/65 hover:text-ink hover:bg-cream transition-colors cursor-pointer"
                title="Clear selected ingredients"
                aria-label="Clear selected ingredients"
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
            <p className="text-sm text-ink/65 mt-3 max-w-xl">
              Recipes written by AI (Google Gemini) to use what is in your fridge. If a recipe needs an extra ingredient, we will clearly tell you!
            </p>
          </div>

          {/* One main button, plus one option that changes what it asks for */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-new-recipes"
              onClick={() => onGenerateRecipes(focusExpiring, undefined, selectedCookingIngredients)}
              disabled={isLoading || isLoadingMore || fridgeItems.length === 0}
              className={`px-5 min-h-11 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${PILL_DARK}`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Finding Recipes...' : 'Get New Recipes'}</span>
            </button>

            {expiringCount > 0 && (
              <button
                id="btn-use-expiring"
                aria-pressed={focusExpiring}
                onClick={() => onGenerateRecipes(!focusExpiring, undefined, selectedCookingIngredients)}
                disabled={isLoading || isLoadingMore}
                className={`px-4 min-h-11 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  focusExpiring
                    ? 'bg-amber-200 text-ink ring-2 ring-amber-400'
                    : 'bg-white text-ink ring-1 ring-ink/20 hover:bg-cream'
                }`}
              >
                <Flame className={`w-4 h-4 ${focusExpiring ? 'text-amber-700 fill-amber-700' : 'text-amber-600'}`} />
                <span>Use up expiring items ({expiringCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Ask for something specific */}
        <form onSubmit={handleCustomSearchSubmit} className="mt-6 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink/45 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Ask for a specific dish or ingredient"
              placeholder="Ask for a dish, e.g. warm curry"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              className={FIELD}
            />
          </div>
          <button
            type="submit"
            disabled={!customSearch.trim() || isLoading}
            className={`px-6 min-h-11 text-sm shrink-0 disabled:bg-ink/10 disabled:text-ink/45 disabled:cursor-not-allowed ${PILL_DARK}`}
          >
            Search
          </button>
        </form>
      </div>

      {/* 2. Filter Pills (only the ones that change the list) */}
      {recipes.length > 0 && filterOptions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className={`${LABEL} mr-1`}>Filter</span>
          <button onClick={() => setFilterTag('all')} className={filterPill(activeFilter === 'all')}>
            All Recipes ({recipes.length})
          </button>
          {filterOptions.map((o) => (
            <button key={o.id} onClick={() => setFilterTag(o.id)} className={filterPill(activeFilter === o.id)}>
              {o.label} ({o.count})
            </button>
          ))}
        </div>
      )}

      {/* Did Google Search find real recipes? */}
      {!isLoading && recipes.length > 0 && searchInfo && (
        searchInfo.grounded ? (
          searchInfo.queries.length > 0 && (
            <p id="search-note" className="text-xs text-ink/65">
              Found with Google Search:{' '}
              {searchInfo.queries.slice(0, 4).map((q, i) => (
                <span key={q}>
                  {i > 0 && ', '}
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {q}
                  </a>
                </span>
              ))}
            </p>
          )
        ) : (
          <p id="search-note" className="text-sm text-ink/80 bg-white ring-1 ring-ink/10 rounded-2xl px-4 py-3">
            Couldn't search Google for original recipes this time, so these are written by Gemini alone and have no credits.
          </p>
        )
      )}

      {/* 3. Recipes List */}
      {isLoading ? (
        <div className="space-y-5">
          <div className={`${CARD} p-5 sm:p-6 flex items-center gap-4`}>
            <div className="w-8 h-8 shrink-0 border-[3px] border-ink border-t-transparent rounded-full animate-spin" />
            <div>
              <h3 className="text-xl font-normal tracking-[-0.02em] text-ink">
                Asking Gemini for recipes...
              </h3>
              <p className="text-sm text-ink/65 mt-1">
                Gemini is reading your fridge and looking on Google for real recipes to base them on. This usually takes 10 to 30 seconds.
              </p>
            </div>
          </div>
          <SkeletonCards count={3} />
        </div>
      ) : error ? (
        <div id="recipes-error" className={`${CARD} p-12 text-center`}>
          <div className="w-12 h-12 rounded-full bg-cream text-ink/50 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-normal tracking-[-0.03em] text-ink">Couldn't get recipes right now</h3>
          <p className="text-sm text-ink/65 mt-2 max-w-md mx-auto">{error}</p>
          <div className="mt-6 flex justify-center">
            <button onClick={onRetry} className={`px-6 min-h-11 text-sm flex items-center gap-2 ${PILL_DARK}`}>
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
          <h3 className="text-xl font-normal tracking-[-0.02em] text-ink">No recipes yet</h3>
          <p className="text-sm text-ink/65 mt-2 max-w-sm mx-auto">
            Tap the button below to get vegetarian recipes for what is in your fridge.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={() => onGenerateRecipes(focusExpiring)}
              className={`px-5 min-h-11 text-sm ${PILL_DARK}`}
            >
              Get New Recipes
            </button>
          </div>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => {
            const isFav = favoriteIds.has(recipe.id) || favoriteIds.has(recipe.title);
            const totalMins = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
            const missingCount = missingOf(recipe);
            const missingNames = recipe.additionalIngredientsNeeded?.map((a) => a.name).join(', ');
            const expiringSaved = recipe.expiringItemsSaved?.length || 0;

            return (
              <div
                key={recipe.id}
                className="bg-white ring-1 ring-ink/10 hover:ring-ink/25 rounded-3xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Cuisine and bookmark */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-sky text-ink">
                      {recipe.cuisine || 'Vegetarian'}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(recipe)}
                      className="w-11 h-11 -mr-2 shrink-0 flex items-center justify-center rounded-full text-ink/55 hover:text-amber-600 hover:bg-cream transition-colors cursor-pointer"
                      title={isFav ? 'Remove favorite' : 'Save favorite'}
                      aria-label={isFav ? `Remove ${recipe.title} from favorites` : `Save ${recipe.title} to favorites`}
                    >
                      {isFav ? (
                        <BookmarkCheck className="w-5 h-5 text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Title first */}
                  <h3 className="text-2xl font-normal tracking-[-0.03em] leading-tight text-ink">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-ink/65 mt-1.5">{creditLine(recipe)}</p>

                  {/* One status line: can I cook this now? */}
                  {missingCount === 0 ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Ready to cook
                    </p>
                  ) : (
                    <p className={`mt-3 px-3 py-1.5 rounded-2xl text-xs text-ink ring-1 ${missingCount === 1 ? 'bg-amber-50 ring-amber-200' : 'bg-stone-100 ring-stone-300/70'}`}>
                      <span className="font-semibold">Needs {missingCount} more:</span> {missingNames}
                    </p>
                  )}

                  {/* Time and difficulty */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-xs text-ink/65">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {totalMins} min
                    </span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    {expiringSaved > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 ring-1 ring-amber-200 text-ink font-medium">
                        <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                        Uses {expiringSaved} expiring
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-ink/10 flex items-center justify-between gap-2">
                  {missingCount > 0 ? (
                    <button
                      onClick={() => handleAddAllMissing(recipe)}
                      className="min-h-11 px-4 text-xs font-medium text-amber-900 flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100 rounded-full ring-1 ring-amber-200 transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{missingCount === 1 ? '+ Add missing item' : `+ Add ${missingCount} missing`}</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`px-5 min-h-11 text-sm flex items-center gap-1.5 ${PILL_DARK}`}
                  >
                    <span>View Recipe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ask for 4 more, added below the ones already here */}
        {isLoadingMore && (
          <div id="more-recipes-loading" className="space-y-5">
            <div className={`${CARD} p-5 flex items-center gap-4`}>
              <div className="w-7 h-7 shrink-0 border-[3px] border-ink border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-ink/70">
                <span className="font-medium text-ink">Asking Gemini for 4 more recipes...</span> This usually takes 10 to 30 seconds.
              </p>
            </div>
            <SkeletonCards count={4} />
          </div>
        )}

        {!isLoadingMore && onLoadMore && (
          <div className="flex flex-col items-center gap-3 pt-2">
            {moreError && (
              <p id="more-recipes-error" role="alert" className="text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-2xl px-4 py-3 max-w-lg text-center">
                Couldn't get more recipes. {moreError}
              </p>
            )}
            {recipes.length >= maxRecipes ? (
              <p id="more-recipes-limit" className="text-sm text-ink/65 text-center max-w-md">
                That's the most recipes shown at once. Use "Get New Recipes" above for a fresh set.
              </p>
            ) : (
              <button
                id="btn-more-recipes"
                onClick={onLoadMore}
                disabled={isLoading}
                className="px-6 min-h-11 rounded-full bg-white text-ink ring-1 ring-ink/25 hover:bg-cream text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{moreError ? 'Try again' : `Get ${Math.min(4, maxRecipes - recipes.length)} more ${maxRecipes - recipes.length === 1 ? 'recipe' : 'recipes'}`}</span>
              </button>
            )}
          </div>
        )}
        </>
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
