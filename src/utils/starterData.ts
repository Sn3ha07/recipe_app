import { FridgeItem, UserPreferences } from '../types';
import { calculateExpiryDate } from './expiryRules';

export const INITIAL_USER_PREFERENCES: UserPreferences = {
  dietaryNuance: 'pure_vegetarian',
  budgetTier: 'everyday',
  cookingTimeMax: 35,
  servings: 2,
  cuisinePreferences: ['Mediterranean', 'East Asian', 'Indian', 'Mexican'],
  allergiesOrDislikes: [],
  autoRemindDays: 3,
};

// Realistic starter fridge items with staggered expiry dates
export const INITIAL_FRIDGE_ITEMS: FridgeItem[] = [
  {
    id: 'starter-1',
    name: 'Baby Spinach',
    quantity: '1 bag (250g)',
    category: 'produce',
    addedDate: calculateExpiryDate(-3),
    expiryDate: calculateExpiryDate(1), // Expires tomorrow!
    estimatedDays: 4,
    storageTip: 'Store in crisper with a clean paper towel to absorb excess moisture',
  },
  {
    id: 'starter-2',
    name: 'Extra Firm Tofu',
    quantity: '1 block (400g)',
    category: 'protein',
    addedDate: calculateExpiryDate(-4),
    expiryDate: calculateExpiryDate(2), // 2 days left
    estimatedDays: 7,
    storageTip: 'Once opened, submerge in fresh cold water and change water daily',
  },
  {
    id: 'starter-3',
    name: 'Cremini Mushrooms',
    quantity: '200g',
    category: 'produce',
    addedDate: calculateExpiryDate(-2),
    expiryDate: calculateExpiryDate(2), // 2 days left
    estimatedDays: 5,
    storageTip: 'Keep in a breathable brown paper bag, never sealed in wet plastic',
  },
  {
    id: 'starter-4',
    name: 'Bell Peppers',
    quantity: '2 whole',
    category: 'produce',
    addedDate: calculateExpiryDate(-1),
    expiryDate: calculateExpiryDate(6), // 6 days left
    estimatedDays: 9,
    storageTip: 'Keep dry in the crisper drawer',
  },
  {
    id: 'starter-5',
    name: 'Greek Yogurt (or Oat Yogurt)',
    quantity: '1 tub (500g)',
    category: 'dairy_alt',
    addedDate: calculateExpiryDate(-2),
    expiryDate: calculateExpiryDate(8), // 8 days left
    estimatedDays: 12,
    storageTip: 'Level the top surface before sealing to reduce liquid separation',
  },
  {
    id: 'starter-6',
    name: 'Carrots',
    quantity: '4 whole',
    category: 'produce',
    addedDate: calculateExpiryDate(-1),
    expiryDate: calculateExpiryDate(18), // 18 days left
    estimatedDays: 21,
    storageTip: 'Remove green tops and store in crisper drawer',
  },
];
