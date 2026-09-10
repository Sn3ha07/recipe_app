import React from 'react';
import { 
  X, 
  Clock, 
  Users, 
  ChefHat, 
  Bookmark, 
  BookmarkCheck, 
  ShoppingCart, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Coins, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onAddToShoppingList: (ingredients: { name: string; amount: string; cheaperSwap?: string }[]) => void;
  onExploreRelatedRecipe: (query: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToShoppingList,
  onExploreRelatedRecipe,
}) => {
  if (!isOpen || !recipe) return null;

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  const handleAddMissingToShopping = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="recipe-detail-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {recipe.cuisine || 'Vegetarian'}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {recipe.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(recipe)}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                isFavorite 
                  ? 'bg-amber-50 text-amber-900 border-amber-300' 
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {isFavorite ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 leading-tight">
              {recipe.title}
            </h2>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              {recipe.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Time</span>
              </div>
              <p className="text-sm font-bold text-stone-900 mt-0.5">{totalTime} mins</p>
              <p className="text-[10px] text-stone-400">Prep {recipe.prepTimeMinutes}m • Cook {recipe.cookTimeMinutes}m</p>
            </div>

            <div className="border-x border-stone-200">
              <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Servings</span>
              </div>
              <p className="text-sm font-bold text-stone-900 mt-0.5">{recipe.servings} portions</p>
              <p className="text-[10px] text-stone-400">Generous size</p>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1 text-xs text-stone-500 font-medium">
                <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                <span>Budget Tier</span>
              </div>
              <p className="text-sm font-bold text-stone-900 capitalize mt-0.5">{recipe.budgetTier || 'Everyday'}</p>
              <p className="text-[10px] text-stone-400">Cost-conscious</p>
            </div>
          </div>

          {/* Missing Ingredients Notice */}
          {recipe.missingIngredientsCount === 0 || (!recipe.additionalIngredientsNeeded || recipe.additionalIngredientsNeeded.length === 0) ? (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-950">100% Ready to Cook! </span>
                <span className="text-emerald-800">
                  All ingredients for this dish are already in your virtual fridge.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold shrink-0 mt-0.5">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-amber-950">
                  {recipe.missingIngredientsCount === 1
                    ? `Requires 1 more ingredient to make this dish: ${recipe.additionalIngredientsNeeded[0]?.name}`
                    : `Requires ${recipe.additionalIngredientsNeeded.length} more ingredients to make this dish: ${recipe.additionalIngredientsNeeded.map((a) => a.name).join(', ')}`}
                </span>
                <p className="text-amber-800 mt-0.5">
                  You already have {recipe.usedFridgeIngredients?.join(', ') || 'essential items'} in your fridge. Add the missing {recipe.additionalIngredientsNeeded.length === 1 ? 'item' : 'items'} to your shopping list to make this recipe!
                </p>
              </div>
            </div>
          )}

          {/* Expiring Ingredients Rescued */}
          {recipe.expiringItemsSaved && recipe.expiringItemsSaved.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold shrink-0">
                <Flame className="w-4 h-4 fill-stone-950" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-amber-950">Food Waste Saved! </span>
                <span className="text-amber-900">
                  This dish directly utilizes your expiring: {recipe.expiringItemsSaved.join(', ')}.
                </span>
              </div>
            </div>
          )}

          {/* Ingredients Section (In Fridge vs Needed) */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-lg">Ingredients</h3>

            {/* In Fridge */}
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Already in your fridge ({recipe.usedFridgeIngredients?.length || 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {recipe.usedFridgeIngredients?.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Ingredients with Shopping List Action */}
            {recipe.additionalIngredientsNeeded && recipe.additionalIngredientsNeeded.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Additional staples needed ({recipe.additionalIngredientsNeeded.length})
                  </p>
                  <button
                    onClick={handleAddMissingToShopping}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add all to Shopping List</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipe.additionalIngredientsNeeded.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-stone-800">{ing.name}</span>
                      <span className="text-stone-500 font-mono text-[11px]">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Secondary Stretch Goal: Cheaper Alternative Suggestions */}
          {recipe.cheaperAlternatives && recipe.cheaperAlternatives.length > 0 && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-amber-500 text-stone-950 font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-amber-950 text-sm">
                  Cheaper Ingredient Alternatives (Stretch Goal)
                </h4>
              </div>
              <div className="space-y-2">
                {recipe.cheaperAlternatives.map((alt, idx) => (
                  <div key={idx} className="text-xs bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                    <div className="font-semibold text-stone-900">
                      Swap <span className="line-through text-stone-400">{alt.originalIngredient}</span> →{' '}
                      <span className="text-emerald-700 font-bold">{alt.cheaperAlternative}</span>
                    </div>
                    <p className="text-stone-600 mt-1">{alt.why}</p>
                    <p className="text-amber-900 text-[11px] font-medium mt-0.5">💡 Tip: {alt.savingsTip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-stone-900 text-lg">Cooking Instructions</h3>
            <ol className="space-y-2.5">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-stone-200">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nutrition Highlights */}
          {recipe.nutritionHighlights && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
              <span className="font-semibold text-stone-800">Nutrition Highlights: </span>
              {recipe.nutritionHighlights}
            </div>
          )}

          {/* Core Feature: Link to Other Recipes the User Can Try Out */}
          {recipe.relatedRecipeLinks && recipe.relatedRecipeLinks.length > 0 && (
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-serif font-bold text-stone-900 text-base">
                    Discover Related Recipes To Try Out
                  </h4>
                </div>
                <span className="text-[11px] text-stone-400">Variations & Pairings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recipe.relatedRecipeLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-200 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <h5 className="font-semibold text-stone-900 text-xs flex items-center justify-between">
                        <span>{link.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      </h5>
                      <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                        {link.whyTry}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => {
                          onClose();
                          onExploreRelatedRecipe(link.query);
                        }}
                        className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Generate variation
                      </button>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(link.query + ' vegetarian recipe')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-400 hover:text-stone-700 flex items-center gap-1"
                      >
                        <span>Search web</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => onToggleFavorite(recipe)}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            {isFavorite ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
            <span>{isFavorite ? 'Remove from Saved' : 'Save for Later'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
