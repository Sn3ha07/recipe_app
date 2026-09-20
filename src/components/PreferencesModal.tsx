import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  Check, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Leaf, 
  Utensils 
} from 'lucide-react';
import { UserPreferences } from '../types';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
}

// Shared look, from docs/design-system.md
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55';
const FIELD = 'w-full px-5 py-3 rounded-full bg-cream/60 ring-1 ring-ink/10 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink';
const PILL_DARK = 'rounded-full bg-ink text-cream font-medium hover:bg-ink-soft transition-colors cursor-pointer';
const OVERLAY = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto';
const PANEL = 'bg-white rounded-3xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_0_1px_rgba(33,12,2,0.1),0_24px_60px_-12px_rgba(0,0,0,0.55)] animate-in fade-in zoom-in-95 duration-150';

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [diet, setDiet] = useState(preferences.dietaryNuance);
  const [budget, setBudget] = useState(preferences.budgetTier);
  const [maxTime, setMaxTime] = useState(preferences.cookingTimeMax || 35);
  const [cuisines, setCuisines] = useState<string[]>(preferences.cuisinePreferences || []);
  const [dislikeInput, setDislikeInput] = useState('');
  const [dislikes, setDislikes] = useState<string[]>(preferences.allergiesOrDislikes || []);

  if (!isOpen) return null;

  const ALL_CUISINES = [
    'Mediterranean',
    'Indian',
    'Mexican',
    'East Asian',
    'Italian',
    'Middle Eastern',
    'American Comfort',
    'Thai & Southeast Asian',
  ];

  const toggleCuisine = (c: string) => {
    if (cuisines.includes(c)) {
      setCuisines(cuisines.filter((item) => item !== c));
    } else {
      setCuisines([...cuisines, c]);
    }
  };

  const handleAddDislike = () => {
    if (dislikeInput.trim() && !dislikes.includes(dislikeInput.trim())) {
      setDislikes([...dislikes, dislikeInput.trim()]);
      setDislikeInput('');
    }
  };

  const handleRemoveDislike = (item: string) => {
    setDislikes(dislikes.filter((d) => d !== item));
  };

  const handleSave = () => {
    onSavePreferences({
      ...preferences,
      dietaryNuance: diet,
      budgetTier: budget,
      cookingTimeMax: maxTime,
      cuisinePreferences: cuisines,
      allergiesOrDislikes: dislikes,
    });
    onClose();
  };

  const optionClass = (selected: boolean) =>
    `p-4 rounded-2xl cursor-pointer transition-all ${
      selected ? 'ring-2 ring-ink bg-cream' : 'ring-1 ring-ink/10 bg-white hover:ring-ink/25'
    }`;

  return (
    <div className={OVERLAY}>
      <div id="preferences-modal" className={`${PANEL} max-w-lg`}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-ink/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cream text-ink flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-normal tracking-[-0.03em] text-ink">
                Personal Taste & Dietary Setup
              </h2>
              <p className="text-xs text-ink/55">
                Simple 1-step preferences for custom recipes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-ink/50 hover:text-ink hover:bg-cream transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-7 text-sm">
          {/* 1. Dietary Nuance */}
          <div className="space-y-3">
            <label className={`flex items-center gap-1.5 ${LABEL}`}>
              <Leaf className="w-4 h-4 text-emerald-700" />
              <span>Dietary Restrictions</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'pure_vegetarian', title: 'Pure Vegetarian', desc: 'Dairy allowed, no meat/fish' },
                { id: 'vegan', title: '100% Vegan', desc: 'Plant-based only, no dairy/honey' },
                { id: 'jain', title: 'Jain Vegetarian', desc: 'No root vegetables, onions, or garlic' },
                { id: 'gluten_free_vegetarian', title: 'Gluten-Free Veggie', desc: 'Strictly wheat/gluten-free' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDiet(opt.id as any)}
                  className={optionClass(diet === opt.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">{opt.title}</span>
                    {diet === opt.id && <Check className="w-4 h-4 text-ink stroke-[3]" />}
                  </div>
                  <p className="text-xs text-ink/55 mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Budget Tier */}
          <div className="space-y-3">
            <label className={`flex items-center gap-1.5 ${LABEL}`}>
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Recipe Budget Style</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'budget', title: 'Budget Star', desc: 'Cheap staples & swaps' },
                { id: 'everyday', title: 'Everyday', desc: 'Balanced home meals' },
                { id: 'gourmet', title: 'Gourmet', desc: 'Culinary flair' },
              ].map((b) => (
                <div
                  key={b.id}
                  onClick={() => setBudget(b.id as any)}
                  className={`${optionClass(budget === b.id)} text-center`}
                >
                  <span className="font-medium text-ink block">{b.title}</span>
                  <span className="text-[11px] text-ink/55 mt-0.5 block">{b.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Maximum Cooking Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`flex items-center gap-1.5 ${LABEL}`}>
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Max Cooking Time</span>
              </label>
              <span className="font-medium text-ink">{maxTime} minutes</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={maxTime}
              onChange={(e) => setMaxTime(parseInt(e.target.value))}
              className="w-full accent-ink"
            />
            <div className="flex justify-between text-[11px] text-ink/45">
              <span>15m (Quick)</span>
              <span>35m (Standard)</span>
              <span>60m (Weekend)</span>
            </div>
          </div>

          {/* 4. Favorite Cuisines */}
          <div className="space-y-3">
            <label className={`flex items-center gap-1.5 ${LABEL}`}>
              <Utensils className="w-4 h-4 text-emerald-700" />
              <span>Favorite Cuisines & Styles</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_CUISINES.map((c) => {
                const selected = cuisines.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCuisine(c)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      selected
                        ? 'bg-ink text-cream'
                        : 'bg-white ring-1 ring-ink/15 text-ink/75 hover:bg-cream'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Allergies / Disliked items */}
          <div className="space-y-3">
            <label className={`block ${LABEL}`}>
              Disliked Ingredients / Allergies
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Cilantro, Peanuts, Mushrooms..."
                value={dislikeInput}
                onChange={(e) => setDislikeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDislike();
                  }
                }}
                className={FIELD}
              />
              <button
                type="button"
                onClick={handleAddDislike}
                className={`px-5 py-3 text-sm ${PILL_DARK}`}
              >
                Add
              </button>
            </div>
            {dislikes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {dislikes.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-ink text-xs"
                  >
                    <span>{d}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDislike(d)}
                      className="text-ink/45 hover:text-ink cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-cream px-6 py-4 border-t border-ink/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-white ring-1 ring-ink/15 text-ink/75 text-xs font-medium hover:bg-white/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 text-xs ${PILL_DARK}`}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
