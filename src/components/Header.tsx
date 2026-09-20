import React from 'react';
import {
  Refrigerator,
  UtensilsCrossed,
  Bookmark,
  ShoppingCart,
  ScanLine,
  SlidersHorizontal,
  AlertTriangle,
  Coins
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'fridge' | 'recipes' | 'favorites' | 'shopping' | 'receipt' | 'swaps';
  setActiveTab: (tab: 'fridge' | 'recipes' | 'favorites' | 'shopping' | 'receipt' | 'swaps') => void;
  expiringCount: number;
  totalFridgeItems: number;
  favoritesCount: number;
  shoppingCount: number;
  onOpenPreferences: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  expiringCount,
  totalFridgeItems,
  favoritesCount,
  shoppingCount,
  onOpenPreferences,
}) => {
  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
      active ? 'bg-ink text-cream' : 'text-ink/70 hover:text-ink hover:bg-ink/5'
    }`;

  const countClass = (active: boolean) =>
    `font-mono text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-cream/20 text-cream' : 'bg-ink/10 text-ink/70'}`;

  const mobileClass = (active: boolean) =>
    `flex flex-col items-center justify-center min-h-11 min-w-11 py-1.5 px-2 rounded-lg text-xs font-medium relative ${
      active ? 'text-ink font-semibold' : 'text-ink/65'
    }`;

  return (
    <header id="app-header" className="sticky top-0 z-30 bg-cream/90 text-ink border-b border-ink/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('fridge')}>
            <div className="w-10 h-10 rounded-full bg-ink text-cream flex items-center justify-center">
              <Refrigerator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-medium tracking-tight text-ink">
                  VeggieFridge
                </span>
                <span className="hidden 2xl:inline font-mono text-xs uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-sky text-ink">
                  Zero-Waste
                </span>
              </div>
              <p className="text-xs text-ink/65 hidden 2xl:block">
                Smart vegetarian pantry & recipe guide
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1 p-1.5 rounded-full bg-white ring-1 ring-ink/10 shadow-sm">
            <button id="tab-fridge" onClick={() => setActiveTab('fridge')} className={tabClass(activeTab === 'fridge')}>
              <Refrigerator className="w-4 h-4" />
              <span>Fridge</span>
              <span className={countClass(activeTab === 'fridge')}>{totalFridgeItems}</span>
              {expiringCount > 0 && (
                <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {expiringCount} soon
                </span>
              )}
            </button>

            <button id="tab-recipes" onClick={() => setActiveTab('recipes')} className={tabClass(activeTab === 'recipes')}>
              <UtensilsCrossed className="w-4 h-4" />
              <span>Recipes</span>
            </button>

            <button id="tab-favorites" onClick={() => setActiveTab('favorites')} className={tabClass(activeTab === 'favorites')}>
              <Bookmark className="w-4 h-4" />
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span className={countClass(activeTab === 'favorites')}>{favoritesCount}</span>
              )}
            </button>

            <button id="tab-shopping" onClick={() => setActiveTab('shopping')} className={tabClass(activeTab === 'shopping')}>
              <ShoppingCart className="w-4 h-4" />
              <span>Shopping List</span>
              {shoppingCount > 0 && (
                <span className={`font-mono text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'shopping' ? 'bg-cream text-ink' : 'bg-ink text-cream'}`}>
                  {shoppingCount}
                </span>
              )}
            </button>

            <button id="tab-receipt" onClick={() => setActiveTab('receipt')} className={tabClass(activeTab === 'receipt')}>
              <ScanLine className="w-4 h-4" />
              <span>Scan Receipt</span>
            </button>

            <button id="tab-swaps" onClick={() => setActiveTab('swaps')} className={tabClass(activeTab === 'swaps')}>
              <Coins className="w-4 h-4" />
              <span>Budget Swaps</span>
            </button>
          </nav>

          {/* Right Action: Preferences */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-preferences"
              onClick={onOpenPreferences}
              className="flex items-center justify-center gap-2 min-h-11 min-w-11 px-3 sm:px-4 rounded-full text-sm font-medium bg-white text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-cream transition-colors cursor-pointer"
              title="Personalize diet, budget, and cuisines"
              aria-label="Preferences"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </button>
          </div>
        </div>

        {/* Mobile / tablet navigation bar */}
        <div className="xl:hidden flex items-center justify-around py-1 border-t border-ink/10 overflow-x-auto gap-1">
          <button onClick={() => setActiveTab('fridge')} className={mobileClass(activeTab === 'fridge')}>
            <Refrigerator className="w-4 h-4" />
            <span>Fridge</span>
            {expiringCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          <button onClick={() => setActiveTab('recipes')} className={mobileClass(activeTab === 'recipes')}>
            <UtensilsCrossed className="w-4 h-4" />
            <span>Recipes</span>
          </button>

          <button onClick={() => setActiveTab('favorites')} className={mobileClass(activeTab === 'favorites')}>
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>

          <button onClick={() => setActiveTab('shopping')} className={mobileClass(activeTab === 'shopping')}>
            <ShoppingCart className="w-4 h-4" />
            <span>List</span>
            {shoppingCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-ink"></span>
            )}
          </button>

          <button onClick={() => setActiveTab('receipt')} className={mobileClass(activeTab === 'receipt')}>
            <ScanLine className="w-4 h-4" />
            <span>Scan</span>
          </button>

          <button onClick={() => setActiveTab('swaps')} className={mobileClass(activeTab === 'swaps')}>
            <Coins className="w-4 h-4" />
            <span>Swaps</span>
          </button>
        </div>
      </div>
    </header>
  );
};
