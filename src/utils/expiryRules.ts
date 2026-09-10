import { IngredientCategory } from '../types';

export interface ExpiryRule {
  days: number;
  category: IngredientCategory;
  storageTip: string;
}

// Normalized dictionary of common vegetarian ingredients and their typical fridge shelf life
export const INGREDIENT_EXPIRY_DATABASE: Record<string, ExpiryRule> = {
  // Leafy Greens (Fast spoilage)
  'spinach': { days: 5, category: 'produce', storageTip: 'Keep dry in a sealed container lined with a clean paper towel' },
  'baby spinach': { days: 4, category: 'produce', storageTip: 'Store in crisper drawer, keep dry until washing' },
  'kale': { days: 7, category: 'produce', storageTip: 'Wrap stems in damp paper towel inside a reusable produce bag' },
  'lettuce': { days: 6, category: 'produce', storageTip: 'Store in vegetable crisper, avoid condensation' },
  'arugula': { days: 4, category: 'produce', storageTip: 'Keep chilled; eat quickly before leaves turn yellow' },
  'cabbage': { days: 21, category: 'produce', storageTip: 'Keep whole head intact in the vegetable drawer' },

  // Fresh Herbs (High risk)
  'cilantro': { days: 5, category: 'herbs_spices', storageTip: 'Trim stems and place in a jar with 1 inch of water, loosely covered' },
  'coriander': { days: 5, category: 'herbs_spices', storageTip: 'Keep stem bottoms in water like a bouquet' },
  'parsley': { days: 7, category: 'herbs_spices', storageTip: 'Store upright in a glass of water in the fridge' },
  'basil': { days: 5, category: 'herbs_spices', storageTip: 'Prefers room temperature stems in water; chill only if necessary' },
  'mint': { days: 5, category: 'herbs_spices', storageTip: 'Wrap loosely in moist paper towel in a reusable bag' },
  'green onion': { days: 7, category: 'herbs_spices', storageTip: 'Stand roots down in a small jar of water on fridge shelf' },
  'scallions': { days: 7, category: 'herbs_spices', storageTip: 'Keep roots hydrated for prolonged crispness' },
  'rosemary': { days: 14, category: 'herbs_spices', storageTip: 'Hardy herb; wrap in dry paper towel in crisper' },
  'thyme': { days: 10, category: 'herbs_spices', storageTip: 'Store dry in an airtight container' },

  // Vegetables
  'mushrooms': { days: 5, category: 'produce', storageTip: 'Keep in a breathable brown paper bag, never trapped in wet plastic' },
  'button mushrooms': { days: 5, category: 'produce', storageTip: 'Store in paper bag to absorb excess moisture' },
  'portobello': { days: 6, category: 'produce', storageTip: 'Refrigerate in original packaging or paper bag' },
  'bell pepper': { days: 9, category: 'produce', storageTip: 'Keep dry in the crisper drawer' },
  'capsicum': { days: 9, category: 'produce', storageTip: 'Keep unwashed in the vegetable crisper' },
  'zucchini': { days: 7, category: 'produce', storageTip: 'Store unwashed in vegetable compartment' },
  'courgette': { days: 7, category: 'produce', storageTip: 'Refrigerate dry; slice only when ready to cook' },
  'cucumber': { days: 7, category: 'produce', storageTip: 'Avoid the coldest parts of the fridge to prevent chill injury' },
  'broccoli': { days: 6, category: 'produce', storageTip: 'Mist lightly and wrap loosely in perforated bag' },
  'cauliflower': { days: 8, category: 'produce', storageTip: 'Store head stem-down to keep moisture from pooling' },
  'carrots': { days: 21, category: 'produce', storageTip: 'Remove green leafy tops and keep submerged in water or crisper' },
  'celery': { days: 14, category: 'produce', storageTip: 'Wrap securely in aluminum foil to retain moisture and crispness' },
  'tomatoes': { days: 6, category: 'produce', storageTip: 'Keep stem side down; move to fridge only when fully ripe' },
  'cherry tomatoes': { days: 7, category: 'produce', storageTip: 'Store ventilated; best flavor at cool room temp, fridge extends life' },
  'eggplant': { days: 6, category: 'produce', storageTip: 'Sensitive to cold; use within a few days from crisper' },
  'aubergine': { days: 6, category: 'produce', storageTip: 'Keep in crisper drawer away from ethylene-producing fruits' },
  'green beans': { days: 7, category: 'produce', storageTip: 'Store unwashed in a breathable container' },
  'asparagus': { days: 4, category: 'produce', storageTip: 'Trim bottoms and stand upright in 1 inch of water' },
  'avocado': { days: 4, category: 'produce', storageTip: 'Once ripe, store in fridge to arrest softening' },
  'sweet potato': { days: 28, category: 'produce', storageTip: 'Store in a cool, dark pantry or low-temp crisper' },
  'potato': { days: 30, category: 'produce', storageTip: 'Dark, cool, ventilated place; avoid storing directly with onions' },
  'onion': { days: 30, category: 'produce', storageTip: 'Cool, dry, dark pantry with good airflow' },
  'garlic': { days: 45, category: 'herbs_spices', storageTip: 'Keep bulb intact in cool dry place with airflow' },
  'ginger': { days: 21, category: 'herbs_spices', storageTip: 'Keep unpeeled in a resealable bag in crisper or freeze' },

  // Vegetarian Proteins
  'tofu': { days: 7, category: 'protein', storageTip: 'Once opened, submerge in fresh cold water and change daily' },
  'firm tofu': { days: 7, category: 'protein', storageTip: 'Keep immersed in clean water in airtight container' },
  'silken tofu': { days: 5, category: 'protein', storageTip: 'Consume promptly after breaking package seal' },
  'tempeh': { days: 10, category: 'protein', storageTip: 'Wrap tightly in parchment or airtight container' },
  'edamame': { days: 5, category: 'protein', storageTip: 'Keep refrigerated or freeze for long-term storage' },
  'paneer': { days: 6, category: 'protein', storageTip: 'Keep submerged in light salt brine or airtight wrap' },
  'halloumi': { days: 14, category: 'protein', storageTip: 'Wrap tightly in parchment or beeswax wrap' },
  'cooked lentils': { days: 5, category: 'protein', storageTip: 'Store in sealed glass container in fridge' },
  'cooked chickpeas': { days: 5, category: 'protein', storageTip: 'Rinse and refrigerate in airtight container' },
  'seitan': { days: 7, category: 'protein', storageTip: 'Store in light vegetable broth in a closed container' },

  // Dairy & Plant-based Alternatives
  'milk': { days: 7, category: 'dairy_alt', storageTip: 'Store on an interior shelf, never on the warmer fridge door' },
  'oat milk': { days: 8, category: 'dairy_alt', storageTip: 'Shake well before use; keep chilled at rear of fridge' },
  'soy milk': { days: 8, category: 'dairy_alt', storageTip: 'Keep refrigerated after breaking carton seal' },
  'almond milk': { days: 8, category: 'dairy_alt', storageTip: 'Store on main fridge shelf' },
  'greek yogurt': { days: 12, category: 'dairy_alt', storageTip: 'Smooth top surface before sealing to reduce whey separation' },
  'yogurt': { days: 10, category: 'dairy_alt', storageTip: 'Keep lid tightly closed' },
  'coconut yogurt': { days: 9, category: 'dairy_alt', storageTip: 'Seal tightly; use clean spoon each time' },
  'cheddar cheese': { days: 21, category: 'dairy_alt', storageTip: 'Wrap in cheese paper or wax paper, then loose plastic' },
  'parmesan': { days: 45, category: 'dairy_alt', storageTip: 'Hard cheese lasts weeks; keep wrapped in breathable parchment' },
  'mozzarella': { days: 7, category: 'dairy_alt', storageTip: 'Keep in whey liquid or airtight wrap' },
  'feta': { days: 14, category: 'dairy_alt', storageTip: 'Keep submerged in brine solution' },
  'butter': { days: 30, category: 'dairy_alt', storageTip: 'Keep wrapped to prevent absorbing fridge aromas' },
  'vegan butter': { days: 25, category: 'dairy_alt', storageTip: 'Store in covered butter dish or tub' },
  'cream': { days: 7, category: 'dairy_alt', storageTip: 'Keep cold; do not freeze unless whipped' },
  'sour cream': { days: 12, category: 'dairy_alt', storageTip: 'Store inverted container or level the top' },

  // Condiments & Dips
  'hummus': { days: 6, category: 'condiments', storageTip: 'Keep refrigerated; always use a clean spoon' },
  'pesto': { days: 6, category: 'condiments', storageTip: 'Pour a thin layer of olive oil over top before sealing' },
  'salsa': { days: 10, category: 'condiments', storageTip: 'Store chilled in sealed glass jar' },
  'guacamole': { days: 2, category: 'condiments', storageTip: 'Press plastic wrap directly against surface to block air' },
  'tahini': { days: 60, category: 'condiments', storageTip: 'Refrigerate after opening to prevent oil rancidity' },
  'mayo': { days: 30, category: 'condiments', storageTip: 'Keep refrigerated after opening' },
  'vegan mayo': { days: 25, category: 'condiments', storageTip: 'Refrigerate after opening' },

  // Bakery & Grains
  'bread': { days: 5, category: 'bakery', storageTip: 'Slice and freeze for best texture; fridge can dry out crumb' },
  'sourdough': { days: 6, category: 'bakery', storageTip: 'Store cut-side down on cutting board or in paper bag' },
  'tortillas': { days: 14, category: 'bakery', storageTip: 'Reseal package tightly to avoid edges drying' },
  'cooked rice': { days: 4, category: 'pantry', storageTip: 'Cool quickly and refrigerate in airtight container; reheat steaming hot' },
  'cooked pasta': { days: 4, category: 'pantry', storageTip: 'Toss with a drop of olive oil to avoid clumping' },

  // Fruits
  'strawberries': { days: 4, category: 'produce', storageTip: 'Do not wash until ready to eat; store in ventilated container with paper towel' },
  'blueberries': { days: 7, category: 'produce', storageTip: 'Inspect and remove soft berries; keep chilled and dry' },
  'lemons': { days: 21, category: 'produce', storageTip: 'Seal in a zip-top bag in the crisper for up to a month' },
  'limes': { days: 21, category: 'produce', storageTip: 'Keep in crisper drawer in produce bag' },
  'apples': { days: 28, category: 'produce', storageTip: 'Keep in crisper; separate from bananas to avoid over-ripening' },
  'oranges': { days: 21, category: 'produce', storageTip: 'Crisper drawer provides optimal humidity' },
};

/**
 * Automatically determine the approximate shelf-life guideline without asking the user.
 * Searches database by direct key or partial substring, with sensible defaults by category.
 */
export function estimateIngredientShelfLife(ingredientName: string, categoryHint?: IngredientCategory): ExpiryRule {
  const clean = ingredientName.toLowerCase().trim();

  // Exact match
  if (INGREDIENT_EXPIRY_DATABASE[clean]) {
    return INGREDIENT_EXPIRY_DATABASE[clean];
  }

  // Partial substring match
  for (const [key, rule] of Object.entries(INGREDIENT_EXPIRY_DATABASE)) {
    if (clean.includes(key) || key.includes(clean)) {
      return rule;
    }
  }

  // Category heuristics if no match
  const cat = categoryHint || detectCategoryFromName(clean);
  switch (cat) {
    case 'produce':
      if (clean.includes('green') || clean.includes('leaf') || clean.includes('salad') || clean.includes('berry')) {
        return { days: 4, category: 'produce', storageTip: 'Store in crisper drawer; keep dry to prevent wilting' };
      }
      return { days: 7, category: 'produce', storageTip: 'Keep chilled in crisper drawer with balanced humidity' };
    case 'herbs_spices':
      return { days: 5, category: 'herbs_spices', storageTip: 'Keep dry or stand stem-down in a bit of water' };
    case 'protein':
      return { days: 6, category: 'protein', storageTip: 'Store in airtight container at 38°F/3°C or lower' };
    case 'dairy_alt':
      return { days: 8, category: 'dairy_alt', storageTip: 'Keep cold on main fridge shelf, not on door' };
    case 'condiments':
      return { days: 21, category: 'condiments', storageTip: 'Keep tightly sealed in refrigerator' };
    case 'bakery':
      return { days: 5, category: 'bakery', storageTip: 'Keep sealed; freeze slices if not using immediately' };
    case 'pantry':
      return { days: 60, category: 'pantry', storageTip: 'Store in cool, dark pantry in airtight jar' };
    default:
      return { days: 7, category: 'other', storageTip: 'Keep refrigerated in a clean, airtight container' };
  }
}

export function detectCategoryFromName(name: string): IngredientCategory {
  const lower = name.toLowerCase();
  if (lower.match(/tofu|tempeh|paneer|halloumi|lentil|chickpea|bean|edamame|seitan/)) return 'protein';
  if (lower.match(/milk|yogurt|cheese|butter|cream|cheddar|mozzarella|feta|parmesan/)) return 'dairy_alt';
  if (lower.match(/cilantro|coriander|parsley|basil|mint|thyme|rosemary|garlic|ginger|scallion|chive/)) return 'herbs_spices';
  if (lower.match(/hummus|pesto|salsa|mayo|tahini|sauce|dressing|mustard|jam/)) return 'condiments';
  if (lower.match(/bread|tortilla|pita|bagel|bun|crust|wrap/)) return 'bakery';
  if (lower.match(/rice|pasta|flour|sugar|oil|vinegar|canned|oats|quinoa|noodle/)) return 'pantry';
  return 'produce';
}

export function calculateExpiryDate(days: number, fromDate?: Date): string {
  const base = fromDate ? new Date(fromDate) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
}

export function getDaysRemaining(expiryDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(expiryDateStr + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(daysLeft: number): {
  status: 'expired' | 'urgent' | 'warning' | 'fresh';
  label: string;
  badgeClass: string;
  dotColor: string;
} {
  if (daysLeft < 0) {
    return {
      status: 'expired',
      label: `Expired ${Math.abs(daysLeft)}d ago`,
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      dotColor: 'bg-red-500',
    };
  }
  if (daysLeft === 0) {
    return {
      status: 'urgent',
      label: 'Expires today!',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse',
      dotColor: 'bg-amber-500',
    };
  }
  if (daysLeft === 1) {
    return {
      status: 'urgent',
      label: 'Expires tomorrow',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      dotColor: 'bg-amber-500',
    };
  }
  if (daysLeft <= 3) {
    return {
      status: 'warning',
      label: `${daysLeft} days left - Use soon`,
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
      dotColor: 'bg-orange-400',
    };
  }
  return {
    status: 'fresh',
    label: `${daysLeft} days left`,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
  };
}
