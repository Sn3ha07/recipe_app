import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import suggestRecipesHandler from "./api/suggest-recipes.js";
import scanReceiptHandler from "./api/scan-receipt.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "25mb" }));

// Lazy Gemini client helper
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// 2. Suggest vegetarian recipes with Gemini (same code that runs on Vercel)
app.post("/api/suggest-recipes", suggestRecipesHandler);

// 3. Read a grocery receipt with Gemini (same code that runs on Vercel)
app.post("/api/scan-receipt", scanReceiptHandler);

// 4. Cheaper ingredient alternatives suggestions (Stretch Goal 2)
app.post("/api/cheaper-alternatives", async (req, res) => {
  try {
    const { ingredients = [], recipeTitle = "" } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        alternatives: [
          {
            originalIngredient: "Pine nuts",
            cheaperAlternative: "Toasted sunflower seeds or raw pumpkin seeds (pepitas)",
            why: "Provides the identical rich nutty crunch and healthy fats at 80% lower cost.",
            savingsTip: "Toast lightly in a dry skillet with a pinch of salt for 2 minutes.",
          },
          {
            originalIngredient: "Saffron strands",
            cheaperAlternative: "Turmeric pinch + sweet smoked paprika",
            why: "Matches the radiant golden color and warm earthy warmth without the luxury expense.",
            savingsTip: "Bloom in warm milk or olive oil for 5 minutes before adding.",
          },
          {
            originalIngredient: "Artisanal cashew cheese",
            cheaperAlternative: "Nutritional yeast + firm tofu blend with lemon juice",
            why: "Recreates the tangy umami flavor profile and creamy texture for pennies.",
            savingsTip: "Blend with garlic powder and a splash of olive oil.",
          },
        ],
      });
    }

    const prompt = `You are a frugal culinary advisor specializing in vegetarian gastronomy.
Provide clever, delicious, money-saving ingredient substitutions for these ingredients:
${ingredients.join(", ") || "Luxury vegetarian ingredients like pine nuts, saffron, specialty truffles, aged vegan cheeses, fresh out-of-season berries"}
${recipeTitle ? `In the context of the dish: "${recipeTitle}"` : ""}

Give 3-5 smart swaps that drastically lower the grocery bill without compromising flavor, texture, or nutrition. Include practical prep tips for the swap.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              originalIngredient: { type: Type.STRING },
              cheaperAlternative: { type: Type.STRING },
              why: { type: Type.STRING },
              savingsTip: { type: Type.STRING },
            },
            required: ["originalIngredient", "cheaperAlternative", "why", "savingsTip"],
          },
        },
      },
    });

    res.json({ alternatives: JSON.parse(response.text || "[]") });
  } catch (err: any) {
    console.error("Error in /api/cheaper-alternatives:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VeggieFridge server running on port ${PORT}`);
  });
}

startServer();
