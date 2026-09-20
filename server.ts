import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import suggestRecipesHandler from "./api/suggest-recipes.js";
import scanReceiptHandler from "./api/scan-receipt.js";
import cheaperAlternativesHandler from "./api/cheaper-alternatives.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "25mb" }));

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

// 4. Cheaper ingredient swaps with Gemini (same code that runs on Vercel)
app.post("/api/cheaper-alternatives", cheaperAlternativesHandler);

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
