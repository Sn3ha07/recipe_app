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
  return (
    <header id="app-header" className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('fridge')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Refrigerator className="w-5 h-5 text-stone-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-stone-100">
                  VeggieFridge
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  Zero-Waste
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Smart vegetarian pantry & recipe guide
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              id="tab-fridge"
              onClick={() => setActiveTab('fridge')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'fridge'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <Refrigerator className="w-4 h-4" />
              <span>Fridge</span>
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-stone-700 text-stone-300 font-mono">
                {totalFridgeItems}
              </span>
              {expiringCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {expiringCount} soon
                </span>
              )}
            </button>

            <button
              id="tab-recipes"
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'recipes'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Recipes</span>
            </button>

            <button
              id="tab-favorites"
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'favorites'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-stone-700 text-stone-300 font-mono">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              id="tab-shopping"
              onClick={() => setActiveTab('shopping')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'shopping'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Shopping List</span>
              {shoppingCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-emerald-500 text-stone-950 font-mono font-bold">
                  {shoppingCount}
                </span>
              )}
            </button>

            <button
              id="tab-receipt"
              onClick={() => setActiveTab('receipt')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'receipt'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Receipt</span>
            </button>

            <button
              id="tab-swaps"
              onClick={() => setActiveTab('swaps')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'swaps'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Budget Swaps</span>
            </button>
          </nav>

          {/* Right Action: Preferences */}
          <div className="flex items-center gap-2">
            <button
              id="btn-preferences"
              onClick={onOpenPreferences}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
              title="Personalize diet, budget, and cuisines"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Preferences</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-800 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('fridge')}
            className={`flex flex-col items-center py-1 px-2.5 rounded text-[11px] font-medium relative ${
              activeTab === 'fridge' ? 'text-emerald-400' : 'text-stone-400'
            }`}
          >
            <Refrigerator className="w-4 h-4" />
            <span>Fridge</span>
            {expiringCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex flex-col items-center py-1 px-2.5 rounded text-[11px] font-medium ${
              activeTab === 'recipes' ? 'text-emerald-400' : 'text-stone-400'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Recipes</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex flex-col items-center py-1 px-2.5 rounded text-[11px] font-medium ${
              activeTab === 'favorites' ? 'text-emerald-400' : 'text-stone-400'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>

          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex flex-col items-center py-1 px-2.5 rounded text-[11px] font-medium relative ${
              activeTab === 'shopping' ? 'text-emerald-400' : 'text-stone-400'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>List</span>
            {shoppingCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`flex flex-col items-center py-1 px-2.5 rounded text-[11px] font-medium ${
              activeTab === 'receipt' ? 'text-emerald-400' : 'text-stone-400'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('swaps')}
            className={`flex flex-col items-center py-1 px-2.5 rounded text-[11px] font-medium ${
              activeTab === 'swaps' ? 'text-emerald-400' : 'text-stone-400'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Swaps</span>
          </button>
        </div>
      </div>
    </header>
  );
};
