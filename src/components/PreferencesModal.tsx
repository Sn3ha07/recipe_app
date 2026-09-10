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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="preferences-modal"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Personal Taste & Dietary Setup
              </h2>
              <p className="text-xs text-stone-500">
                Simple 1-step preferences for custom recipes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs sm:text-sm">
          {/* 1. Dietary Nuance */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Dietary Restrictions</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'pure_vegetarian', title: 'Pure Vegetarian', desc: 'Dairy allowed, no meat/fish' },
                { id: 'vegan', title: '100% Vegan', desc: 'Plant-based only, no dairy/honey' },
                { id: 'jain', title: 'Jain Vegetarian', desc: 'No root vegetables, onions, or garlic' },
                { id: 'gluten_free_vegetarian', title: 'Gluten-Free Veggie', desc: 'Strictly wheat/gluten-free' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDiet(opt.id as any)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    diet === opt.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{opt.title}</span>
                    {diet === opt.id && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Budget Tier */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Recipe Budget Style</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'budget', title: 'Budget Star', desc: 'Cheap staples & swaps' },
                { id: 'everyday', title: 'Everyday', desc: 'Balanced home meals' },
                { id: 'gourmet', title: 'Gourmet', desc: 'Culinary flair' },
              ].map((b) => (
                <div
                  key={b.id}
                  onClick={() => setBudget(b.id as any)}
                  className={`p-2.5 rounded-2xl border text-center cursor-pointer transition-all ${
                    budget === b.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="font-bold block">{b.title}</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">{b.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Maximum Cooking Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Max Cooking Time</span>
              </label>
              <span className="font-bold text-stone-900">{maxTime} minutes</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={maxTime}
              onChange={(e) => setMaxTime(parseInt(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>15m (Quick)</span>
              <span>35m (Standard)</span>
              <span>60m (Weekend)</span>
            </div>
          </div>

          {/* 4. Favorite Cuisines */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>Favorite Cuisines & Styles</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CUISINES.map((c) => {
                const selected = cuisines.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCuisine(c)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      selected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Allergies / Disliked items */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-800 uppercase tracking-wider">
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
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddDislike}
                className="px-3 py-2 rounded-xl bg-stone-800 text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>
            {dislikes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {dislikes.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-xs"
                  >
                    <span>{d}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDislike(d)}
                      className="text-stone-400 hover:text-stone-700"
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
        <div className="sticky bottom-0 bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
