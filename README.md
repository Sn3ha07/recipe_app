# VeggieFridge

**A prototype that helps you use up the vegetarian food in your fridge before it goes bad.**

> **This is a prototype.** It is an early experiment for trying out ideas, not a finished product. Some parts don't work yet. The [What's unfinished](#whats-unfinished) section lists them honestly.

**Live site:** https://recipe-app-phi-amber.vercel.app

## What it is and who it's for

VeggieFridge is a small web app for keeping track of what's in your fridge. You list your ingredients. The app estimates how many days each one will last, points out what to use up first, and suggests vegetarian recipes that use what you already have. If a recipe needs something you don't have, the app tells you exactly what is missing and lets you add it to a shopping list.

It is designed for **budget-minded vegetarians** who want to throw away less food and spend less on groceries.

## How to use it, step by step

Open the live site. There is nothing to sign up for.

1. **Start with the sample fridge.** On your first visit, the app fills your fridge with six sample ingredients (baby spinach, tofu, mushrooms, bell peppers, yogurt and carrots) so you can try everything right away.
2. **See what needs using first.** The Fridge tab lists your ingredients with the soonest-to-expire at the top. Each one has a colored label such as "Expires tomorrow" or "2 days left - Use soon." Anything with 3 days or fewer left also appears in an amber "Rescue Alert" box.
3. **Add your own ingredients.** In the "Add To Virtual Fridge" box, type an ingredient (for example, "Carrots") and a quantity, then press **Add**. As you type, the app shows its estimate of how long the food lasts, plus a storage tip. If you disagree with the estimate, click "Custom expiry days?" and type your own number.
4. **Find recipes.** You can do this three ways:
   - Click **Cook With These Now** in the Rescue Alert box to favor recipes that use up the ingredients about to expire.
   - Click **Find recipes** on any single ingredient card.
   - Click **Select** on several ingredient cards, then click **Find Recipes for Selected**.
5. **Read the recipe cards.** Each card says either "Ready to Cook" (everything is already in your fridge) or "Requires 1 more ingredient" (or however many are missing), and names them. Cards also show cooking time, difficulty, and which of your ingredients the recipe uses. Filter buttons across the top narrow the list, for example to recipes under 25 minutes. Click **View Recipe** to see the full ingredient list and numbered steps.
6. **Save recipes and build a shopping list.** Click the bookmark icon to save a recipe to the **Favorites** tab. Click **+ Add missing item** on a recipe card to put the missing ingredients on your **Shopping List**. On that tab, tick items as you buy them, then click **Transfer Bought to Fridge** to move them into your fridge with estimated expiry dates. You can also add items by hand.
7. **Browse Budget Swaps.** This tab shows six ideas for replacing expensive ingredients with cheaper ones (for example, pumpkin seeds instead of pine nuts). Each has an **Add Swap to Shopping List** button.
8. **Set your preferences.** The **Preferences** button (top right) lets you choose a diet type (vegetarian, vegan, Jain or gluten-free vegetarian), a budget style, a maximum cooking time, favorite cuisines, and ingredients you dislike or are allergic to. **Please read the note about this in [What's unfinished](#whats-unfinished).**
9. **Try the receipt scanner.** The **Scan Receipt** button is meant to read a grocery receipt (a photo, or pasted text) and add the vegetarian items to your fridge. **It does not work on the live site yet.** See below.

**Where your information is kept:** everything you add (fridge, favorites, shopping list, preferences) is saved inside your own web browser on your own device. There are no accounts. Nobody else can see it, it won't appear on another device, and clearing your browser's site data will erase it. If you delete every ingredient, a button appears that restores the sample fridge.

## How it works, in plain language

### Guessing how long food will last

The app has a built-in list of about 80 common foods with a typical number of days they last in the fridge (for example, baby spinach: 4 days, carrots: 21 days). If you type something that isn't on the list, it makes a rough guess based on the type of food. It counts forward from today to get an "expires on" date. **These are rough estimates, not food-safety advice.** Use your own judgment about whether food is still good.

### Suggesting recipes without AI (the built-in recipe finder)

The app comes with **8 hand-written vegetarian recipes**. To make suggestions, it compares each recipe's main ingredients with what's in your fridge. It understands some alternate names (for example, "capsicum" counts as a bell pepper, and "dahi" counts as yogurt). It then lists what's missing and puts the recipes that need the fewest extra ingredients first. If you ask to "rescue" expiring food, it puts the recipes that use the most soon-to-expire items first. If you search for something none of the recipes match, it builds a generic stir-fry-style recipe around the word you typed.

### The AI part

**What it is designed to do.** The app is built to use Google's Gemini AI for three jobs:

1. **Write new recipes.** It sends the AI your fridge contents, which items are about to expire, and your preferences (diet, budget, cooking time, cuisines, dislikes). The AI writes four new vegetarian recipes, with numbered steps, missing ingredients, and cheaper swaps.
2. **Read receipts.** Given a photo or pasted text of a grocery receipt, the AI picks out the vegetarian food items and guesses how long each will last.
3. **Suggest cheaper swaps.** For an ingredient you type in, the AI suggests cheaper substitutes.

The AI is reached through a small server that holds a private key. The key is kept out of this GitHub project on purpose. If the key is missing, or the AI takes longer than about 3.5 seconds to answer a recipe request, the app quietly shows the built-in recipes instead.

**Where it falls short.**

- **It is not switched on in the live site.** The live site is hosted as a plain website, and the small server that talks to the AI is not running there. So on the live site, recipes always come from the 8 built-in ones, the receipt scanner shows a confusing error message, and the Budget Swaps search box does nothing.
- **AI can be wrong.** Recipes, cooking times, cost and savings figures, nutrition notes and shelf-life guesses are written by an AI and are not checked by a person. Treat them as ideas, not tested recipes.
- **Diet and allergy rules are only requests.** The app asks the AI to follow your diet and avoid your dislikes, but nothing double-checks the result. Do not rely on it for allergies.
- **Receipt reading can make mistakes.** That is why the scanner lets you untick items before adding them to your fridge.

## Tools used

**The app itself**

- **React** and **TypeScript**: build the screens you see and click.
- **Vite**: the tool that runs and packages the app while it is being built.
- **Tailwind CSS**: styling (colors, spacing, layout).
- **Lucide**: the small icons.
- **Motion**: small animations.
- **Express** (running on Node.js): the small server that connects the app to the AI.
- **Google Gemini**: the AI that writes recipes, reads receipts and suggests swaps.

**Where it lives**

- **GitHub**: stores the project's code.
- **Vercel**: hosts the live website.

**Tools that helped make it**

- **Google AI Studio**: used to get the project started.
- **Claude Code** (Anthropic's AI coding assistant): used for later changes and to help write this README.

## What's unfinished

This is a prototype, so quite a lot is unfinished. Here is everything I know about:

- **The AI is not connected on the live site** (see above). This is the biggest gap. On the live site:
  - Recipes come only from the 8 built-in ones. "Suggest More Recipes" shows the same set again.
  - The receipt scanner shows a technical error message instead of reading your receipt.
  - The search box on Budget Swaps does nothing. The six built-in swaps still appear.
- **Preferences don't change the recipes you see on the live site.** Choosing vegan, gluten-free, Jain, a time limit, or listing an allergy has no effect on the built-in recipes. Some of them contain dairy, tofu, mushrooms, or wheat. **Please don't rely on this app if you have an allergy or a strict diet.**
- **Unusual searches give odd results.** If you search for something the built-in recipes don't cover (for example, "chocolate cake"), the app fills in a generic recipe such as "Chef's Skillet chocolate cake with Baby Spinach."
- **The "Rescue Expiring" button is missing on the Recipes tab**, even when items are about to expire. Use the "Cook With These Now" button on the Fridge tab instead.
- **The receipt scanner and Budget Swaps are extras.** Both are labeled "Stretch Goal" inside the app, meaning they were beyond the core plan.
- **Savings numbers are illustrative.** The "60-85% savings" figures were written by hand. The app does not look up real store prices.
- **Only 8 built-in recipes**, and only about 80 foods with known shelf lives.
- **No accounts and no syncing.** Your data lives only in the browser you used.

## Run it on your own computer (for technical readers)

You need [Node.js](https://nodejs.org) installed.

```
git clone https://github.com/Sn3ha07/recipe_app.git
cd recipe_app
npm install
npm run dev
```

Then open http://localhost:3000. The app uses port 3000, so close anything else that is using it first.

**Without an AI key,** the app still runs. Recipes come from the built-in set. The receipt scanner and the swap search return fixed sample results no matter what you give them, so they can look like they work when they are not actually reading your input.

**To turn the AI on,** copy the file `.env.example` to a new file named `.env`, and replace the placeholder with your own Google Gemini key (you can get one from Google AI Studio). Never share your key or upload it to GitHub. The project's `.gitignore` already keeps `.env` files out of the repository.
