import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  Lightbulb, 
  Flame, 
  UtensilsCrossed, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  Check,
  ChefHat,
  X
} from 'lucide-react';
import { FridgeItem, IngredientCategory } from '../types';
import { 
  estimateIngredientShelfLife, 
  calculateExpiryDate, 
  getDaysRemaining, 
  getExpiryStatus,
  detectCategoryFromName
} from '../utils/expiryRules';

interface FridgeViewProps {
  items: FridgeItem[];
  onAddItem: (item: Omit<FridgeItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onCookWithExpiring: () => void;
  onCookWithIngredient: (ingredientName: string | string[]) => void;
  onResetStarter: () => void;
}

export const FridgeView: React.FC<FridgeViewProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onCookWithExpiring,
  onCookWithIngredient,
  onResetStarter,
}) => {
  // Input form state
  const [inputName, setInputName] = useState('');
  const [inputQuantity, setInputQuantity] = useState('1 unit');
  const [customDays, setCustomDays] = useState<number | null>(null);
  const [showCustomDays, setShowCustomDays] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyExpiring, setOnlyExpiring] = useState(false);
  const [selectedForCooking, setSelectedForCooking] = useState<string[]>([]);

  const toggleSelectForCooking = (name: string) => {
    setSelectedForCooking((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Dynamic automatic guideline preview as user types!
  const autoGuideline = useMemo(() => {
    if (!inputName.trim()) return null;
    return estimateIngredientShelfLife(inputName);
  }, [inputName]);

  // Handle adding an ingredient
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const rule = estimateIngredientShelfLife(inputName);
    const days = (showCustomDays && customDays && customDays > 0) ? customDays : rule.days;
    const addedDate = new Date().toISOString().split('T')[0];
    const expiryDate = calculateExpiryDate(days);

    onAddItem({
      name: inputName.trim(),
      quantity: inputQuantity.trim() || '1 unit',
      category: rule.category,
      addedDate,
      expiryDate,
      estimatedDays: days,
      storageTip: rule.storageTip,
      isCustomExpiry: showCustomDays && customDays !== null,
    });

    // Reset inputs
    setInputName('');
    setInputQuantity('1 unit');
    setCustomDays(null);
    setShowCustomDays(false);
  };

  // Calculate days left & status for each item
  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      const daysLeft = getDaysRemaining(item.expiryDate);
      const statusInfo = getExpiryStatus(daysLeft);
      return {
        ...item,
        daysLeft,
        statusInfo,
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft); // Soonest expiring first
  }, [items]);

  // Urgent items needing rescue
  const urgentItems = useMemo(() => {
    return enrichedItems.filter((item) => item.daysLeft <= 3);
  }, [enrichedItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return enrichedItems.filter((item) => {
      if (onlyExpiring && item.daysLeft > 3) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [enrichedItems, selectedCategory, searchQuery, onlyExpiring]);

  // Category label formatter
  const getCategoryBadge = (cat: IngredientCategory) => {
    const labels: Record<IngredientCategory, { label: string; color: string }> = {
      produce: { label: 'Fresh Produce', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      protein: { label: 'Veg Protein', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
      dairy_alt: { label: 'Dairy / Plant Milk', color: 'bg-sky-50 text-sky-800 border-sky-200' },
      herbs_spices: { label: 'Herbs & Seasoning', color: 'bg-teal-50 text-teal-800 border-teal-200' },
      pantry: { label: 'Pantry', color: 'bg-amber-50 text-amber-800 border-amber-200' },
      bakery: { label: 'Bakery', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
      condiments: { label: 'Condiments', color: 'bg-rose-50 text-rose-800 border-rose-200' },
      other: { label: 'Item', color: 'bg-stone-50 text-stone-700 border-stone-200' },
    };
    return labels[cat] || labels.other;
  };

  return (
    <div id="fridge-view" className="space-y-6">
      {/* 1. Urgent Expiry Reminder Banner (Food Waste Prevention) */}
      {urgentItems.length > 0 && (
        <div id="urgent-expiry-banner" className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                    {urgentItems.length === 1 ? '1 item needs using!' : `${urgentItems.length} items need using soon!`}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                    Rescue Alert
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Cook with these within 1–3 days to prevent food waste and save your grocery money.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {urgentItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100/90 text-amber-950 border border-amber-300"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-[11px] opacity-80">({item.daysLeft <= 0 ? 'Today' : `${item.daysLeft}d left`})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              id="btn-cook-expiring"
              onClick={onCookWithExpiring}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-sm transition-all shadow-xs hover:shadow cursor-pointer shrink-0"
            >
              <Flame className="w-4 h-4 text-stone-950 fill-stone-950" />
              <span>Cook With These Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Quick Input Bar with Auto Guideline Expiry (No need to ask user!) */}
      <div id="add-ingredient-card" className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
              Add To Virtual Fridge
            </h2>
          </div>
          <span className="text-xs text-stone-600 hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            Automatic expiry calculated instantly
          </span>
        </div>

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-7">
              <label htmlFor="ingredient-name" className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                Ingredient Name
              </label>
              <input
                id="ingredient-name"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Baby Spinach, Firm Tofu, Carrots, Greek Yogurt..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-stone-500"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="ingredient-qty" className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                Quantity
              </label>
              <input
                id="ingredient-qty"
                type="text"
                value={inputQuantity}
                onChange={(e) => setInputQuantity(e.target.value)}
                placeholder="e.g. 1 bunch, 400g, 2 whole"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-stone-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                id="btn-submit-ingredient"
                type="submit"
                disabled={!inputName.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Real-time automatic guideline badge as user types */}
          {autoGuideline && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Guideline Shelf Life: <strong>~{autoGuideline.days} days</strong>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Tip: {autoGuideline.storageTip}
              </span>

              <button
                type="button"
                onClick={() => setShowCustomDays(!showCustomDays)}
                className="text-stone-700 hover:text-stone-900 underline underline-offset-2 ml-auto cursor-pointer"
              >
                {showCustomDays ? 'Use auto days' : 'Custom expiry days?'}
              </button>
            </div>
          )}

          {/* Optional manual custom days override */}
          {showCustomDays && (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Override shelf life:</span>
              <input
                type="number"
                min="1"
                max="365"
                value={customDays ?? autoGuideline?.days ?? 7}
                onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                className="w-20 px-2.5 py-1 rounded-lg border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span>days from today</span>
            </div>
          )}
        </form>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ingredients in fridge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setOnlyExpiring(!onlyExpiring)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 shrink-0 ${
              onlyExpiring
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Expiring Soon ({urgentItems.length})</span>
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-stone-700 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 shrink-0"
          >
            <option value="all">All Categories</option>
            <option value="produce">Fresh Produce</option>
            <option value="protein">Vegetarian Protein</option>
            <option value="dairy_alt">Dairy & Plant Milk</option>
            <option value="herbs_spices">Herbs & Seasoning</option>
            <option value="pantry">Pantry Items</option>
            <option value="condiments">Condiments</option>
          </select>

          {items.length === 0 && (
            <button
              onClick={onResetStarter}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Load Sample Fridge</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Selected Ingredients to Cook Bar */}
      {selectedForCooking.length > 0 && (
        <div className="p-4 bg-emerald-800 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
              {selectedForCooking.length}
            </div>
            <div>
              <p className="text-sm font-bold">Selected ingredients to cook with:</p>
              <p className="text-xs text-emerald-100 line-clamp-1">{selectedForCooking.join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedForCooking([])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => onCookWithIngredient(selectedForCooking)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Find Recipes for Selected ({selectedForCooking.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Fridge Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
            <UtensilsCrossed className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif font-bold text-stone-800 text-base">No ingredients found</h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery || onlyExpiring || selectedCategory !== 'all'
              ? 'Try adjusting your search query or filters to see more ingredients.'
              : 'Your fridge is empty! Add ingredients above or load starter sample items.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={onResetStarter}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              Populate Sample Vegetarian Fridge
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const catBadge = getCategoryBadge(item.category);
            const isSelected = selectedForCooking.includes(item.name);
            return (
              <div
                key={item.id}
                className={`bg-white border ${
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-stone-200/90 hover:border-stone-300 shadow-xs'
                } rounded-2xl p-4 transition-all flex flex-col justify-between group`}
              >
                <div>
                  {/* Top row: Category badge & Expiry Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${catBadge.color}`}>
                      {catBadge.label}
                    </span>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${item.statusInfo.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.statusInfo.dotColor}`}></span>
                      {item.statusInfo.label}
                    </span>
                  </div>

                  {/* Name & Quantity */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-base group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Quantity: <span className="font-medium text-stone-700">{item.quantity}</span>
                      </p>
                    </div>
                  </div>

                  {/* Storage Tip */}
                  {item.storageTip && (
                    <div className="mt-3 p-2 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2 text-[11px] text-stone-600 leading-relaxed">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{item.storageTip}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelectForCooking(item.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                      <span>{isSelected ? 'Selected' : 'Select'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCookWithIngredient(item.name)}
                      className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer py-1"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Find recipes</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="text-stone-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
