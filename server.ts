import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Cache for scraped data to avoid redundant external network requests
const SCRAPE_CACHE: Record<
  string,
  {
    timestamp: number;
    gameData: any;
    accountsByGame: Record<string, string[]>;
  }
> = {};

const DEFAULT_TARGET_ORIGIN = "https://ledger-live-nine.vercel.app";

// Helper: Fetch game-data.json and XML/API files from target website
async function fetchTargetInventory(targetOrigin = DEFAULT_TARGET_ORIGIN) {
  const cacheKey = targetOrigin;
  const now = Date.now();
  if (SCRAPE_CACHE[cacheKey] && now - SCRAPE_CACHE[cacheKey].timestamp < 60000) {
    return SCRAPE_CACHE[cacheKey];
  }

  const cleanOrigin = targetOrigin.replace(/\/+$/, "");

  // 1. Fetch game-data.json
  const gameDataRes = await fetch(`${cleanOrigin}/game-data.json`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GameInventorySync/1.0)" },
    cache: "no-store",
  });
  if (!gameDataRes.ok) {
    throw new Error(`Failed to fetch game-data.json: HTTP ${gameDataRes.status}`);
  }
  const gameData = await gameDataRes.json();

  // 2. Fetch inventory for games
  const gamesToFetch = ["linerangers", "cookierun", "kaibee", "efootball"];
  const accountsByGame: Record<string, string[]> = {};

  await Promise.all(
    gamesToFetch.map(async (g) => {
      try {
        const res = await fetch(`${cleanOrigin}/api/xml-files?game=${g}`, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; GameInventorySync/1.0)" },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          accountsByGame[g] = data.ids || [];
        } else {
          accountsByGame[g] = [];
        }
      } catch (err) {
        console.error(`Error fetching game ${g}:`, err);
        accountsByGame[g] = [];
      }
    })
  );

  const result = {
    timestamp: now,
    gameData,
    accountsByGame,
  };
  SCRAPE_CACHE[cacheKey] = result;
  return result;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Proxy image fetching if needed to avoid CORS or hotlinking blocks
app.get("/api/image-proxy", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send("Missing url query parameter");
  }

  try {
    let target = imageUrl;
    if (imageUrl.startsWith("/")) {
      target = `${DEFAULT_TARGET_ORIGIN}${imageUrl}`;
    } else if (!imageUrl.startsWith("http")) {
      target = `${DEFAULT_TARGET_ORIGIN}/${imageUrl}`;
    }

    const imgRes = await fetch(target);
    if (!imgRes.ok) {
      return res.status(imgRes.status).send("Failed to load image");
    }

    const contentType = imgRes.headers.get("content-type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    const buffer = await imgRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

// Sync and fetch target inventory (PRICES STRIPPED ON SERVER)
app.post("/api/inventory/sync", async (req, res) => {
  try {
    const { targetUrl } = req.body;
    const origin = targetUrl ? targetUrl.trim() : DEFAULT_TARGET_ORIGIN;
    const data = await fetchTargetInventory(origin);

    // Deep sanitize gameData to remove all price fields
    const sanitizedGameData = JSON.parse(JSON.stringify(data.gameData));
    delete sanitizedGameData.comboPrices;
    delete sanitizedGameData.duplicateBulkPrices;
    delete sanitizedGameData.discountPercentByGame;
    if (sanitizedGameData.premium) {
      delete sanitizedGameData.premium.price;
    }
    if (sanitizedGameData.characters) {
      Object.keys(sanitizedGameData.characters).forEach((category) => {
        if (Array.isArray(sanitizedGameData.characters[category])) {
          sanitizedGameData.characters[category] = sanitizedGameData.characters[
            category
          ].map((char: any) => {
            const { price, ...rest } = char;
            return rest;
          });
        }
      });
    }

    res.json({
      success: true,
      targetOrigin: origin,
      timestamp: data.timestamp,
      gameData: sanitizedGameData,
      accounts: data.accountsByGame,
      totalCount: Object.values(data.accountsByGame).reduce(
        (sum, list) => sum + list.length,
        0
      ),
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch remote inventory",
    });
  }
});

// AI Copywriting generator
app.post("/api/ai/generate-copy", async (req, res) => {
  try {
    const {
      accounts,
      gameName,
      style = "standard",
      customPrompt,
      shopName = "精選遊戲專賣店",
      contactInfo = "私訊詢問 / 帶編號截圖",
    } = req.body;

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({ error: "No accounts provided for generation" });
    }

    const accountsSummary = accounts
      .slice(0, 30)
      .map((acc: any, i: number) => {
        const charNames = (acc.characters || [])
          .map((c: any) => `${c.name}${c.count > 1 ? `x${c.count}` : ""}`)
          .join(", ");
        const collabInfo =
          acc.collabSeries && acc.collabSeries.length > 0
            ? `【聯動：${acc.collabSeries.join(", ")}】`
            : "";
        const resInfo = acc.resources
          ? Object.entries(acc.resources)
              .map(([k, v]) => `${k}:${v}`)
              .join(" ")
          : "";
        return `[#${acc.displayId || acc.id}] ${collabInfo} 角色: [${charNames || "詳情請見代號"}] ${resInfo ? `| 資源: ${resInfo}` : ""}`;
      })
      .join("\n");

    const systemPrompt = `你是一個資深的遊戲虛寶與遊戲帳號專業號商文案專家。
請根據用戶提供的遊戲帳號庫存資料，生成極具吸引力、排版清晰、繁體中文（台灣習慣用語）、無原始價格、便於買家快速查看並私訊購買的宣傳文案。
規則：
1. 嚴禁包含任何泰銖(฿)或原站點的原始價格。所有價格請保留為空白或引導「私訊問價 / 帶編號報價」。
2. 根據風格精準排版：
   - 如果 style 是 'social' (社群/LINE/FB社團): 使用吸引人的 Emoji、重點標籤、清晰編號條列、聯動限定高亮。
   - 如果 style 是 'discord' (Discord/論壇): 使用乾淨的 Markdown 格式、代碼塊、整齊對齊。
   - 如果 style 是 'highlights' (主打爆款推薦): 挑選出包含頂級聯動或強力角色的精選帳號做深度推薦。
3. 語氣熱情專業，突出「現貨秒發」、「多聯動絕版」、「全手動安全號」。
4. 結尾附帶聯繫方式：${contactInfo}，店名：${shopName}。`;

    const userPrompt = `請為以下【${gameName || "熱門遊戲"}】帳號庫存生成宣傳文案：
風格模式：${style}
額外自訂要求：${customPrompt || "無"}

帳號列表：
${accountsSummary}

請輸出格式完備且排版整潔的文案內容：`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      text: response.text || "",
    });
  } catch (error: any) {
    console.error("AI copy generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI copy",
    });
  }
});

async function startServer() {
  // Vite middleware for development
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
