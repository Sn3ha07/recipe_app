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
  const latestRequestId = useRef(0);
  const lastRequest = useRef<{ focusExpiring: boolean; customQuery?: string; selectedIngredients?: string[] }>({
    focusExpiring: false,
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

  // Generate Recipes (always asks Gemini; there are no built-in recipes)
  const handleGenerateRecipes = async (
    focusExpiring: boolean,
    customQuery?: string,
    selectedIngredients?: string[]
  ) => {
    const requestId = ++latestRequestId.current;
    const activeSelected = selectedIngredients !== undefined ? selectedIngredients : selectedCookingIngredients;
    lastRequest.current = { focusExpiring, customQuery, selectedIngredients };

    setIsGeneratingRecipes(true);
    setRecipesError(null);

    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 55000);

    try {
      const inventoryPayload = fridgeItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        daysLeft: getDaysRemaining(item.expiryDate),
      }));

      const res = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          inventory: inventoryPayload,
          preferences: {
            ...preferences,
            customQuery: customQuery || (activeSelected.length > 0 ? `Dishes highlighting ${activeSelected.join(', ')}` : undefined),
          },
          focusExpiring,
          selectedIngredients: activeSelected.length > 0 ? activeSelected : undefined,
        }),
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
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-stone-100 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-stone-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            className="bg-ink text-white rounded-3xl p-6 sm:p-8 shadow-[0_0_0_1px_rgba(33,12,2,0.1),0_8px_24px_rgba(0,0,0,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                className="p-3 rounded-full bg-white/15 text-white shrink-0"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-normal leading-[1.05] tracking-[-0.03em] text-white">
                  Welcome to VeggieFridge!
                </h3>
                <p className="text-sm sm:text-base text-white/80 mt-3 max-w-2xl leading-relaxed">
                  We pre-loaded sample items with real-time expiry dates so you can see instant waste reminders and recipe generation. Add your own ingredients anytime without calculating expiry dates—we estimate guidelines automatically!
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsPreferencesOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-white text-ink text-sm font-medium transition-colors hover:bg-cream"
                  >
                    Personalize Diet & Budget
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="px-5 py-2.5 rounded-full text-white text-sm font-medium transition-colors ring-1 ring-white/40 hover:bg-white/10"
                  >
                    Test Receipt Scanner
                  </motion.button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWelcome(false);
                localStorage.setItem('veggiefridge_onboarded', 'true');
              }}
              className="self-start sm:self-center text-white/70 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              title="Dismiss banner"
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
