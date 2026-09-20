/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Header } from './components/Header';
import { FridgeView } from './components/FridgeView';
import { RecipeView } from './components/RecipeView';
import { FavoritesView } from './components/FavoritesView';
import { ShoppingListView } from './components/ShoppingListView';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { CheaperSwapsModal } from './components/CheaperSwapsModal';
import { PreferencesModal } from './components/PreferencesModal';
import { FridgeItem, Recipe, ShoppingListItem, UserPreferences } from './types';
import { INITIAL_FRIDGE_ITEMS, INITIAL_USER_PREFERENCES } from './utils/starterData';
import { calculateExpiryDate, getDaysRemaining, estimateIngredientShelfLife } from './utils/expiryRules';
import { Sparkles, X, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'fridge' | 'recipes' | 'favorites' | 'shopping' | 'receipt' | 'swaps'>('fridge');

  // Modals
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // First-time onboarding banner state
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('veggiefridge_onboarded') !== 'true';
  });

  // Persistent Fridge Items
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>(() => {
    const saved = localStorage.getItem('veggiefridge_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved inventory', e);
      }
    }
    return INITIAL_FRIDGE_ITEMS;
  });

  // Persistent User Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('veggiefridge_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved preferences', e);
      }
    }
    return INITIAL_USER_PREFERENCES;
  });

  // Persistent Favorites
  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('veggiefridge_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved favorites', e);
      }
    }
    return [];
  });

  // Persistent Shopping List
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    const saved = localStorage.getItem('veggiefridge_shopping');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse shopping list', e);
      }
    }
    return [
      {
        id: 'shop-init-1',
        name: 'Cannellini White Beans',
        amount: '1 can (400g)',
        category: 'pantry',
        isChecked: false,
        addedAt: new Date().toISOString(),
        cheaperSwapSuggestion: 'Buy dry bulk beans and soak overnight to save 70%',
      },
      {
        id: 'shop-init-2',
        name: 'Nutritional Yeast',
        amount: '1 tub',
        category: 'pantry',
        isChecked: false,
        addedAt: new Date().toISOString(),
        cheaperSwapSuggestion: 'Excellent high-protein, B12-rich vegan cheese replacement',
      },
    ];
  });

  // Generated Recipes State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [recipesError, setRecipesError] = useState<string | null>(null);
  const [focusExpiringMode, setFocusExpiringMode] = useState(false);
  const latestRequestId = useRef(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const lastRequest = useRef<{
    focusExpiring: boolean;
    customQuery?: string;
    selectedIngredients?: string[];
    resolvedSelected: string[];
  }>({
    focusExpiring: false,
    resolvedSelected: [],
  });
  const [selectedCookingIngredients, setSelectedCookingIngredients] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('veggiefridge_inventory', JSON.stringify(fridgeItems));
  }, [fridgeItems]);

  useEffect(() => {
    localStorage.setItem('veggiefridge_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('veggiefridge_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('veggiefridge_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // A new tab should open at its top, not halfway down the previous page
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Expiring soon count
  const expiringCount = fridgeItems.filter((i) => getDaysRemaining(i.expiryDate) <= 3).length;

  // Add Item to Fridge
  const handleAddFridgeItem = (newItem: Omit<FridgeItem, 'id'>) => {
    const item: FridgeItem = {
      ...newItem,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setFridgeItems((prev) => [item, ...prev]);
    showToast(`Added ${item.name} (~${item.estimatedDays}d guideline) to fridge!`);
  };

  // Delete Item from Fridge
  const handleDeleteFridgeItem = (id: string) => {
    setFridgeItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset to starter fridge
  const handleResetStarter = () => {
    setFridgeItems(INITIAL_FRIDGE_ITEMS);
    showToast('Restored sample vegetarian fridge inventory');
  };

  const MAX_RECIPES = 20; // "Get 4 more" stops here to keep answers fast and prompts short

  // The information sent to the AI for a recipe request
  const buildRecipeRequestBody = (
    focusExpiring: boolean,
    customQuery: string | undefined,
    activeSelected: string[],
    excludeTitles?: string[]
  ) =>
    JSON.stringify({
      inventory: fridgeItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        daysLeft: getDaysRemaining(item.expiryDate),
      })),
      preferences: {
        ...preferences,
        customQuery: customQuery || (activeSelected.length > 0 ? `Dishes highlighting ${activeSelected.join(', ')}` : undefined),
      },
      focusExpiring,
      selectedIngredients: activeSelected.length > 0 ? activeSelected : undefined,
      excludeTitles,
    });

  // Generate Recipes (always asks Gemini; there are no built-in recipes)
  const handleGenerateRecipes = async (
    focusExpiring: boolean,
    customQuery?: string,
    selectedIngredients?: string[]
  ) => {
    const requestId = ++latestRequestId.current;
    const activeSelected = selectedIngredients !== undefined ? selectedIngredients : selectedCookingIngredients;
    lastRequest.current = { focusExpiring, customQuery, selectedIngredients, resolvedSelected: activeSelected };
    setFocusExpiringMode(focusExpiring);

    setIsGeneratingRecipes(true);
    setRecipesError(null);
    setIsLoadingMore(false);
    setMoreError(null);

    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 55000);

    try {
      const res = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: buildRecipeRequestBody(focusExpiring, customQuery, activeSelected),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (requestId !== latestRequestId.current) return;

      if (res.ok && data?.recipes?.length > 0) {
        setRecipes(data.recipes);
        showToast(
          focusExpiring
            ? 'Generated recipes rescuing your expiring ingredients!'
            : 'Fresh vegetarian recipes generated!'
        );
      } else {
        setRecipes([]);
        setRecipesError(
          data?.error ||
            (res.status === 404
              ? "The AI recipe helper isn't available on this site yet."
              : 'Could not get recipes right now.')
        );
      }
    } catch (err: any) {
      if (requestId !== latestRequestId.current) return;
      console.error('Error generating recipes:', err);
      setRecipes([]);
      setRecipesError(
        err?.name === 'AbortError'
          ? 'Gemini took too long to answer.'
          : 'Could not reach the AI recipe helper. Check your connection and try again.'
      );
    } finally {
      clearTimeout(abortTimer);
      if (requestId === latestRequestId.current) {
        setIsGeneratingRecipes(false);
      }
    }
  };

  // Add 4 more recipes to the list, asking the AI not to repeat the ones already shown
  const handleLoadMoreRecipes = async () => {
    if (isLoadingMore || isGeneratingRecipes || recipes.length === 0 || recipes.length >= MAX_RECIPES) return;

    const requestId = latestRequestId.current; // a fresh full request changes this, so a late answer is dropped
    const { focusExpiring, customQuery, resolvedSelected } = lastRequest.current;
    const existingTitles = recipes.map((r) => r.title);
    const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    setIsLoadingMore(true);
    setMoreError(null);

    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 55000);

    try {
      const res = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: buildRecipeRequestBody(focusExpiring, customQuery, resolvedSelected, existingTitles),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (requestId !== latestRequestId.current) return;

      if (res.ok && data?.recipes?.length > 0) {
        const seen = new Set(existingTitles.map(normalize));
        const stamp = Date.now();
        const fresh: Recipe[] = data.recipes
          .filter((r: Recipe) => {
            const key = normalize(r.title || '');
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((r: Recipe, i: number) => ({ ...r, id: `recipe-more-${stamp}-${i}` }));

        if (fresh.length === 0) {
          setMoreError('Gemini only sent recipes you already have. Try again for different ideas.');
        } else {
          setRecipes((prev) => [...prev, ...fresh].slice(0, MAX_RECIPES));
          showToast(`${fresh.length} more ${fresh.length === 1 ? 'recipe' : 'recipes'} added!`);
        }
      } else {
        setMoreError(data?.error || 'Could not get more recipes right now.');
      }
    } catch (err: any) {
      if (requestId !== latestRequestId.current) return;
      console.error('Error getting more recipes:', err);
      setMoreError(
        err?.name === 'AbortError'
          ? 'Gemini took too long to answer.'
          : 'Could not reach the AI recipe helper. Check your connection and try again.'
      );
    } finally {
      clearTimeout(abortTimer);
      if (requestId === latestRequestId.current) {
        setIsLoadingMore(false);
      }
    }
  };

  // Ask Gemini for recipes the first time the Recipes tab is opened (not on every page load, to save AI usage)
  useEffect(() => {
    if (activeTab === 'recipes' && recipes.length === 0 && !isGeneratingRecipes && !recipesError) {
      handleGenerateRecipes(false);
    }
  }, [activeTab, recipes.length, isGeneratingRecipes, recipesError]);

  // Action: Cook with expiring ingredients
  const handleCookWithExpiring = () => {
    setSelectedCookingIngredients([]);
    setActiveTab('recipes');
    handleGenerateRecipes(true);
  };

  // Action: Cook with specific ingredient(s)
  const handleCookWithIngredient = (ingredientNames: string | string[]) => {
    const list = Array.isArray(ingredientNames) ? ingredientNames : [ingredientNames];
    setSelectedCookingIngredients(list);
    setActiveTab('recipes');
    handleGenerateRecipes(false, undefined, list);
  };

  // Toggle Favorite
  const handleToggleFavorite = (recipe: Recipe) => {
    const exists = favorites.some((f) => f.id === recipe.id || f.title === recipe.title);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== recipe.id && f.title !== recipe.title));
      showToast(`Removed "${recipe.title}" from saved`);
    } else {
      setFavorites((prev) => [{ ...recipe, isFavorite: true, savedAt: new Date().toISOString() }, ...prev]);
      showToast(`Saved "${recipe.title}" to Favorites!`);
    }
  };

  // Add items to Shopping List
  const handleAddToShoppingList = (
    ingredients: { name: string; amount: string; cheaperSwap?: string }[]
  ) => {
    const newItems: ShoppingListItem[] = ingredients.map((ing) => {
      const rule = estimateIngredientShelfLife(ing.name);
      return {
        id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: ing.name,
        amount: ing.amount,
        category: rule.category,
        isChecked: false,
        cheaperSwapSuggestion: ing.cheaperSwap,
        addedAt: new Date().toISOString(),
      };
    });

    setShoppingList((prev) => [...newItems, ...prev]);
    showToast(`Added ${ingredients.length} items to your shopping list!`);
  };

  // Shopping List item toggle
  const handleToggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item))
    );
  };

  // Shopping List item delete
  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  // Transfer checked shopping items to Fridge (with auto guidelines!)
  const handleTransferCheckedToFridge = (checked: ShoppingListItem[]) => {
    const today = new Date().toISOString().split('T')[0];
    const newFridgeItems: FridgeItem[] = checked.map((shop) => {
      const rule = estimateIngredientShelfLife(shop.name, shop.category);
      return {
        id: `fridge-bought-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: shop.name,
        quantity: shop.amount || '1 unit',
        category: rule.category,
        addedDate: today,
        expiryDate: calculateExpiryDate(rule.days),
        estimatedDays: rule.days,
        storageTip: rule.storageTip,
      };
    });

    setFridgeItems((prev) => [...newFridgeItems, ...prev]);
    // Remove checked from shopping list
    const checkedIds = new Set(checked.map((c) => c.id));
    setShoppingList((prev) => prev.filter((s) => !checkedIds.has(s.id)));
    showToast(`Transferred ${checked.length} groceries to your virtual fridge with auto-expiries!`);
    setActiveTab('fridge');
  };

  // Clear completed shopping items
  const handleClearCompletedShopping = () => {
    setShoppingList((prev) => prev.filter((item) => !item.isChecked));
  };

  // Add multiple scanned items to fridge
  const handleAddScannedItemsToFridge = (items: Omit<FridgeItem, 'id'>[]) => {
    const created: FridgeItem[] = items.map((item) => ({
      ...item,
      id: `scanned-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    }));
    setFridgeItems((prev) => [...created, ...prev]);
    showToast(`Added ${items.length} items from receipt to your fridge!`);
    setActiveTab('fridge');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" className="fixed left-1/2 -translate-x-1/2 top-36 xl:top-24 z-50 max-w-[calc(100vw-2rem)] bg-ink text-cream px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'receipt') {
            setIsReceiptModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        expiringCount={expiringCount}
        totalFridgeItems={fridgeItems.length}
        favoritesCount={favorites.length}
        shoppingCount={shoppingList.filter((i) => !i.isChecked).length}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome / Quick Setup Banner on first turn */}
        {showWelcome && (
          <motion.div
            id="welcome-banner"
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="relative bg-white ring-1 ring-ink/10 shadow-[0_1px_3px_rgba(0,0,0,0.08)] rounded-3xl p-5 sm:p-6 pr-14 sm:pr-16"
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-cream text-ink shrink-0"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-normal leading-[1.1] tracking-[-0.03em] text-ink">
                  Welcome to VeggieFridge!
                </h3>
                <p className="text-sm text-ink/70 mt-2 max-w-2xl leading-relaxed">
                  We pre-loaded sample items so you can try everything right away. Add your own ingredients anytime, and we will estimate their expiry dates for you.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setIsPreferencesOpen(true)}
                    className="min-h-11 px-5 rounded-full bg-ink text-cream text-sm font-medium transition-colors hover:bg-ink-soft cursor-pointer"
                  >
                    Personalize Diet & Budget
                  </button>
                  <button
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="hidden sm:inline-flex items-center min-h-11 px-5 rounded-full text-ink text-sm font-medium transition-colors ring-1 ring-ink/20 hover:bg-cream cursor-pointer"
                  >
                    Test Receipt Scanner
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWelcome(false);
                localStorage.setItem('veggiefridge_onboarded', 'true');
              }}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 w-11 h-11 shrink-0 flex items-center justify-center text-ink/65 hover:text-ink hover:bg-cream rounded-full transition-colors cursor-pointer"
              title="Dismiss banner"
              aria-label="Dismiss welcome message"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* View Switcher */}
        {activeTab === 'fridge' && (
          <FridgeView
            items={fridgeItems}
            onAddItem={handleAddFridgeItem}
            onDeleteItem={handleDeleteFridgeItem}
            onCookWithExpiring={handleCookWithExpiring}
            onCookWithIngredient={handleCookWithIngredient}
            onResetStarter={handleResetStarter}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipeView
            recipes={recipes}
            isLoading={isGeneratingRecipes}
            error={recipesError}
            focusExpiring={focusExpiringMode}
            onLoadMore={handleLoadMoreRecipes}
            isLoadingMore={isLoadingMore}
            moreError={moreError}
            maxRecipes={MAX_RECIPES}
            onRetry={() => {
              const r = lastRequest.current;
              handleGenerateRecipes(r.focusExpiring, r.customQuery, r.selectedIngredients);
            }}
            onGenerateRecipes={handleGenerateRecipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToShoppingList={handleAddToShoppingList}
            fridgeItems={fridgeItems}
            preferences={preferences}
            onOpenPreferences={() => setIsPreferencesOpen(true)}
            selectedCookingIngredients={selectedCookingIngredients}
            onClearCookingIngredients={() => {
              setSelectedCookingIngredients([]);
              handleGenerateRecipes(false, undefined, []);
            }}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onRemoveFavorite={(id) => {
              setFavorites((prev) => prev.filter((f) => f.id !== id));
              showToast('Removed recipe from favorites');
            }}
            onAddToShoppingList={handleAddToShoppingList}
            onExploreRecipe={(query) => {
              setActiveTab('recipes');
              handleGenerateRecipes(false, query);
            }}
          />
        )}

        {activeTab === 'shopping' && (
          <ShoppingListView
            items={shoppingList}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onAddItem={(newItem) => {
              const rule = estimateIngredientShelfLife(newItem.name, newItem.category);
              setShoppingList((prev) => [
                {
                  ...newItem,
                  id: `shop-${Date.now()}`,
                  addedAt: new Date().toISOString(),
                },
                ...prev,
              ]);
              showToast(`Added ${newItem.name} to shopping list`);
            }}
            onTransferCheckedToFridge={handleTransferCheckedToFridge}
            onClearCompleted={handleClearCompletedShopping}
          />
        )}

        {activeTab === 'swaps' && (
          <CheaperSwapsModal
            onAddToShoppingList={handleAddToShoppingList}
          />
        )}
      </main>

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        preferences={preferences}
        onSavePreferences={(updated) => {
          setPreferences(updated);
          showToast('Preferences updated! New recipes will use them.');
          setRecipes([]);
          setRecipesError(null);
          setMoreError(null);
        }}
      />

      {/* Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onAddScannedItemsToFridge={handleAddScannedItemsToFridge}
      />
    </div>
  );
}
