# How VeggieFridge works: a picture for non-technical readers

This page shows how information moves through the prototype: what goes in, which parts always behave the same way, which part uses AI and can vary, and what you get back.

```mermaid
flowchart TD
    A["1. What you give the app<br/>Ingredients, preferences, recipe searches,<br/>a receipt photo or pasted receipt text"]
    B["2. The app on your screen<br/>Fridge, Recipes, Favorites,<br/>Shopping List, Budget Swaps"]
    C["3. Built-in rules<br/>Shelf-life list, counting days,<br/>'use soon' at 3 days or fewer"]
    E["4. Saved on your device<br/>Fridge, favorites, shopping list,<br/>preferences"]
    F["5. Small go-between helper<br/>Holds the private key and<br/>writes the AI agent's instructions"]
    H["6. What the AI agent is given<br/>Ingredient names and days left,<br/>diet, budget, time limit, dislikes,<br/>what you typed, or the receipt"]
    I["7. What the AI agent is NOT given<br/>Favorites, shopping list, past requests,<br/>exact dates, store prices, who you are"]
    G["8. The AI agent (can vary)<br/>Writes every recipe, reads receipts,<br/>suggests cheaper swaps"]
    J["9. If the AI can't answer<br/>Recipes and receipts: a short message<br/>and a Try again button. Swaps: fixed sample items"]
    K["10. What you get back<br/>Recipe cards, receipt items to add<br/>to your fridge, cheaper swap ideas,<br/>colored 'days left' labels"]

    A --> B
    B --> C
    B <--> E
    B -. "asks for AI help" .-> F
    F --> H
    H --> G
    I -. "never sent" .- G
    G --> F
    F -. "no key, an error, or no answer<br/>within about 40 seconds" .-> J
    C --> K
    G --> K
    J --> K

    classDef same fill:#dbeafe,stroke:#1d4ed8,color:#0f172a;
    classDef ai fill:#ffedd5,stroke:#c2410c,color:#0f172a;
    classDef info fill:#dcfce7,stroke:#15803d,color:#0f172a;
    classDef out fill:#f3e8ff,stroke:#7e22ce,color:#0f172a;
    classDef blocked fill:#fee2e2,stroke:#b91c1c,color:#0f172a;
    class A,E info;
    class B,C,F,J same;
    class G,H ai;
    class I blocked;
    class K out;
```

**How to read the colors**

- **Green:** information coming in, or saved.
- **Blue:** parts that always behave the same way. Give them the same input and you get the same result.
- **Orange:** the AI agent and what it is given. Its answers can be different each time, and can be wrong.
- **Red:** information the AI agent never sees.
- **Purple:** what you get back.
- **Dotted lines:** paths that only happen sometimes.

## The walkthrough

1. **You give the app some information.** You type in ingredients, choose preferences, search for a dish, or upload a receipt photo (or paste its text).
2. **The app keeps it on your device.** Your fridge, favorites, shopping list and preferences are saved in your own browser. There are no accounts.
3. **The built-in parts do the everyday work themselves, the same way every time.** The app looks up how long each food usually lasts, counts the days, and flags anything with 3 days or fewer left. No AI is involved in any of this. The app has no pre-written recipes.
4. **When you open the Recipes tab or ask for more recipes, the app hands the job to the small go-between helper.** The same goes for a receipt reading or a cheaper swap. The helper is the only part that holds the private key to Google's AI. It writes the AI agent's instructions and sends them along with the information listed in box 6.
5. **The AI agent does its one job and answers.** It writes four vegetarian recipes, or picks the vegetarian items off a receipt, or suggests cheaper substitutes. Each request stands alone: the agent has no memory of earlier ones, cannot take actions, and cannot look anything up.
6. **If the AI can't answer, you are told.** That happens when the key is missing, Gemini returns an error, or it takes longer than about 40 seconds on a recipe request. The Recipes screen shows a short message and a Try again button. (The swap search falls back to a few fixed sample items when run without a key.)
7. **You get results back.** These include recipe cards that say whether you can cook now or what is missing, receipt items you can tick and add to your fridge, and swap ideas.

## What the AI agent is given, and what it isn't

| Job | Given | Not given |
|---|---|---|
| **New recipes** | Your ingredient names, quantities and days left (with "expiring soon" flagged), your diet, budget style, longest cooking time, favorite cuisines, dislikes and allergies, whatever you typed in the recipe search (or the ingredients you selected), and whether you asked to "rescue" expiring food | Your favorites, your shopping list, past requests or answers, exact expiry dates, storage tips, store prices, or anything about who you are |
| **Reading a receipt** | Only the receipt photo (shrunk on your device first) or the pasted text | Everything about your fridge, favorites and preferences |
| **Cheaper swaps** | Only the ingredient you typed | Everything else |

**Privacy note:** because of this, your ingredient list, or your receipt photo, is sent to Google's AI whenever those features are used.

## What always behaves the same, and what can vary

- **Always the same (blue):** the shelf-life list, the day counting and "use soon" labels, the six built-in swap ideas, the shopping list, and saving to your device.
- **Can vary (orange):** every recipe, the receipt reading and the swap search. Nobody checks the AI's answers. It is only *asked* to keep recipes vegetarian and to respect your diet and dislikes, and nothing double-checks that it did. Do not rely on it for allergies.

## What runs where

- **Recipes:** the helper runs on Vercel, so the live site can ask Gemini. This only works once a Gemini key has been added to the Vercel project. Without it, the Recipes screen says the AI helper isn't set up yet.
- **Receipt scanner:** it also has a helper on Vercel, so the live site can read receipts with the same key. Photos are shrunk on your device first so they upload quickly.
- **Swap search:** its helper only runs on a developer's own computer. On the live site the swap search does nothing (the six built-in swaps still show).
