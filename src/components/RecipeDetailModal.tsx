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

// Shared look, from docs/design-system.md
const LABEL = 'font-mono text-xs uppercase tracking-[0.18em] text-ink/65';
const PILL_DARK = 'rounded-full bg-ink text-cream font-medium hover:bg-ink-soft transition-colors cursor-pointer';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="recipe-detail-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_0_1px_rgba(33,12,2,0.1),0_24px_60px_-12px_rgba(0,0,0,0.55)] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-ink/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-sky text-ink">
              {recipe.cuisine || 'Vegetarian'}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cream text-ink/70">
              {recipe.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(recipe)}
              className={`px-4 min-h-11 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                isFavorite
                  ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                  : 'bg-white text-ink/75 ring-1 ring-ink/15 hover:bg-cream'
              }`}
            >
              {isFavorite ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-ink/65 hover:text-ink hover:bg-cream transition-colors cursor-pointer"
              aria-label="Close recipe"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-7">
          {/* Title & Description */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] leading-[1.05] text-ink">
              {recipe.title}
            </h2>
            <p className="text-base text-ink/65 mt-3 leading-relaxed">
              {recipe.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-cream rounded-2xl text-center">
            <div>
              <div className={`flex items-center justify-center gap-1 ${LABEL}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Time</span>
              </div>
              <p className="text-lg font-medium text-ink mt-1">{totalTime} mins</p>
              <p className="text-xs text-ink/65">Prep {recipe.prepTimeMinutes}m • Cook {recipe.cookTimeMinutes}m</p>
            </div>

            <div className="border-x border-ink/10">
              <div className={`flex items-center justify-center gap-1 ${LABEL}`}>
                <Users className="w-3.5 h-3.5" />
                <span>Servings</span>
              </div>
              <p className="text-lg font-medium text-ink mt-1">{recipe.servings} portions</p>
              
            </div>

            <div>
              <div className={`flex items-center justify-center gap-1 ${LABEL}`}>
                <ChefHat className="w-3.5 h-3.5" />
                <span>Budget</span>
              </div>
              <p className="text-lg font-medium text-ink capitalize mt-1">{recipe.budgetTier || 'Everyday'}</p>
              
            </div>
          </div>

          {/* Missing Ingredients Notice */}
          {recipe.missingIngredientsCount === 0 || (!recipe.additionalIngredientsNeeded || recipe.additionalIngredientsNeeded.length === 0) ? (
            <div className="p-4 bg-emerald-50 rounded-2xl ring-1 ring-emerald-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-ink">100% Ready to Cook! </span>
                <span className="text-ink/70">
                  All ingredients for this dish are already in your virtual fridge.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-2xl ring-1 ring-amber-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-ink flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-ink">
                  {recipe.missingIngredientsCount === 1
                    ? `Requires 1 more ingredient to make this dish: ${recipe.additionalIngredientsNeeded[0]?.name}`
                    : `Requires ${recipe.additionalIngredientsNeeded.length} more ingredients to make this dish: ${recipe.additionalIngredientsNeeded.map((a) => a.name).join(', ')}`}
                </span>
              </div>
            </div>
          )}

          {/* Expiring Ingredients Rescued */}
          {recipe.expiringItemsSaved && recipe.expiringItemsSaved.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl ring-1 ring-amber-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-ink flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 fill-ink" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-ink">Food Waste Saved! </span>
                <span className="text-ink/70">
                  This dish directly utilizes your expiring: {recipe.expiringItemsSaved.join(', ')}.
                </span>
              </div>
            </div>
          )}

          {/* Ingredients Section (In Fridge vs Needed) */}
          <div className="space-y-5">
            <h3 className="text-2xl font-normal tracking-[-0.03em] text-ink">Ingredients</h3>

            {/* In Fridge */}
            <div>
              <p className={`mb-3 flex items-center gap-1.5 ${LABEL}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Already in your fridge ({recipe.usedFridgeIngredients?.length || 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {recipe.usedFridgeIngredients?.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Ingredients with Shopping List Action */}
            {recipe.additionalIngredientsNeeded && recipe.additionalIngredientsNeeded.length > 0 && (
              <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                  <p className={LABEL}>
                    Additional staples needed ({recipe.additionalIngredientsNeeded.length})
                  </p>
                  <button
                    onClick={handleAddMissingToShopping}
                    className="min-h-11 text-xs font-medium text-ink hover:underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add all to Shopping List</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipe.additionalIngredientsNeeded.map((ing, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 rounded-2xl bg-cream text-sm flex items-center justify-between"
                    >
                      <span className="font-medium text-ink">{ing.name}</span>
                      <span className="text-ink/65 font-mono text-xs">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cheaper Alternative Suggestions */}
          {recipe.cheaperAlternatives && recipe.cheaperAlternatives.length > 0 && (
            <div className="p-5 bg-cream rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-normal tracking-[-0.02em] text-ink">
                  Cheaper Ingredient Alternatives
                </h4>
              </div>
              <div className="space-y-2">
                {recipe.cheaperAlternatives.map((alt, idx) => (
                  <div key={idx} className="text-sm bg-white p-4 rounded-2xl">
                    <div className="font-medium text-ink">
                      Swap <span className="line-through text-ink/40">{alt.originalIngredient}</span> →{' '}
                      <span className="text-emerald-700 font-semibold">{alt.cheaperAlternative}</span>
                    </div>
                    <p className="text-ink/65 mt-1">{alt.why}</p>
                    <p className="text-ink/80 text-xs font-medium mt-1.5">💡 Tip: {alt.savingsTip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-2xl font-normal tracking-[-0.03em] text-ink">Cooking Instructions</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-4 text-base text-ink/80 leading-relaxed">
                  <span className="w-7 h-7 rounded-full bg-ink text-cream font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nutrition Highlights */}
          {recipe.nutritionHighlights && (
            <div className="p-4 bg-cream rounded-2xl text-sm text-ink/70">
              <span className="font-semibold text-ink">Nutrition Highlights: </span>
              {recipe.nutritionHighlights}
            </div>
          )}

          {/* Core Feature: Link to Other Recipes the User Can Try Out */}
          {recipe.relatedRecipeLinks && recipe.relatedRecipeLinks.length > 0 && (
            <div className="pt-6 border-t border-ink/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ink/60" />
                  <h4 className="text-xl font-normal tracking-[-0.02em] text-ink">
                    Discover Related Recipes To Try Out
                  </h4>
                </div>
                <span className={`hidden sm:inline ${LABEL}`}>Variations & Pairings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recipe.relatedRecipeLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-cream hover:ring-1 hover:ring-ink/20 transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <h5 className="font-semibold text-ink text-sm flex items-center justify-between gap-2">
                        <span>{link.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-ink/65 shrink-0" />
                      </h5>
                      <p className="text-xs text-ink/65 mt-1.5 leading-snug">
                        {link.whyTry}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-ink/10 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          onClose();
                          onExploreRelatedRecipe(link.query);
                        }}
                        className="text-ink font-medium hover:underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                      >
                        Generate variation
                      </button>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(link.query + ' vegetarian recipe')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink/65 hover:text-ink flex items-center gap-1"
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
        <div className="sticky bottom-0 bg-cream px-6 py-4 border-t border-ink/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className={`px-8 min-h-11 text-sm ${PILL_DARK}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
