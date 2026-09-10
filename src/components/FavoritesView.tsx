import React, { useState } from 'react';
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

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onRemoveFavorite,
  onAddToShoppingList,
  onExploreRecipe,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <div id="favorites-view" className="space-y-6">
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
              <Bookmark className="w-4 h-4" />
            </div>
            <h2 className="font-serif font-bold text-stone-900 text-xl">
              Saved Favorite Recipes ({favorites.length})
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Access your curated collection of delicious vegetarian recipes anytime.
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-3">
            <Bookmark className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-base">No saved recipes yet</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
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
                className="bg-white border border-stone-200 hover:border-amber-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      {recipe.cuisine}
                    </span>
                    <button
                      onClick={() => onRemoveFavorite(recipe.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-lg leading-snug">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {totalMins}m
                    </span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    <span>•</span>
                    <span className="capitalize">{recipe.budgetTier}</span>
                  </div>

                  {recipe.additionalIngredientsNeeded && recipe.additionalIngredientsNeeded.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-500">
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
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add to List</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
