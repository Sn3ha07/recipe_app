import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Refrigerator, 
  Coins, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ShoppingListItem, IngredientCategory } from '../types';
import { estimateIngredientShelfLife, calculateExpiryDate } from '../utils/expiryRules';

interface ShoppingListViewProps {
  items: ShoppingListItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingListItem, 'id' | 'addedAt'>) => void;
  onTransferCheckedToFridge: (checkedItems: ShoppingListItem[]) => void;
  onClearCompleted: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onTransferCheckedToFridge,
  onClearCompleted,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('1 pack');
  const [category, setCategory] = useState<IngredientCategory>('produce');

  const checkedCount = items.filter((i) => i.isChecked).length;
  const uncheckedCount = items.length - checkedCount;

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      amount: amount.trim() || '1 item',
      category,
      isChecked: false,
    });

    setName('');
    setAmount('1 pack');
  };

  const handleTransferToFridge = () => {
    const checked = items.filter((i) => i.isChecked);
    if (checked.length === 0) return;
    onTransferCheckedToFridge(checked);
  };

  return (
    <div id="shopping-list-view" className="space-y-6">
      {/* Header & Quick Action */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h2 className="font-serif font-bold text-stone-900 text-xl">
              Smart Shopping List ({uncheckedCount} remaining)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Generated from recipes and manual staples. Cross off items as you shop!
          </p>
        </div>

        {checkedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleTransferToFridge}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Refrigerator className="w-4 h-4" />
              <span>Transfer {checkedCount} Bought to Fridge</span>
            </button>

            <button
              onClick={onClearCompleted}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium transition-colors cursor-pointer"
            >
              Clear Checked
            </button>
          </div>
        )}
      </div>

      {/* Manual Add Form */}
      <form onSubmit={handleManualAdd} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6">
            <input
              type="text"
              placeholder="Add item e.g. Nutritional yeast, Coconut milk, Oat flour..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="Qty (e.g. 1 can, 500g)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="produce">Produce</option>
              <option value="protein">Veg Protein</option>
              <option value="dairy_alt">Dairy / Alt</option>
              <option value="pantry">Pantry</option>
              <option value="herbs_spices">Herbs & Spices</option>
              <option value="bakery">Bakery</option>
              <option value="condiments">Condiments</option>
            </select>

            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
            <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif font-bold text-stone-800 text-base">Your shopping list is clear</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Add items manually or click "Add to Shopping List" from any recipe you want to make!
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 shadow-xs overflow-hidden">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 flex items-start justify-between gap-3 transition-colors ${
                item.isChecked ? 'bg-stone-50/70 opacity-60' : 'hover:bg-stone-50/40'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => onToggleItem(item.id)}
                  className="mt-0.5 text-emerald-600 hover:text-emerald-700 cursor-pointer shrink-0"
                >
                  {item.isChecked ? (
                    <CheckSquare className="w-5 h-5 fill-emerald-100" />
                  ) : (
                    <Square className="w-5 h-5 text-stone-400" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        item.isChecked ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      {item.amount}
                    </span>
                  </div>

                  {item.recipeSource && (
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      For: {item.recipeSource}
                    </p>
                  )}

                  {/* Cheaper alternative tip on shopping list */}
                  {item.cheaperSwapSuggestion && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 max-w-fit">
                      <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Budget Tip: {item.cheaperSwapSuggestion}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeleteItem(item.id)}
                className="text-stone-300 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
