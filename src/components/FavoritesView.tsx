import React, { useState } from 'react';
import { creditLine } from '../utils/recipeSource';
import { 
  Bookmark, 
  Trash2, 
  Clock, 
  ShoppingCart, 
  ChefHat, 
  ArrowRight,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { Recipe } from '../types';
import { RecipeDetailModal } from './RecipeDetailModal';

interface FavoritesViewProps {
  favorites: Recipe[];
  onRemoveFavorite: (id: string) => void;
  onAddToShoppingList: (ingredients: { name: string; amount: string; cheaperSwap?: string }[]) => void;
  onExploreRecipe: (query: string) => void;
}

// Shared look, from docs/design-system.md
const CARD = 'bg-white rounded-3xl ring-1 ring-ink/10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]';
const LABEL = 'font-mono text-xs uppercase tracking-[0.18em] text-ink/65';
const FIELD = 'w-full px-5 py-3 rounded-full bg-cream/60 ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-ink';
const PILL_DARK = 'rounded-full bg-ink text-cream font-medium hover:bg-ink-soft transition-colors cursor-pointer';

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onRemoveFavorite,
  onAddToShoppingList,
  onExploreRecipe,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <div id="favorites-view" className="space-y-8">
      <div className={`${CARD} p-6 sm:p-7`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cream text-ink flex items-center justify-center">
            <Bookmark className="w-4 h-4" />
          </div>
          <h2 className="text-3xl font-normal tracking-[-0.03em] text-ink">
            Saved Favorite Recipes ({favorites.length})
          </h2>
        </div>
        <p className="text-sm text-ink/60 mt-3">
          Access your curated collection of delicious vegetarian recipes anytime.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white/60 border border-dashed border-ink/20 rounded-3xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-cream text-ink/40 mx-auto flex items-center justify-center mb-4">
            <Bookmark className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-normal tracking-[-0.02em] text-ink">No saved recipes yet</h3>
          <p className="text-sm text-ink/60 mt-2 max-w-sm mx-auto">
            When you find a vegetarian dish you love in the Recipes tab, tap the bookmark icon to save it here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((recipe) => {
            const totalMins = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
            return (
              <div
                key={recipe.id}
                className="bg-white ring-1 ring-ink/10 hover:ring-ink/25 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-sky text-ink">
                      {recipe.cuisine}
                    </span>
                    <button
                      onClick={() => onRemoveFavorite(recipe.id)}
                      className="text-ink/45 hover:text-brand-red hover:bg-brand-red/10 transition-colors w-11 h-11 -mr-2 shrink-0 flex items-center justify-center rounded-full cursor-pointer"
                      title="Remove from favorites"
                      aria-label={`Remove ${recipe.title} from favorites`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-2xl font-normal tracking-[-0.03em] leading-tight text-ink">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-ink/65 mt-1">{creditLine(recipe)}</p>
                  <p className="text-sm text-ink/65 mt-2 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  <div className="flex items-center gap-3 mt-4 text-xs text-ink/65">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ink/40" />
                      {totalMins}m
                    </span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    <span>•</span>
                    <span className="capitalize">{recipe.budgetTier}</span>
                  </div>

                  {recipe.additionalIngredientsNeeded && recipe.additionalIngredientsNeeded.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-ink/10 flex items-center justify-between text-xs">
                      <span className="text-xs text-ink/65">
                        {recipe.additionalIngredientsNeeded.length} extra ingredients
                      </span>
                      <button
                        onClick={() => {
                          const items = recipe.additionalIngredientsNeeded.map((ing) => ({
                            name: ing.name,
                            amount: ing.amount,
                          }));
                          onAddToShoppingList(items);
                        }}
                        className="min-h-11 text-xs font-medium text-ink hover:underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add to List</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`px-5 min-h-11 text-sm flex items-center gap-1 ${PILL_DARK}`}
                  >
                    <span>Cook This</span>
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
        isFavorite={true}
        onToggleFavorite={(rec) => onRemoveFavorite(rec.id)}
        onAddToShoppingList={onAddToShoppingList}
        onExploreRelatedRecipe={onExploreRecipe}
      />
    </div>
  );
};
