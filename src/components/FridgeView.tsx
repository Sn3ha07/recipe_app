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

// Shared look, from docs/design-system.md
const CARD = 'bg-white rounded-3xl ring-1 ring-ink/10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]';
const LABEL = 'font-mono text-xs uppercase tracking-[0.18em] text-ink/65';
const FIELD = 'w-full px-5 py-3 rounded-full bg-cream/60 ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-ink';
const PILL_DARK = 'rounded-full bg-ink text-cream font-medium hover:bg-ink-soft transition-colors cursor-pointer';

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
      produce: { label: 'Fresh Produce', color: 'bg-emerald-100 text-emerald-800' },
      protein: { label: 'Veg Protein', color: 'bg-sky text-ink' },
      dairy_alt: { label: 'Dairy / Plant Milk', color: 'bg-sand text-ink' },
      herbs_spices: { label: 'Herbs & Seasoning', color: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' },
      pantry: { label: 'Pantry', color: 'bg-amber-100 text-amber-900' },
      bakery: { label: 'Bakery', color: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200' },
      condiments: { label: 'Condiments', color: 'bg-stone-200 text-stone-700' },
      other: { label: 'Item', color: 'bg-stone-100 text-stone-700' },
    };
    return labels[cat] || labels.other;
  };

  return (
    <div id="fridge-view" className={`space-y-8 ${selectedForCooking.length > 0 ? 'pb-40 sm:pb-28' : ''}`}>
      {/* 1. Urgent Expiry Reminder Banner (Food Waste Prevention) */}
      {urgentItems.length > 0 && (
        <div id="urgent-expiry-banner" className="bg-amber-50 ring-1 ring-amber-200 rounded-3xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-amber-500 text-ink flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-normal tracking-[-0.03em] text-ink">
                    {urgentItems.length === 1 ? '1 item needs using!' : `${urgentItems.length} items need using soon!`}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] px-2.5 py-1 bg-amber-200 text-amber-900 rounded-full">
                    Rescue Alert
                  </span>
                </div>
                <p className="hidden sm:block text-sm text-ink/70 mt-2">
                  Cook with these within 1–3 days to prevent food waste and save your grocery money.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {urgentItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white text-ink ring-1 ring-amber-200"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-xs text-ink/60">({item.daysLeft <= 0 ? 'Today' : `${item.daysLeft}d left`})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              id="btn-cook-expiring"
              onClick={onCookWithExpiring}
              className={`inline-flex items-center justify-center gap-2 px-6 min-h-11 text-sm shrink-0 ${PILL_DARK}`}
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Get Recipes for These</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Quick Input Bar with Auto Guideline Expiry (No need to ask user!) */}
      <div id="add-ingredient-card" className={`${CARD} p-6 sm:p-7`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cream text-ink flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-normal tracking-[-0.03em] text-ink">
              Add To Virtual Fridge
            </h2>
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink/65 hidden sm:inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            Automatic expiry calculated instantly
          </span>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <label htmlFor="ingredient-name" className={`block mb-2 ${LABEL}`}>
                Ingredient Name
              </label>
              <input
                id="ingredient-name"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Baby Spinach"
                className={FIELD}
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="ingredient-qty" className={`block mb-2 ${LABEL}`}>
                Quantity
              </label>
              <input
                id="ingredient-qty"
                type="text"
                value={inputQuantity}
                onChange={(e) => setInputQuantity(e.target.value)}
                placeholder="e.g. 400g"
                className={FIELD}
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                id="btn-submit-ingredient"
                type="submit"
                disabled={!inputName.trim()}
                className={`w-full py-3 px-5 text-sm flex items-center justify-center gap-1.5 disabled:bg-ink/10 disabled:text-ink/35 disabled:cursor-not-allowed ${PILL_DARK}`}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Real-time automatic guideline badge as user types */}
          {autoGuideline && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Guideline Shelf Life: <strong>~{autoGuideline.days} days</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream text-ink/75 font-medium">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Tip: {autoGuideline.storageTip}
              </span>

              <button
                type="button"
                onClick={() => setShowCustomDays(!showCustomDays)}
                className="text-ink/70 hover:text-ink underline underline-offset-2 ml-auto cursor-pointer"
              >
                {showCustomDays ? 'Use auto days' : 'Custom expiry days?'}
              </button>
            </div>
          )}

          {/* Optional manual custom days override */}
          {showCustomDays && (
            <div className="flex items-center gap-3 p-4 bg-cream rounded-2xl text-xs text-ink/75">
              <Calendar className="w-4 h-4 text-ink/60" />
              <span>Override shelf life:</span>
              <input
                type="number"
                min="1"
                max="365"
                value={customDays ?? autoGuideline?.days ?? 7}
                onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-1.5 rounded-full bg-white ring-1 ring-ink/10 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
              <span>days from today</span>
            </div>
          )}
        </form>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ink/40 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ingredients in fridge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-full bg-white ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setOnlyExpiring(!onlyExpiring)}
            className={`px-4 min-h-11 md:min-h-10 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              onlyExpiring
                ? 'bg-ink text-cream'
                : 'bg-white text-ink/75 ring-1 ring-ink/10 hover:bg-cream'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyExpiring ? 'text-amber-400' : 'text-amber-500'}`} />
            <span>Expiring Soon ({urgentItems.length})</span>
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            aria-label="Filter by category"
            className="px-4 min-h-11 md:min-h-10 rounded-full text-xs font-medium bg-white text-ink/75 ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-ink shrink-0"
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
              className="px-4 py-2 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Load Sample Fridge</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Selected Ingredients to Cook Bar */}
      {selectedForCooking.length > 0 && (
        <div id="selection-bar" className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-3xl p-4 sm:p-5 bg-ink text-cream rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-cream/15 flex items-center justify-center font-mono text-sm">
              {selectedForCooking.length}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Selected ingredients to cook with:</p>
              <p className="text-xs text-cream/70 line-clamp-1">{selectedForCooking.join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedForCooking([])}
              className="min-h-11 px-5 rounded-full bg-cream/10 hover:bg-cream/20 text-xs font-medium cursor-pointer transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => onCookWithIngredient(selectedForCooking)}
              className="flex-1 sm:flex-none min-h-11 px-5 justify-center rounded-full bg-cream text-ink hover:bg-white text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Get Recipes for Selected ({selectedForCooking.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Fridge Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white/60 border border-dashed border-ink/20 rounded-3xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-cream text-ink/40 mx-auto flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-normal tracking-[-0.02em] text-ink">No ingredients found</h3>
          <p className="text-sm text-ink/60 mt-2 max-w-sm mx-auto">
            {searchQuery || onlyExpiring || selectedCategory !== 'all'
              ? 'Try adjusting your search query or filters to see more ingredients.'
              : 'Your fridge is empty! Add ingredients above or load starter sample items.'}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={onResetStarter}
              className={`px-5 py-2.5 text-xs ${PILL_DARK}`}
            >
              Populate Sample Vegetarian Fridge
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const catBadge = getCategoryBadge(item.category);
            const isSelected = selectedForCooking.includes(item.name);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-6 transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'ring-2 ring-ink shadow-[0_8px_24px_rgba(0,0,0,0.18)]'
                    : 'ring-1 ring-ink/10 hover:ring-ink/25 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                }`}
              >
                <div>
                  {/* Top row: Category badge & Expiry Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${catBadge.color}`}>
                      {catBadge.label}
                    </span>

                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${item.statusInfo.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.statusInfo.dotColor}`}></span>
                      {item.statusInfo.label}
                    </span>
                  </div>

                  {/* Name & Quantity */}
                  <div>
                    <h3 className="text-xl font-medium tracking-[-0.02em] text-ink">
                      {item.name}
                    </h3>
                    <p className="text-sm text-ink/60 mt-1">
                      Quantity: <span className="font-medium text-ink/80">{item.quantity}</span>
                    </p>
                  </div>

                  {/* Storage Tip */}
                  {item.storageTip && (
                    <div className="mt-4 p-3 rounded-2xl bg-cream flex items-start gap-2 text-xs text-ink/70 leading-relaxed">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{item.storageTip}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-ink/10 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectForCooking(item.name)}
                      className={`min-h-11 px-4 rounded-full text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-ink text-cream'
                          : 'bg-white text-ink/70 ring-1 ring-ink/15 hover:bg-cream'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isSelected ? 'text-cream' : 'text-ink/40'}`} />
                      <span>{isSelected ? 'Selected' : 'Select'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCookWithIngredient(item.name)}
                      className="inline-flex items-center gap-1.5 text-ink font-medium hover:underline underline-offset-2 transition-colors cursor-pointer min-h-11 px-1"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Get recipes</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="text-ink/45 hover:text-brand-red transition-colors w-11 h-11 shrink-0 flex items-center justify-center rounded-full hover:bg-brand-red/10 cursor-pointer"
                    title="Remove item"
                    aria-label={`Remove ${item.name}`}
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
