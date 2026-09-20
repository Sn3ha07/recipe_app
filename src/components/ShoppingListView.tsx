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

// Shared look, from docs/design-system.md
const CARD = 'bg-white rounded-3xl ring-1 ring-ink/10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55';
const FIELD = 'w-full px-5 py-3 rounded-full bg-cream/60 ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink';
const PILL_DARK = 'rounded-full bg-ink text-cream font-medium hover:bg-ink-soft transition-colors cursor-pointer';

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
    <div id="shopping-list-view" className="space-y-8">
      {/* Header & Quick Action */}
      <div className={`${CARD} p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cream text-ink flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h2 className="text-3xl font-normal tracking-[-0.03em] text-ink">
              Smart Shopping List ({uncheckedCount} remaining)
            </h2>
          </div>
          <p className="text-sm text-ink/60 mt-3">
            Generated from recipes and manual staples. Cross off items as you shop!
          </p>
        </div>

        {checkedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleTransferToFridge}
              className={`px-5 py-3 text-sm flex items-center gap-1.5 ${PILL_DARK}`}
            >
              <Refrigerator className="w-4 h-4" />
              <span>Transfer {checkedCount} Bought to Fridge</span>
            </button>

            <button
              onClick={onClearCompleted}
              className="px-4 py-3 rounded-full bg-white text-ink/75 ring-1 ring-ink/10 hover:bg-cream text-sm font-medium transition-colors cursor-pointer"
            >
              Clear Checked
            </button>
          </div>
        )}
      </div>

      {/* Manual Add Form */}
      <form onSubmit={handleManualAdd} className={`${CARD} p-5`}>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <input
              type="text"
              placeholder="Add item e.g. Nutritional yeast, Coconut milk, Oat flour..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={FIELD}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="Qty (e.g. 1 can, 500g)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={FIELD}
            />
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-3 text-sm rounded-full bg-cream/60 ring-1 ring-ink/10 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
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
              className={`px-4 py-3 flex items-center justify-center shrink-0 disabled:bg-ink/10 disabled:text-ink/35 disabled:cursor-not-allowed ${PILL_DARK}`}
              title="Add item"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="bg-white/60 border border-dashed border-ink/20 rounded-3xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-cream text-ink/40 mx-auto flex items-center justify-center mb-4">
            <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-normal tracking-[-0.02em] text-ink">Your shopping list is clear</h3>
          <p className="text-sm text-ink/60 mt-2 max-w-sm mx-auto">
            Add items manually or click "Add to Shopping List" from any recipe you want to make!
          </p>
        </div>
      ) : (
        <div className={`${CARD} divide-y divide-ink/10 overflow-hidden`}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-3 transition-colors ${
                item.isChecked ? 'bg-cream/60 opacity-60' : 'hover:bg-cream/40'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => onToggleItem(item.id)}
                  className="mt-0.5 cursor-pointer shrink-0"
                >
                  {item.isChecked ? (
                    <CheckSquare className="w-5 h-5 text-ink" />
                  ) : (
                    <Square className="w-5 h-5 text-ink/35" />
                  )}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-base font-medium ${
                        item.isChecked ? 'line-through text-ink/40' : 'text-ink'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="font-mono text-[11px] text-ink/60 bg-cream px-2 py-0.5 rounded-full">
                      {item.amount}
                    </span>
                  </div>

                  {item.recipeSource && (
                    <p className="text-[11px] text-ink/45 mt-0.5">
                      For: {item.recipeSource}
                    </p>
                  )}

                  {/* Cheaper alternative tip on shopping list */}
                  {item.cheaperSwapSuggestion && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink bg-amber-50 ring-1 ring-amber-200 px-3 py-1 rounded-full max-w-fit">
                      <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Budget Tip: {item.cheaperSwapSuggestion}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeleteItem(item.id)}
                className="text-ink/35 hover:text-brand-red hover:bg-brand-red/10 p-2 rounded-full transition-colors cursor-pointer"
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
