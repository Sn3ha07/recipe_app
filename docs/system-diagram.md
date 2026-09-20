# How VeggieFridge works: a picture for non-technical readers

This page shows how information moves through the prototype: what goes in, which parts always behave the same way, which part uses AI and can vary, and what you get back.

```mermaid
flowchart TD
    A["1. What you give the app<br/>Ingredients, preferences, recipe searches,<br/>a receipt photo or pasted receipt text"]
    B["2. The app on your screen<br/>Fridge, Recipes, Favorites,<br/>Shopping List, Budget Swaps"]
    C["3. Built-in rules<br/>Shelf-life list, counting days,<br/>'use soon' at 3 days or fewer"]
    D["4. Built-in recipe finder<br/>Hand-written recipes<br/>matched to what is in your fridge"]
    E["5. Saved on your device<br/>Fridge, favorites, shopping list,<br/>preferences"]
    F["6. Small go-between helper<br/>Holds the private key and<br/>writes the AI agent's instructions"]
    H["7. What the AI agent is given<br/>Ingredient names and days left,<br/>diet, budget, time limit, dislikes,<br/>what you typed, or the receipt"]
    I["8. What the AI agent is NOT given<br/>Favorites, shopping list, past requests,<br/>exact dates, store prices, who you are"]
    G["9. The AI agent (can vary)<br/>Writes recipes, reads receipts,<br/>suggests cheaper swaps"]
    J["10. Backup answers<br/>Built-in recipes, or fixed<br/>sample items, if the AI is missing or slow"]
    K["11. What you get back<br/>Recipe cards, receipt items to add<br/>to your fridge, cheaper swap ideas,<br/>colored 'days left' labels"]

    A --> B
    B --> C
    B --> D
    B <--> E
    B -. "asks for AI help<br/>(NOT connected on the live site)" .-> F
    F --> H
    H --> G
    I -. "never sent" .- G
    G --> F
    F -. "no key, or no answer<br/>within about 3.5 seconds" .-> J
    C --> K
    D --> K
    G --> K
    J --> K

    classDef same fill:#dbeafe,stroke:#1d4ed8,color:#0f172a;
    classDef ai fill:#ffedd5,stroke:#c2410c,color:#0f172a;
    classDef info fill:#dcfce7,stroke:#15803d,color:#0f172a;
    classDef out fill:#f3e8ff,stroke:#7e22ce,color:#0f172a;
    classDef blocked fill:#fee2e2,stroke:#b91c1c,color:#0f172a;
    class A,E info;
    class B,C,D,F,J same;
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
- **Dotted lines:** paths that only happen sometimes. The dotted line to the go-between helper does not work on the live site (see below).

## The walkthrough

1. **You give the app some information.** You type in ingredients, choose preferences, search for a dish, or upload a receipt photo (or paste its text).
2. **The app keeps it on your device.** Your fridge, favorites, shopping list and preferences are saved in your own browser. There are no accounts.
3. **The built-in parts do the everyday work themselves, the same way every time.** The app looks up how long each food usually lasts, counts the days, and flags anything with 3 days or fewer left. Its hand-written recipe finder compares recipes with your fridge and lists what is missing. No AI is involved in any of this.
4. **When you ask for fresh recipe ideas, a receipt reading, or a cheaper swap, the app hands the job to the small go-between helper.** The helper is the only part that holds the private key to Google's AI. It writes the AI agent's instructions and sends them along with the information listed in box 7.
5. **The AI agent does its one job and answers.** It writes four vegetarian recipes, or picks the vegetarian items off a receipt, or suggests cheaper substitutes. Each request stands alone: the agent has no memory of earlier ones, cannot take actions, and cannot look anything up.
6. **If the AI can't answer, backup answers step in.** That happens when the key is missing or the AI takes longer than about 3.5 seconds on a recipe request. You get the built-in recipes instead. (Receipts and swaps fall back to a few fixed sample items.)
7. **You get results back.** These include recipe cards that say whether you can cook now or what is missing, receipt items you can tick and add to your fridge, and swap ideas.

## What the AI agent is given, and what it isn't

| Job | Given | Not given |
|---|---|---|
| **New recipes** | Your ingredient names, quantities and days left (with "expiring soon" flagged), your diet, budget style, longest cooking time, favorite cuisines, dislikes and allergies, whatever you typed in the recipe search (or the ingredients you selected), and whether you asked to "rescue" expiring food | Your favorites, your shopping list, past requests or answers, exact expiry dates, storage tips, store prices, or anything about who you are |
| **Reading a receipt** | Only the receipt photo or the pasted text | Everything about your fridge, favorites and preferences |
| **Cheaper swaps** | Only the ingredient you typed | Everything else |

**Privacy note:** because of this, your ingredient list, or your receipt photo, is sent to Google's AI whenever those features are used.

## What always behaves the same, and what can vary

- **Always the same (blue):** the shelf-life list, the day counting and "use soon" labels, the built-in recipes and how they are matched and sorted, the shopping list, and saving to your device.
- **Can vary (orange):** the new recipes, the receipt reading and the cheaper swaps. Nobody checks the AI's answers. It is only *asked* to keep recipes vegetarian and to respect your diet and dislikes, and nothing double-checks that it did. Do not rely on it for allergies.

## The gap on the live site

On the live site, the dotted line from box 2 to box 6 is cut. The small go-between helper isn't running there, so the AI agent is never asked. What visitors get instead:

- **Recipes:** the built-in recipe finder's answers only.
- **Receipt scanner:** an error message.
- **Swap search:** nothing happens (the six built-in swaps still show).
- **Preferences:** the built-in recipe finder ignores them, so they don't change which recipes appear.
