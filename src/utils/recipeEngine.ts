import { Recipe, FridgeItem, UserPreferences } from '../types';
import { getDaysRemaining } from './expiryRules';

// Helper to normalize strings for ingredient matching
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(fresh|raw|organic|baby|extra|firm|soft|canned|dried|chopped|sliced|diced|whole|bag of|tub of|bunch of|pack of|cloves?|clove)\b/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

// Check if an item in fridge matches a required ingredient
export function matchesIngredient(fridgeName: string, recipeIngredient: string): boolean {
  const fNorm = normalizeName(fridgeName);
  const rNorm = normalizeName(recipeIngredient);
  if (!fNorm || !rNorm) return false;

  // Direct substring checks
  if (fNorm.includes(rNorm) || rNorm.includes(fNorm)) return true;

  // Synonyms and aliases
  const aliases: Record<string, string[]> = {
    tofu: ['soy', 'beancurd', 'bean curd'],
    spinach: ['greens', 'palak', 'leafy greens', 'kale'],
    mushroom: ['cremini', 'portobello', 'button mushroom', 'shiitake'],
    pepper: ['bell pepper', 'capsicum', 'sweet pepper'],
    yogurt: ['yoghurt', 'curd', 'dahi', 'greek yogurt', 'plant yogurt'],
    carrot: ['carrots', 'gajar'],
    tomato: ['tomatoes', 'cherry tomato', 'roma tomato'],
    chickpea: ['garbanzo', 'chana', 'kabuli chana'],
    lentil: ['dal', 'daal', 'dhal', 'lentils'],
    cheese: ['paneer', 'cheddar', 'mozzarella', 'parmesan', 'feta'],
    pasta: ['spaghetti', 'penne', 'macaroni', 'fusilli', 'noodles'],
    rice: ['basmati', 'jasmine', 'brown rice', 'white rice'],
    potato: ['potatoes', 'aloo', 'sweet potato', 'russet'],
    onion: ['shallot', 'scallion', 'spring onion', 'red onion'],
    garlic: ['garlic cloves', 'lasun'],
    cucumber: ['cucumbers', 'kheera'],
    broccoli: ['broccolini', 'florets'],
    zucchini: ['courgette'],
  };

  for (const [key, list] of Object.entries(aliases)) {
    const fHas = fNorm.includes(key) || list.some((l) => fNorm.includes(l));
    const rHas = rNorm.includes(key) || list.some((l) => rNorm.includes(l));
    if (fHas && rHas) return true;
  }

  return false;
}

export interface RecipeTemplate {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  budgetTier: 'budget' | 'everyday' | 'gourmet';
  keyIngredients: string[]; // essential ingredients
  optionalIngredients?: string[];
  staplesAssumed?: string[]; // salt, oil, black pepper, water
  additionalItemsIfMissing: { name: string; amount: string; estimatedCost: string }[];
  cheaperAlternatives?: {
    originalIngredient: string;
    cheaperAlternative: string;
    why: string;
    savingsTip: string;
  }[];
  instructions: string[];
  nutritionHighlights: string;
  relatedRecipeLinks?: {
    title: string;
    query: string;
    whyTry: string;
  }[];
  tags: string[];
}

export const BASE_RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'stir-fry-tofu-veggies',
    title: 'Crispy Tofu & Vibrant Veggie Stir-Fry',
    description: 'A savory wok-tossed medley with golden pan-seared tofu, tender mushrooms, sweet bell peppers, and fresh greens in a garlic-soy glaze.',
    cuisine: 'East Asian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'Easy',
    budgetTier: 'budget',
    keyIngredients: ['tofu', 'bell pepper', 'mushroom', 'spinach'],
    optionalIngredients: ['carrot', 'soy sauce', 'garlic'],
    staplesAssumed: ['cooking oil', 'salt', 'pepper', 'water'],
    additionalItemsIfMissing: [
      { name: 'Soy sauce or Tamari', amount: '2 tbsp', estimatedCost: '$0.30' },
      { name: 'Garlic cloves', amount: '2 cloves minced', estimatedCost: '$0.20' },
      { name: 'Sesame seeds or crushed peanuts', amount: '1 tbsp', estimatedCost: '$0.25' },
    ],
    cheaperAlternatives: [
      {
        originalIngredient: 'Store-bought stir-fry sauce bottle ($4.50)',
        cheaperAlternative: 'Soy sauce + 1 tsp sugar + 1 tsp cornstarch slurry',
        why: 'Produces a silky, glossy restaurant-style glaze for pennies.',
        savingsTip: 'Whisk in a bowl before pouring into the hot skillet.',
      },
    ],
    instructions: [
      'Press excess moisture from tofu with a clean kitchen towel, then cut into bite-sized cubes.',
      'Heat 1 tbsp oil in a wide skillet or wok over medium-high heat. Sear tofu cubes for 6–8 minutes until golden and crisp on all sides, then set aside.',
      'In the same hot pan, toss in sliced bell peppers and mushrooms. Stir-fry briskly for 3–4 minutes until tender-crisp.',
      'Fold in fresh spinach leaves and seared tofu. Splash with soy sauce and 1 tbsp water, tossing for 60 seconds until greens wilt gently.',
      'Serve steaming hot over rice or grains, garnished with sesame seeds or red pepper flakes.',
    ],
    nutritionHighlights: 'Packed with complete plant protein (22g/serving), iron from spinach, and rich vitamin C.',
    relatedRecipeLinks: [
      {
        title: 'Sesame Ginger Glazed Tofu Bowls',
        query: 'crispy sesame ginger glazed tofu grain bowl',
        whyTry: 'Learn the cornstarch dusting trick for ultra-crispy tofu cubes.',
      },
      {
        title: 'Rainbow Vegetable Fried Rice',
        query: 'easy vegetable fried rice with tofu and carrots',
        whyTry: 'Great for using day-old leftover cooked rice.',
      },
    ],
    tags: ['Quick Under 25m', 'High Protein', 'Food Waste Rescue', 'Vegan Friendly'],
  },
  {
    id: 'tuscan-mushroom-greens-pasta',
    title: 'Rustic Mushroom & Wilted Spinach Tuscan Pasta',
    description: 'Tender pasta coated in olive oil, sautéed browned cremini mushrooms, wilted greens, and cracked black pepper with aromatic garlic.',
    cuisine: 'Mediterranean',
    prepTimeMinutes: 8,
    cookTimeMinutes: 15,
    servings: 2,
    difficulty: 'Easy',
    budgetTier: 'everyday',
    keyIngredients: ['mushroom', 'spinach', 'pasta'],
    optionalIngredients: ['bell pepper', 'carrot', 'parmesan', 'olive oil'],
    staplesAssumed: ['cooking oil', 'salt', 'pepper', 'water'],
    additionalItemsIfMissing: [
      { name: 'Pasta (Penne, Rigatoni, or Spaghetti)', amount: '250g (1/2 box)', estimatedCost: '$0.89' },
      { name: 'Olive oil', amount: '2 tbsp', estimatedCost: '$0.35' },
      { name: 'Garlic', amount: '2 cloves', estimatedCost: '$0.15' },
    ],
    cheaperAlternatives: [
      {
        originalIngredient: 'Imported Parmigiano Reggiano cheese ($7.00)',
        cheaperAlternative: 'Toasted breadcrumbs with nutritional yeast and lemon zest',
        why: 'Adds classic Italian crunchy texture and savory umami for a fraction of the price.',
        savingsTip: 'Toast breadcrumbs in 1 tsp olive oil in a dry pan for 2 minutes.',
      },
    ],
    instructions: [
      'Bring a large pot of salted water to a rolling boil. Cook pasta until al dente (about 9–11 minutes). Reserve 1/2 cup pasta cooking water before draining.',
      'Meanwhile, heat 1.5 tbsp olive oil in a skillet over medium heat. Sauté sliced mushrooms undisturbed for 3 minutes until deep golden brown.',
      'Add minced garlic and a pinch of red pepper flakes, cooking for 30 seconds until fragrant.',
      'Add drained pasta and 1/4 cup reserved starchy pasta water to the skillet, swirling vigorously to create a velvety emulsion.',
      'Turn off heat, fold in fresh spinach until wilted, and finish with a squeeze of fresh lemon and cracked black pepper.',
    ],
    nutritionHighlights: 'High in dietary fiber, low in saturated fat, and rich in antioxidant ergothioneine from mushrooms.',
    relatedRecipeLinks: [
      {
        title: 'Authentic Roman Cacio e Pepe',
        query: 'creamy cacio e pepe pasta water emulsion technique',
        whyTry: 'Master the pasta water emulsion that creates creaminess without heavy dairy.',
      },
    ],
    tags: ['Under 25m', 'Italian Comfort', 'Plant-Forward', 'Kid Approved'],
  },
  {
    id: 'spiced-yogurt-roasted-veggie-bowl',
    title: 'Warm Spiced Veggie & Crispy Tofu Nourish Bowl',
    description: 'Golden roasted carrots, bell peppers, and crispy tofu served over grains with a zesty garlic-herb yogurt drizzle.',
    cuisine: 'Middle Eastern',
    prepTimeMinutes: 12,
    cookTimeMinutes: 20,
    servings: 2,
    difficulty: 'Easy',
    budgetTier: 'everyday',
    keyIngredients: ['tofu', 'carrot', 'bell pepper', 'yogurt'],
    optionalIngredients: ['spinach', 'mushrooms'],
    staplesAssumed: ['cooking oil', 'salt', 'pepper', 'water'],
    additionalItemsIfMissing: [
      { name: 'Cooked grain (Rice, Quinoa, or Couscous)', amount: '2 cups', estimatedCost: '$0.50' },
      { name: 'Ground cumin & smoked paprika', amount: '1 tsp each', estimatedCost: '$0.20' },
      { name: 'Lemon juice', amount: '1 tbsp', estimatedCost: '$0.25' },
    ],
    cheaperAlternatives: [
      {
        originalIngredient: 'Jarred specialty Tahini dressing ($6.00)',
        cheaperAlternative: 'Whisked Greek yogurt with minced garlic, lemon, and olive oil',
        why: 'Provides rich creamy acidity and probiotics for 80% less cost.',
        savingsTip: 'Whisk 3 tbsp yogurt with 1 tbsp water until silky smooth.',
      },
    ],
    instructions: [
      'Preheat oven to 400°F (200°C) or prepare a wide stovetop skillet.',
      'Toss cubed tofu, sliced bell peppers, and carrot coins with 1 tbsp olive oil, ground cumin, paprika, salt, and pepper.',
      'Roast for 18–20 minutes (or pan-sear in skillet for 12 minutes) until vegetables are caramelized and tofu is crunchy on the edges.',
      'In a small bowl, whisk yogurt, lemon juice, a pinch of salt, and 1 tbsp water into a velvety dressing.',
      'Assemble warm bowls with grain or spinach base, arrange roasted veggies and tofu, and drizzle generously with the spiced yogurt cream.',
    ],
    nutritionHighlights: 'Complete protein, live active probiotics for gut health, beta-carotene for skin and vision.',
    relatedRecipeLinks: [
      {
        title: 'Mediterranean Roasted Vegetable Mezze',
        query: 'roasted vegetable mezze platter with garlic yogurt dip',
        whyTry: 'A stunning sharing platter for casual dinner gatherings.',
      },
    ],
    tags: ['Nourish Bowl', 'High Protein', 'Meal Prep', 'Gut Healthy'],
  },
  {
    id: 'creamy-spinach-coconut-curry',
    title: 'Creamy Spinach & Golden Tofu Coconut Curry',
    description: 'A comforting, mildly spiced coconut milk curry simmered with tender spinach leaves, pan-browned tofu cubes, and sweet carrots.',
    cuisine: 'South Asian',
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    servings: 3,
    difficulty: 'Easy',
    budgetTier: 'budget',
    keyIngredients: ['spinach', 'tofu', 'carrot', 'coconut milk'],
    optionalIngredients: ['bell pepper', 'mushroom'],
    staplesAssumed: ['cooking oil', 'salt', 'pepper', 'water'],
    additionalItemsIfMissing: [
      { name: 'Coconut milk', amount: '1 can (400ml)', estimatedCost: '$1.19' },
      { name: 'Curry powder or Garam Masala', amount: '1 tbsp', estimatedCost: '$0.25' },
      { name: 'Rice to serve', amount: '1.5 cups', estimatedCost: '$0.40' },
    ],
    cheaperAlternatives: [
      {
        originalIngredient: 'Expensive coconut cream',
        cheaperAlternative: 'Standard canned coconut milk or whole milk/oat milk with 1 tbsp peanut butter',
        why: 'Gives the same rich nutty creaminess at half the cost.',
        savingsTip: 'Shake the can vigorously before opening.',
      },
    ],
    instructions: [
      'Heat 1 tbsp oil in a pot over medium heat. Sauté cubed tofu until lightly golden (5 mins), then remove.',
      'Add sliced carrots and bell peppers with curry powder, stirring for 1 minute until spices are fragrant.',
      'Pour in coconut milk and 1/4 cup water. Bring to a gentle simmer for 8 minutes until carrots are tender.',
      'Fold in fresh spinach and cooked tofu cubes. Simmer for 2 minutes until spinach wilts into the creamy broth.',
      'Season with salt to taste and serve steaming hot with fluffy basmati rice or warm flatbread.',
    ],
    nutritionHighlights: 'Iron-rich greens combined with plant protein and healthy medium-chain fats for sustained energy.',
    relatedRecipeLinks: [
      {
        title: 'Palak Tofu (Vegan Palak Paneer)',
        query: 'authentic restaurant style palak paneer with tofu vegan',
        whyTry: 'Master blended spinach gravy with fragrant cumin-infused ghee or oil.',
      },
    ],
    tags: ['Comfort Food', 'One Pot', 'Vegan Friendly', 'Freeze Friendly'],
  },
  {
    id: 'mushroom-bell-pepper-fajitas',
    title: 'Sizzling Mushroom & Sweet Pepper Fajita Skillet',
    description: 'Smoky spiced cremini mushrooms and vibrant bell peppers flash-seared with cumin and oregano, served with cool yogurt and lime.',
    cuisine: 'Mexican',
    prepTimeMinutes: 8,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: 'Easy',
    budgetTier: 'budget',
    keyIngredients: ['mushroom', 'bell pepper', 'tortillas'],
    optionalIngredients: ['tofu', 'yogurt', 'spinach'],
    staplesAssumed: ['cooking oil', 'salt', 'pepper'],
    additionalItemsIfMissing: [
      { name: 'Warm flour or corn tortillas', amount: '4 to 6 wraps', estimatedCost: '$0.99' },
      { name: 'Ground cumin & chili powder', amount: '1 tsp each', estimatedCost: '$0.20' },
      { name: 'Fresh lime', amount: '1/2 lime', estimatedCost: '$0.25' },
    ],
    cheaperAlternatives: [
      {
        originalIngredient: 'Specialty Mexican Crema ($4.00)',
        cheaperAlternative: 'Greek yogurt thinned with lime juice and a pinch of salt',
        why: 'Identical tart, cooling contrast with twice the protein.',
        savingsTip: 'Mix 2 tbsp yogurt with 1 tsp fresh lime juice.',
      },
    ],
    instructions: [
      'Slice mushrooms and bell peppers into thick, fajita-style ribbons.',
      'Heat a large cast-iron or heavy skillet over high heat with 1 tbsp oil until hot.',
      'Add mushrooms and peppers in a single layer. Let sear undisturbed for 2 minutes to get charred smoky edges.',
      'Stir in chili powder, ground cumin, garlic powder, and a generous pinch of sea salt. Toss for 3–4 minutes.',
      'Squeeze fresh lime juice over the pan, remove from heat, and spoon into warm tortillas with yogurt cream.',
    ],
    nutritionHighlights: 'Zero cholesterol, rich in vitamin C, and low in sodium when seasoned with fresh spices.',
    relatedRecipeLinks: [
      {
        title: 'Crispy Black Bean & Pepper Tacos',
        query: 'easy weeknight crispy vegetarian black bean tacos',
        whyTry: 'Fast 15-minute pantry taco filling with great fiber.',
      },
    ],
    tags: ['Under 20m', 'Kid Favorite', 'One Skillet', 'Gluten-Free Option'],
  },
  {
    id: 'greek-tzatziki-salad-crunch-wrap',
    title: 'Cool Cucumber & Herb Tzatziki Salad Wrap',
    description: 'Crisp shredded carrots, bell peppers, and fresh greens tossed with a homemade garlic-dill yogurt tzatziki folded in a warm flatbread.',
    cuisine: 'Greek / Mediterranean',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 2,
    difficulty: 'Easy',
    budgetTier: 'budget',
    keyIngredients: ['yogurt', 'carrot', 'bell pepper', 'spinach', 'pita'],
    optionalIngredients: ['cucumber', 'tofu'],
    staplesAssumed: ['salt', 'pepper', 'olive oil'],
    additionalItemsIfMissing: [
      { name: 'Pita bread or Flatbreads', amount: '2 large', estimatedCost: '$0.90' },
      { name: 'Dried or fresh dill / oregano', amount: '1 tsp', estimatedCost: '$0.15' },
      { name: 'Lemon juice', amount: '1 tsp', estimatedCost: '$0.15' },
    ],
    cheaperAlternatives: [
      {
        originalIngredient: 'Pre-made refrigerated Tzatziki tub ($4.99)',
        cheaperAlternative: 'Plain yogurt + minced garlic + lemon + grated carrots/cucumber',
        why: 'Fresh homemade tzatziki tastes 10x crisper and costs under $0.75.',
        savingsTip: 'Squeeze liquid from grated veg before stirring into yogurt.',
      },
    ],
    instructions: [
      'In a mixing bowl, combine Greek yogurt, minced garlic, lemon juice, dill, salt, and black pepper.',
      'Finely slice bell peppers and grate or ribbon the fresh carrots.',
      'Warm pita or flatbread in a dry pan for 30 seconds until pliable.',
      'Spread a thick layer of creamy yogurt sauce onto each pita.',
      'Pile high with fresh spinach, crisp carrots, and bell peppers. Roll tightly and slice in half on an angle.',
    ],
    nutritionHighlights: 'No cooking required! High probiotic count, vitamin A, and crisp hydration.',
    relatedRecipeLinks: [
      {
        title: 'Authentic Greek Village Horiatiki Salad',
        query: 'traditional greek horiatiki salad olive oil oregano',
        whyTry: 'Classic no-lettuce Greek salad celebrating peak ripe vegetables.',
      },
    ],
    tags: ['No Cook', '10-Minute Meal', 'Refreshing', 'Probiotic Rich'],
  },
  {
    id: 'golden-carrot-ginger-velouté',
    title: 'Velvety Roasted Carrot & Garlic Soup',
    description: 'Sweet roasted carrots simmered with garlic, sweet peppers, and mild aromatics, blended into a silky, comforting golden soup with a yogurt swirl.',
    cuisine: 'French Bistro',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 3,
    difficulty: 'Easy',
    budgetTier: 'budget',
    keyIngredients: ['carrot', 'bell pepper', 'vegetable broth'],
    optionalIngredients: ['yogurt', 'spinach', 'mushrooms'],
    staplesAssumed: ['cooking oil', 'salt', 'pepper', 'water'],
    additionalItemsIfMissing: [
      { name: 'Vegetable broth or bouillon cube', amount: '3 cups', estimatedCost: '$0.80' },
      { name: 'Crusty bread or croutons', amount: '2 slices', estimatedCost: '$0.40' },
    ],
    cheaperAlternatives: [
      {
        originalIngredient: 'Store-bought organic liquid vegetable broth carton ($3.50)',
        cheaperAlternative: 'Water + vegetable bouillon cube or scrap stock',
        why: 'Bouillon cubes cost $0.15 and provide rich, savory depth.',
        savingsTip: 'Dissolve 1 cube in 3 cups hot water.',
      },
    ],
    instructions: [
      'Peel and slice carrots into coins. Dice bell pepper and garlic.',
      'In a medium soup pot, warm 1 tbsp oil. Sauté garlic and vegetables for 4 minutes until lightly caramelized.',
      'Pour in 3 cups of vegetable broth, bring to a rolling boil, then reduce heat and simmer covered for 15 minutes until carrots are fork-tender.',
      'Blend with an immersion blender (or transfer carefully to a blender) until completely silky and velvety.',
      'Ladle into bowls, swirl a spoonful of yogurt on top, and serve with toasted crusty bread.',
    ],
    nutritionHighlights: 'High in beta-carotene (converts to active vitamin A), immune-supporting antioxidants.',
    relatedRecipeLinks: [
      {
        title: 'Thai Red Curry Butternut Squash Soup',
        query: 'creamy thai red curry squash carrot soup',
        whyTry: 'Infuse coconut milk and lemongrass for an Asian twist.',
      },
    ],
    tags: ['One Pot', 'Comforting', 'Easy Prep', 'Immunity Boost'],
  },
  {
    id: 'savory-tofu-veggie-scramble',
    title: 'Hearty Golden Tofu & Spinach Breakfast Scramble',
    description: 'Protein-packed crumbled tofu scrambled with wilted spinach, browned mushrooms, and sweet peppers with a golden turmeric glow.',
    cuisine: 'American Comfort',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    difficulty: 'Easy',
    budgetTier: 'budget',
    keyIngredients: ['tofu', 'spinach', 'mushroom'],
    optionalIngredients: ['bell pepper', 'carrot'],
    staplesAssumed: ['cooking oil', 'salt', 'pepper'],
    additionalItemsIfMissing: [
      { name: 'Ground turmeric', amount: '1/2 tsp (for egg-like color)', estimatedCost: '$0.10' },
      { name: 'Nutritional yeast (optional savory flavor)', amount: '1 tbsp', estimatedCost: '$0.20' },
      { name: 'Toast slices', amount: '2 slices', estimatedCost: '$0.30' },
    ],
    cheaperAlternatives: [
      {
        originalIngredient: 'Commercial bottled vegan egg liquid ($6.00)',
        cheaperAlternative: 'Pressed tofu crumbled with 1/4 tsp turmeric and pinch of black salt (kala namak)',
        why: 'Tastes remarkably like real eggs for less than 1/4 the cost.',
        savingsTip: 'Kala namak imparts authentic eggy sulfur aroma.',
      },
    ],
    instructions: [
      'Heat 1 tbsp oil in a skillet over medium heat. Sauté sliced mushrooms and peppers for 3 minutes.',
      'Crumble extra firm tofu directly into the skillet using your hands or a fork.',
      'Sprinkle with turmeric, salt, black pepper, and 2 tbsp water or milk. Stir for 4 minutes until heated through and golden.',
      'Toss in baby spinach and fold until wilted and vibrant green (about 60 seconds).',
      'Serve immediately on warm buttered sourdough toast or rolled in a breakfast tortilla.',
    ],
    nutritionHighlights: 'Over 20g of plant protein per serving, zero cholesterol, low glycemic index.',
    relatedRecipeLinks: [
      {
        title: 'Loaded Breakfast Tofu Burrito',
        query: 'meal prep freezer friendly tofu breakfast burritos',
        whyTry: 'Wrap in tortillas and freeze for instant high-protein mornings.',
      },
    ],
    tags: ['Under 15m', 'Breakfast / Brunch', 'High Protein', 'Egg Free'],
  },
];

// Dynamic recipe synthesizer for any custom ingredient or inventory configuration!
export function synthesizeDynamicRecipe(
  mainIngredientName: string,
  inventory: FridgeItem[],
  missingTargetCount: number = 0
): Recipe {
  const normMain = mainIngredientName.trim();
  const otherItems = inventory
    .filter((i) => i.name.toLowerCase() !== mainIngredientName.toLowerCase())
    .map((i) => i.name);

  const companion1 = otherItems[0] || 'Crisp Vegetables';
  const companion2 = otherItems[1] || 'Fragrant Seasonings';

  const usedFridge = [normMain];
  if (otherItems[0]) usedFridge.push(otherItems[0]);
  if (otherItems[1]) usedFridge.push(otherItems[1]);

  const expiringSaved = inventory
    .filter((i) => getDaysRemaining(i.expiryDate) <= 3 && usedFridge.includes(i.name))
    .map((i) => i.name);

  // Configure missing ingredients based on target count (0, 1, or 2)
  const additionalNeeded: { name: string; amount: string; estimatedCost: string }[] = [];
  if (missingTargetCount === 1) {
    additionalNeeded.push({
      name: 'Toasted Sesame Oil & Soy Sauce',
      amount: '1 tbsp each',
      estimatedCost: '$0.40',
    });
  } else if (missingTargetCount >= 2) {
    additionalNeeded.push(
      { name: 'Jasmine Rice or Noodles', amount: '1 cup', estimatedCost: '$0.50' },
      { name: 'Vegetable Broth', amount: '2 cups', estimatedCost: '$0.75' }
    );
  }

  const missingCount = additionalNeeded.length;
  let notice: string | undefined = undefined;
  if (missingCount === 1) {
    notice = `Requires 1 more ingredient to make this dish: ${additionalNeeded[0].name}`;
  } else if (missingCount > 1) {
    notice = `Requires ${missingCount} more ingredients to make this dish: ${additionalNeeded.map((a) => a.name).join(', ')}`;
  }

  return {
    id: `dyn-recipe-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: `Chef's Skillet ${normMain} with ${companion1}`,
    description: `A vibrant home-style vegetarian sauté highlighting your fresh ${normMain}, gently paired with ${companion1} and aromatic kitchen seasonings.`,
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Everyday Global',
    budgetTier: 'budget',
    usedFridgeIngredients: usedFridge,
    expiringItemsSaved: expiringSaved,
    additionalIngredientsNeeded: additionalNeeded,
    missingIngredientsCount: missingCount,
    missingIngredientsRequiredNotice: notice,
    cheaperAlternatives: [
      {
        originalIngredient: 'Pre-made sauce packet ($3.99)',
        cheaperAlternative: 'Olive oil/soy sauce with minced garlic and pinch of lemon',
        why: 'Fresher aroma, zero artificial preservatives, costs cents.',
        savingsTip: 'Whisk in a small bowl and drizzle in the final 60 seconds.',
      },
    ],
    instructions: [
      `Gently rinse and prep your fresh ${normMain} into uniform bite-sized pieces.`,
      `Heat 1 tbsp cooking oil in a wide skillet over medium heat until shimmering.`,
      `Add your firmer ingredients (${companion1}) first, cooking for 3 minutes.`,
      `Add ${normMain} and seasonings, tossing gently for 3–5 minutes until tender and fragrant.`,
      `Season with sea salt, freshly cracked black pepper, and serve warm.`,
    ],
    nutritionHighlights: `Rich in essential plant fiber, wholesome micronutrients from ${normMain}, and completely cholesterol-free.`,
    relatedRecipeLinks: [
      {
        title: `Crispy Pan-Seared ${normMain}`,
        query: `crispy pan seared ${normMain} recipe vegetarian`,
        whyTry: 'Discover high-heat searing technique for maximum caramelization.',
      },
    ],
    tags: ['Custom Creation', 'Quick & Simple', 'Fridge Rescue'],
  };
}

// Master function: Matches recipes from inventory, calculates missing ingredients, and always guarantees results!
export function matchRecipesToInventory(
  inventory: FridgeItem[],
  options: {
    focusExpiring?: boolean;
    selectedIngredients?: string[];
    searchQuery?: string;
    preferences?: UserPreferences;
  } = {}
): Recipe[] {
  const { focusExpiring, selectedIngredients, searchQuery } = options;

  const invNames = inventory.map((i) => i.name);
  const expiringItems = inventory.filter((i) => getDaysRemaining(i.expiryDate) <= 3).map((i) => i.name);

  // Evaluate all base templates against current inventory
  const evaluatedRecipes: Recipe[] = BASE_RECIPE_TEMPLATES.map((tmpl) => {
    const usedFridge: string[] = [];

    // Check which ingredients from fridge match key ingredients
    tmpl.keyIngredients.forEach((key) => {
      const match = inventory.find((inv) => matchesIngredient(inv.name, key));
      if (match && !usedFridge.includes(match.name)) {
        usedFridge.push(match.name);
      }
    });

    // Also check optional ingredients in fridge
    if (tmpl.optionalIngredients) {
      tmpl.optionalIngredients.forEach((opt) => {
        const match = inventory.find((inv) => matchesIngredient(inv.name, opt));
        if (match && !usedFridge.includes(match.name)) {
          usedFridge.push(match.name);
        }
      });
    }

    // Determine expiring items saved
    const expiringSaved = usedFridge.filter((name) =>
      expiringItems.some((exp) => exp.toLowerCase() === name.toLowerCase())
    );

    // Calculate missing ingredients
    const additionalNeeded: { name: string; amount: string; estimatedCost: string; optional?: boolean }[] = [];

    tmpl.additionalItemsIfMissing.forEach((item) => {
      const isPresent = inventory.some((inv) => matchesIngredient(inv.name, item.name));
      if (!isPresent) {
        additionalNeeded.push(item);
      }
    });

    // Check if any key ingredient was missing completely and not in additionalItems
    tmpl.keyIngredients.forEach((key) => {
      const isPresentInFridge = inventory.some((inv) => matchesIngredient(inv.name, key));
      const alreadyInAdditional = additionalNeeded.some((add) => matchesIngredient(add.name, key));
      if (!isPresentInFridge && !alreadyInAdditional) {
        additionalNeeded.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          amount: '1 standard portion',
          estimatedCost: '$0.99',
        });
      }
    });

    const missingCount = additionalNeeded.length;
    let missingNotice: string | undefined = undefined;
    if (missingCount === 1) {
      missingNotice = `Requires 1 more ingredient to make this dish: ${additionalNeeded[0].name}`;
    } else if (missingCount > 1) {
      missingNotice = `Requires ${missingCount} more ingredients to make this dish: ${additionalNeeded.map((a) => a.name).join(', ')}`;
    }

    return {
      id: tmpl.id,
      title: tmpl.title,
      description: tmpl.description,
      prepTimeMinutes: tmpl.prepTimeMinutes,
      cookTimeMinutes: tmpl.cookTimeMinutes,
      servings: tmpl.servings,
      difficulty: tmpl.difficulty,
      cuisine: tmpl.cuisine,
      budgetTier: tmpl.budgetTier,
      usedFridgeIngredients: usedFridge,
      expiringItemsSaved: expiringSaved,
      additionalIngredientsNeeded: additionalNeeded,
      missingIngredientsCount: missingCount,
      missingIngredientsRequiredNotice: missingNotice,
      cheaperAlternatives: tmpl.cheaperAlternatives,
      instructions: tmpl.instructions,
      nutritionHighlights: tmpl.nutritionHighlights,
      relatedRecipeLinks: tmpl.relatedRecipeLinks,
      tags: tmpl.tags,
    };
  });

  // Filter or prioritize based on selected ingredients or search query
  let results = evaluatedRecipes;

  if (selectedIngredients && selectedIngredients.length > 0) {
    const selectedLower = selectedIngredients.map((s) => s.toLowerCase());
    results = results.filter((r) =>
      r.usedFridgeIngredients.some((ing) =>
        selectedLower.some((sel) => ing.toLowerCase().includes(sel) || sel.includes(ing.toLowerCase()))
      )
    );

    // If none matched the specific selection, dynamically synthesize recipes for the selected ingredients!
    if (results.length === 0) {
      const firstSelected = selectedIngredients[0];
      results = [
        synthesizeDynamicRecipe(firstSelected, inventory, 0),
        synthesizeDynamicRecipe(firstSelected, inventory, 1),
        synthesizeDynamicRecipe(firstSelected, inventory, 2),
      ];
    }
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    const matched = results.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.usedFridgeIngredients.some((ing) => ing.toLowerCase().includes(q))
    );
    if (matched.length > 0) {
      results = matched;
    } else {
      // Dynamic synthesis for query
      results = [
        synthesizeDynamicRecipe(searchQuery, inventory, 0),
        synthesizeDynamicRecipe(searchQuery, inventory, 1),
        ...results.slice(0, 3),
      ];
    }
  }

  // If focusExpiring requested, boost recipes that rescue expiring items
  if (focusExpiring) {
    results.sort((a, b) => (b.expiringItemsSaved.length || 0) - (a.expiringItemsSaved.length || 0));
  } else {
    // Sort: 1) Most fridge items used, 2) Least missing ingredients
    results.sort((a, b) => {
      const aMissing = a.missingIngredientsCount || 0;
      const bMissing = b.missingIngredientsCount || 0;
      if (aMissing !== bMissing) {
        return aMissing - bMissing;
      }
      return (b.usedFridgeIngredients.length || 0) - (a.usedFridgeIngredients.length || 0);
    });
  }

  // Ensure we always return a rich selection (at least 4-6 recipes)
  if (results.length < 3 && inventory.length > 0) {
    const firstInv = inventory[0].name;
    results.push(synthesizeDynamicRecipe(firstInv, inventory, 0));
    results.push(synthesizeDynamicRecipe(firstInv, inventory, 1));
  }

  return results;
}
