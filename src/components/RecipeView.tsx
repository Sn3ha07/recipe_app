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

export const RecipeView: React.FC<RecipeViewProps> = ({
  recipes,
  isLoading,
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
    <div id="recipes-view" className="space-y-6">
      {/* Active Ingredient Selection Banner (When user cooks with specific fridge items) */}
      {selectedCookingIngredients.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold shrink-0">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Finding recipes for your ingredients:
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {selectedCookingIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white text-emerald-900 border border-emerald-300"
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
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh for These</span>
            </button>
            {onClearCookingIngredients && (
              <button
                onClick={onClearCookingIngredients}
                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Clear selected ingredients"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Generator Header & Quick Action */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="font-serif font-bold text-stone-900 text-xl">
                Vegetarian Recipes for Your Fridge
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Recipes dynamically matched to use what is in your fridge. If a recipe needs an extra ingredient, we will clearly tell you!
            </p>
          </div>

          {/* Generate Button Group */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onGenerateRecipes(false, undefined, selectedCookingIngredients)}
              disabled={isLoading || fridgeItems.length === 0}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Finding Recipes...' : 'Suggest More Recipes'}</span>
            </button>

            {expiringCount > 0 && (
              <button
                onClick={() => onGenerateRecipes(true)}
                disabled={isLoading}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span>Rescue Expiring ({expiringCount})</span>
              </button>
            )}

            <button
              onClick={onOpenPreferences}
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
              title="Customize taste and dietary restrictions"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom Recipe Prompt / Exploration */}
        <form onSubmit={handleCustomSearchSubmit} className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Or request a specific dish/ingredient: e.g. 'Stir-fry with tofu', 'Warm curry', 'Mushroom pasta'..."
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={!customSearch.trim() || isLoading}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white font-medium text-xs transition-colors shrink-0 cursor-pointer"
          >
            Find Ideas
          </button>
        </form>
      </div>

      {/* Missing Ingredients Context Banner when no dishes are 100% in-fridge */}
      {recipes.length > 0 && readyToCookRecipes.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950">
              Notice: Making complete dishes requires 1 or more extra ingredients.
            </p>
            <p className="text-amber-800 mt-0.5">
              We have listed recipes that make great use of your fridge ingredients below. Each card shows the exact missing item(s) needed, and you can add them to your shopping list with one click!
            </p>
          </div>
        </div>
      )}

      {/* 2. Filter Pills */}
      {recipes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-medium">Filter:</span>
          <button
            onClick={() => setFilterTag('all')}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
              filterTag === 'all'
                ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Recipes ({recipes.length})
          </button>

          {readyToCookRecipes.length > 0 && (
            <button
              onClick={() => setFilterTag('ready-now')}
              className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterTag === 'ready-now'
                  ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready to Cook (0 Missing) ({readyToCookRecipes.length})</span>
            </button>
          )}

          {needOneIngredientRecipes.length > 0 && (
            <button
              onClick={() => setFilterTag('need-one')}
              className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterTag === 'need-one'
                  ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Requires 1 More Ingredient ({needOneIngredientRecipes.length})</span>
            </button>
          )}

          {needMultipleIngredientsRecipes.length > 0 && (
            <button
              onClick={() => setFilterTag('need-multiple')}
              className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                filterTag === 'need-multiple'
                  ? 'bg-stone-700 text-white border-stone-700 font-semibold'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>Requires 2+ More ({needMultipleIngredientsRecipes.length})</span>
            </button>
          )}

          <button
            onClick={() => setFilterTag('quick')}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
              filterTag === 'quick'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            ⚡ Under 25 mins
          </button>
          <button
            onClick={() => setFilterTag('budget')}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
              filterTag === 'budget'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            💰 Budget Stars
          </button>
          {recipes.some((r) => r.expiringItemsSaved && r.expiringItemsSaved.length > 0) && (
            <button
              onClick={() => setFilterTag('saved-expiring')}
              className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                filterTag === 'saved-expiring'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              🔥 Rescues Expiring Items
            </button>
          )}
        </div>
      )}

      {/* 3. Recipes List */}
      {isLoading ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-serif font-bold text-stone-800 text-lg">
            Consulting your virtual fridge...
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Matching available ingredients, calculating waste savings, and checking if any extra ingredients are required.
          </p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-3">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-base">No recipes found under this filter</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try switching filter to &quot;All Recipes&quot; or generate fresh suggestions!
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setFilterTag('all')}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Show All Recipes
            </button>
            <button
              onClick={() => onGenerateRecipes(false)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
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
                className="bg-white border border-stone-200/90 hover:border-emerald-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      {recipe.cuisine || 'Vegetarian'}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(recipe)}
                      className="text-stone-400 hover:text-amber-500 transition-colors p-1 cursor-pointer"
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
                    <div className="mb-2.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready to Cook • 100% in your fridge</span>
                    </div>
                  ) : missingCount === 1 ? (
                    <div className="mb-2.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300/80 flex items-start gap-1.5 text-[11px] font-semibold text-amber-950">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span className="text-amber-900">Requires 1 more ingredient: </span>
                        <strong className="text-amber-950 underline decoration-amber-300">
                          {recipe.additionalIngredientsNeeded?.[0]?.name || '1 staple'}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2.5 px-2.5 py-1.5 rounded-xl bg-stone-100 border border-stone-300/80 flex items-start gap-1.5 text-[11px] font-semibold text-stone-800">
                      <AlertCircle className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span>Requires {missingCount} more ingredients: </span>
                        <span className="font-normal text-stone-600">
                          {recipe.additionalIngredientsNeeded?.map((a) => a.name).join(', ')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Title & Description */}
                  <h3 className="font-serif font-bold text-stone-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Quick Info (Cook time, difficulty, budget) */}
                  <div className="flex items-center gap-3 mt-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {totalMins}m
                    </span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    <span>•</span>
                    <span className="capitalize">{recipe.budgetTier || 'Everyday'}</span>
                  </div>

                  {/* Expiring Ingredients Saved Badge */}
                  {recipe.expiringItemsSaved && recipe.expiringItemsSaved.length > 0 && (
                    <div className="mt-3 p-2 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2 text-[11px] text-amber-950 font-medium">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600 shrink-0" />
                      <span>Rescues: {recipe.expiringItemsSaved.join(', ')}</span>
                    </div>
                  )}

                  {/* Used Fridge Items Chips */}
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      From Your Fridge ({recipe.usedFridgeIngredients?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.usedFridgeIngredients?.slice(0, 4).map((ing, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                        >
                          ✓ {ing}
                        </span>
                      ))}
                      {(recipe.usedFridgeIngredients?.length || 0) > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          +{(recipe.usedFridgeIngredients?.length || 0) - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cheaper Alternative Highlight (Stretch Goal 2) */}
                  {recipe.cheaperAlternatives && recipe.cheaperAlternatives.length > 0 && (
                    <div className="mt-3 p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-1.5 text-[11px] text-stone-700">
                      <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span className="font-semibold text-stone-900">Budget swap: </span>
                        <span>{recipe.cheaperAlternatives[0].cheaperAlternative}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  {missingCount > 0 ? (
                    <button
                      onClick={() => handleAddAllMissing(recipe)}
                      className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer bg-amber-50/80 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200/80 transition-colors"
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
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
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
