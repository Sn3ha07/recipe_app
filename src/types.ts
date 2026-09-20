export type IngredientCategory = 
  | 'produce'
  | 'dairy_alt'
  | 'protein'
  | 'pantry'
  | 'herbs_spices'
  | 'bakery'
  | 'condiments'
  | 'other';

export interface FridgeItem {
  id: string;
  name: string;
  quantity: string;
  category: IngredientCategory;
  addedDate: string; // ISO date YYYY-MM-DD
  expiryDate: string; // ISO date YYYY-MM-DD
  estimatedDays: number;
  storageTip?: string;
  isCustomExpiry?: boolean;
  notes?: string;
}

export interface CheaperAlternative {
  originalIngredient: string;
  cheaperAlternative: string;
  estimatedSavingsPercentage?: number;
  why: string;
  savingsTip: string;
}

export interface RecipeLink {
  title: string;
  query: string;
  whyTry: string;
  suggestedSource?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  cuisine: string;
  budgetTier: 'budget' | 'everyday' | 'gourmet';
  usedFridgeIngredients: string[];
  expiringItemsSaved: string[];
  additionalIngredientsNeeded: {
    name: string;
    amount: string;
    estimatedCost?: string;
    optional?: boolean;
  }[];
  missingIngredientsCount?: number;
  missingIngredientsRequiredNotice?: string;
  cheaperAlternatives?: CheaperAlternative[];
  instructions: string[];
  nutritionHighlights?: string;
  relatedRecipeLinks?: RecipeLink[];
  tags?: string[];
  isFavorite?: boolean;
  savedAt?: string;
  // The real recipe this one was adapted from, when Google Search found it
  source?: { name: string; creator?: string; url: string };
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  category: IngredientCategory;
  isChecked: boolean;
  recipeSource?: string;
  cheaperSwapSuggestion?: string;
  addedAt: string;
}

export interface UserPreferences {
  dietaryNuance: 'pure_vegetarian' | 'vegan' | 'lacto_vegetarian' | 'jain' | 'gluten_free_vegetarian';
  budgetTier: 'budget' | 'everyday' | 'gourmet';
  cookingTimeMax: number; // minutes
  servings: number;
  cuisinePreferences: string[];
  allergiesOrDislikes: string[];
  autoRemindDays: number; // e.g. notify if expiring in <= 3 days
}

export interface ReceiptScanItem {
  name: string;
  quantity: string;
  category: IngredientCategory;
  estimatedShelfLifeDays: number;
  storageTip: string;
  selected?: boolean;
}
