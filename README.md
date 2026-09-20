# VeggieFridge

**A prototype that helps you use up the vegetarian food in your fridge before it goes bad.**

> **This is a prototype.** It is an early experiment for trying out ideas, not a finished product. Some parts are rough around the edges. The [What's unfinished](#whats-unfinished) section lists them honestly.

**Live site:** https://recipe-app-phi-amber.vercel.app

## What it is and who it's for

VeggieFridge is a small web app for keeping track of what's in your fridge. You list your ingredients. The app estimates how many days each one will last, points out what to use up first, and suggests vegetarian recipes that use what you already have. If a recipe needs something you don't have, the app tells you exactly what is missing and lets you add it to a shopping list.

It is designed for **budget-minded vegetarians** who want to throw away less food and spend less on groceries.

## How to use it, step by step

Open the live site. There is nothing to sign up for.

1. **Start with the sample fridge.** On your first visit, the app fills your fridge with six sample ingredients (baby spinach, tofu, mushrooms, bell peppers, yogurt and carrots) so you can try everything right away.
2. **See what needs using first.** The Fridge tab lists your ingredients with the soonest-to-expire at the top. Each one has a colored label such as "Expires tomorrow" or "2 days left - Use soon." Anything with 3 days or fewer left also appears in an amber "Rescue Alert" box.
3. **Add your own ingredients.** In the "Add To Virtual Fridge" box, type an ingredient (for example, "Carrots") and a quantity, then press **Add**. As you type, the app shows its estimate of how long the food lasts, plus a storage tip. If you disagree with the estimate, click "Custom expiry days?" and type your own number.
4. **Get recipes.** Every way of asking for recipes starts with the words "Get recipes":
   - Click **Get Recipes for These** in the Rescue Alert box to favor recipes that use up the ingredients about to expire. On the Recipes tab, the **Use up expiring items** button does the same thing, and **Get New Recipes** asks again.
   - Click **Get recipes** on any single ingredient card.
   - Click **Select** on several ingredient cards. A bar stays at the bottom of the screen so you can click **Get Recipes for Selected** wherever you have scrolled to.
   - Or type a dish into the search box on the Recipes tab, for example "warm curry", and click **Search**.
5. **Read the recipe cards.** The recipes are written by AI each time you ask, which usually takes 5 to 15 seconds. Each card shows the recipe name, then says either "Ready to cook" (everything is already in your fridge) or "Needs 2 more:" followed by the missing ingredients. It also shows the cooking time and difficulty, and a small "Uses 2 expiring" tag when the recipe would use up food that is about to go off. Filter buttons appear above the cards only when they would narrow the list, for example to recipes under 25 minutes. Click **View Recipe** to see the full ingredient list, your ingredients, cheaper swaps and numbered steps. If none of the four suit you, click **Get 4 more recipes** at the bottom of the list. They are added below the ones you already have, up to 20 in total, and the AI is told which recipes you already have so it does not repeat them. **Get New Recipes** at the top starts over with a fresh set.
6. **Save recipes and build a shopping list.** Click the bookmark icon to save a recipe to the **Favorites** tab. Click **+ Add missing item** on a recipe card to put the missing ingredients on your **Shopping List**. On that tab, tick items as you buy them, then click **Transfer Bought to Fridge** to move them into your fridge with estimated expiry dates. You can also add items by hand.
7. **Browse Budget Swaps.** This tab shows six ideas for replacing expensive ingredients with cheaper ones (for example, pumpkin seeds instead of pine nuts). Each has an **Add Swap to Shopping List** button. You can also type any ingredient into the search box to get more swap ideas written by the AI (usually a few seconds). The box at the top shows a rough average of the savings guesses on the cards below it.
8. **Set your preferences.** The **Preferences** button (top right) lets you choose a diet type (vegetarian, vegan, Jain or gluten-free vegetarian), a budget style, a maximum cooking time, favorite cuisines, and ingredients you dislike or are allergic to. These are sent to the AI along with your fridge, but nothing double-checks that it follows them. See [What's unfinished](#whats-unfinished).
9. **Scan a receipt.** Click **Scan Receipt**, then upload a photo of a grocery receipt (JPG, PNG or WEBP) or paste its text. The AI picks out the vegetarian food and guesses how long each item will last. This usually takes a few seconds. Untick anything that looks wrong, then click **Add Selected to Virtual Fridge**. There is a "Paste sample grocery receipt" link if you just want to try it.

**Where your information is kept:** everything you add (fridge, favorites, shopping list, preferences) is saved inside your own web browser on your own device. There are no accounts. Nobody else can see it, it won't appear on another device, and clearing your browser's site data will erase it. If you delete every ingredient, a button appears that restores the sample fridge.

## How it works, in plain language

### Guessing how long food will last

The app has a built-in list of about 80 common foods with a typical number of days they last in the fridge (for example, baby spinach: 4 days, carrots: 21 days). If you type something that isn't on the list, it makes a rough guess based on the type of food. It counts forward from today to get an "expires on" date. **These are rough estimates, not food-safety advice.** Use your own judgment about whether food is still good.

### The AI part

**What it does.** The app uses Google's Gemini AI for three jobs:

1. **Write recipes.** Every recipe you see on the Recipes screen is written by the AI. There are no pre-written recipes in the app. The app sends the AI your fridge contents, which items are about to expire, and your preferences (diet, budget, cooking time, cuisines, dislikes). The AI writes four vegetarian recipes, with numbered steps, missing ingredients, and cheaper swaps. The recipes are asked for the first time you open the Recipes tab, and again whenever you ask for a new set or for 4 more. When you ask for 4 more, the AI also receives the names, cuisines and main ingredients of the recipes you already have, and the app throws out any new recipe that is nearly the same dish as one you have, so the new ones really are different.
   The AI also searches Google for real recipes to base each one on. Each card says who wrote the original (for example "Recipe by Jane Doe · Serious Eats"), and the recipe pop-up has a "Read the original recipe" link. The steps are Gemini's own short summary, not a copy. If Google Search is unavailable (for example the free allowance for it has run out), the recipes are written without it, the screen says so, and they show "AI-written, no original source".
2. **Read receipts.** Given a photo or pasted text of a grocery receipt, the AI picks out the vegetarian food items and guesses how long each will last.
3. **Suggest cheaper swaps.** For an ingredient you type in, the AI suggests cheaper substitutes.

The AI is reached through a small helper that holds a private key. The key is kept out of this GitHub project on purpose. Gemini's free allowance is small and its servers are sometimes busy, so the helper tries up to four different Gemini models in turn (fast, light ones first) and gives up after about 45 seconds. If none of them answers, or the key is missing, the screen shows a short message and a **Try again** button. It never falls back to made-up or pre-written results.

**Where it falls short.**

- **It needs a key to be set up.** The live site asks Gemini through three small helpers hosted on Vercel, one each for recipes, receipts and swaps. They only work while a Gemini key is set in the Vercel project. Without it, each screen says the AI helper isn't set up yet.
- **Savings figures are guesses.** The percentages on swap cards, and the average shown at the top of that screen, are rough estimates worked out from those cards. The app does not look up real store prices.
- **AI can be wrong.** Recipes, cooking times, cost and savings figures, nutrition notes and shelf-life guesses are written by an AI and are not checked by a person. Treat them as ideas, not tested recipes.
- **Diet and allergy rules are only requests.** The app asks the AI to follow your diet and avoid your dislikes, but nothing double-checks the result. Do not rely on it for allergies.
- **It can be slow, and it has a limit.** Recipes usually take 5 to 15 seconds, and longer when the faster models are busy. Every request uses up some of the project's small free AI allowance, so heavy use can run into limits.
- **Receipt reading can make mistakes.** It can misread blurry photos, mistake a non-vegetarian item for a vegetarian one, or guess a shelf life badly. That is why the scanner lets you untick items before adding them to your fridge. Photos are shrunk on your device before they are sent, and the whole photo goes to Google's AI.

## Tools used

**The app itself**

- **React** and **TypeScript**: build the screens you see and click.
- **Vite**: the tool that runs and packages the app while it is being built.
- **Tailwind CSS**: styling (colors, spacing, layout).
- **Lucide**: the small icons.
- **Motion**: small animations.
- **Inter Tight** and **Fragment Mono**: the two fonts (from Google Fonts).
- **Vercel functions** (the `api/` folder): the small helpers that connect the app to the AI and hold the private key.
- **Express** (running on Node.js): runs those same helpers when you use the app on your own computer.
- **Google Gemini**: the AI that writes recipes, reads receipts and suggests swaps. The helpers try several Gemini models, fastest first.

**Where it lives**

- **GitHub**: stores the project's code.
- **Vercel**: hosts the live website and the three small helpers that ask Gemini for recipes, receipts and swaps.

**Tools that helped make it**

- **Google AI Studio**: used to get the project started.
- **Claude Code** (Anthropic's AI coding assistant): used for later changes and to help write this README.

## What's unfinished

This is a prototype, so quite a lot is unfinished. Here is everything I know about:

- **The AI depends on a Gemini key and on Google being available.** Recipes, the receipt scanner and the swap search all need the key to have been added in Vercel. Any of them can fail when Google is busy or the free allowance runs out. When that happens you see a short message and can try again.
- **Recipes take a moment and are not saved.** Each request takes several seconds, and a new list is written every time, so recipes you did not bookmark are gone when you leave.
- **No safety check on diets or allergies.** The AI is asked to follow your preferences, but nothing verifies that it did. **Please don't rely on this app if you have an allergy or a strict diet.**
- **The receipt scanner and Budget Swaps are extras** that go beyond the app's core plan of tracking food and suggesting recipes, so they are less polished.
- **Only about 80 foods have known shelf lives.** Anything else gets a rough guess by food type.
- **Some phone photo formats may not upload.** Photos are converted in your browser, and some browsers can't open formats such as iPhone HEIC. You then see a message and can paste the receipt text instead.
- **No accounts and no syncing.** Your data lives only in the browser you used.

## Run it on your own computer (for technical readers)

You need [Node.js](https://nodejs.org) installed.

```
git clone https://github.com/Sn3ha07/recipe_app.git
cd recipe_app
npm install
npm run dev
```

Then open http://localhost:3000. The app uses port 3000, so close anything else that is using it first. The local server (`server.ts`) runs the same helper files that run on Vercel.

**Without an AI key,** the app still runs, but the Recipes screen shows "The AI helper isn't set up yet." The receipt scanner and swap search show the same message. Nothing is faked when the AI is missing.

**To turn the AI on locally,** copy the file `.env.example` to a new file named `.env`, and replace the placeholder with your own Google Gemini key (you can get one from Google AI Studio). Never share your key or upload it to GitHub. The project's `.gitignore` already keeps `.env` files out of the repository.

**To turn the AI on for the live site,** add the same key as an environment variable named `GEMINI_API_KEY` in the Vercel project's settings, then redeploy. The helpers live in the `api/` folder: `suggest-recipes.ts`, `scan-receipt.ts` and `cheaper-alternatives.ts`. They try `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3.5-flash` and `gemini-3.6-flash` in that order. To try a different model first, set an optional `GEMINI_MODEL` variable to its name.

## More detail

- [How it works, in a picture](docs/system-diagram.md): a diagram of what goes in, what the AI is given, and what comes back.
- [Design rules](docs/design-system.md): the colors, fonts and spacing the app follows.

