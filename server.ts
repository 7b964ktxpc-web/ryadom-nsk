import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as db from "./server/store";
import rateLimit from "express-rate-limit";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: { error: "Слишком много запросов, попробуйте позже" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);

// Lazy initialize Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn("Failed to initialize GoogleGenAI client:", err);
    }
  }
  return aiClient;
}

// Fallback smart parser for Novosibirsk requests
function fallbackParse(rawText: string) {
  const text = rawText.toLowerCase();
  
  let category = "Другое";
  if (text.includes("электрик") || text.includes("розетк") || text.includes("проводк") || text.includes("люстр") || text.includes("свет")) category = "Электрик";
  else if (text.includes("сантехник") || text.includes("кран") || text.includes("труб") || text.includes("засор") || text.includes("унитаз") || text.includes("протечк")) category = "Сантехник";
  else if (text.includes("диван") || text.includes("грузчик") || text.includes("перевез") || text.includes("вещи") || text.includes("переезд") || text.includes("достав")) category = "Перевозка";
  else if (text.includes("уборк") || text.includes("помыть") || text.includes("клининг")) category = "Уборка";
  else if (text.includes("мебел") || text.includes("собрать") || text.includes("шкаф") || text.includes("стол")) category = "Сборка мебели";
  else if (text.includes("компьютер") || text.includes("ноутбук") || text.includes("винда") || text.includes("windows")) category = "Компьютер";
  else if (text.includes("собак") || text.includes("кошк") || text.includes("выгул") || text.includes("животн")) category = "Животные";
  else if (text.includes("авто") || text.includes("машин") || text.includes("аккумулятор") || text.includes("прикурить") || text.includes("колесо")) category = "Авто";
  else if (text.includes("ребёнок") || text.includes("дети") || text.includes("няня") || text.includes("забрать из сада")) category = "Помощь с ребёнком";
  else if (text.includes("документ") || text.includes("забрать") || text.includes("посылк") || text.includes("курьер")) category = "Забрать/доставить";
  else if (text.includes("ремонт") || text.includes("починить") || text.includes("мастер")) category = "Ремонт";

  // District detection for Novosibirsk
  const districts = [
    "Октябрьский", "Центральный", "Железнодорожный", "Заельцовский", 
    "Ленинский", "Кировский", "Калининский", "Дзержинский", "Первомайский", "Советский"
  ];
  let foundDistrict = "Октябрьский";
  for (const d of districts) {
    if (text.includes(d.toLowerCase().slice(0, 5))) {
      foundDistrict = d;
      break;
    }
  }

  // Price detection
    const priceMatch = text.match(/(\d[\d\s]*)\s*(₽|руб|рублей|р\b)/i) || text.match(/(бюджет|цена|за)\s*(\d[\d\s]*)/i);
    let price = 1500;
    if (priceMatch) {
      const numStr = priceMatch[1] || priceMatch[2];
      const num = parseInt(numStr.replace(/\s+/g, ""), 10);
      if (!isNaN(num) && num > 0) price = num;
    }

  // Date and urgency
  const isUrgent = text.includes("срочн") || text.includes("сейчас") || text.includes("прямо сейчас") || text.includes("быстро") || text.includes("горит");
  const date = text.includes("завтра") ? "Завтра" : "Сегодня";
  let time = "В ближайшее время";
  if (text.includes("после 18") || text.includes("вечером")) time = "После 18:00";
  if (text.includes("утром")) time = "Утром до 12:00";
  if (isUrgent) time = "Срочно (в течение часа)";

  // Clean title
  let title = rawText.slice(0, 60).trim();
  if (category === "Электрик") title = "Нужен электрик для работы по дому";
  else if (category === "Перевозка") title = "Помощь с перевозкой и погрузкой";
  else if (category === "Уборка") title = "Нужна уборка квартиры";
  else if (category === "Сантехник") title = "Нужен сантехник срочно";
  else if (rawText.length > 5) {
    title = rawText.split(/[.\n!?]/)[0].slice(0, 55);
  }

  return {
    title,
    category,
    district: foundDistrict,
    price,
    date,
    time,
    urgency: isUrgent ? "high" : "normal",
    approxAddress: `район ${foundDistrict}`,
    description: rawText.trim()
  };
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "РЯДОМ НСК",
    city: "Новосибирск",
    hasAi: Boolean(process.env.GEMINI_API_KEY)
  });
});

// AI Processing of raw input text into structured post/request
app.post("/api/ai/parse-request", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "rawText is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Use heuristic fallback
      const parsed = fallbackParse(rawText);
      return res.json({ parsed, source: "fallback" });
    }

    const prompt = `Ты — AI-ассистент городского сервиса «РЯДОМ НСК» (Новосибирск).
Проанализируй сырой текст пользователя и извлеки структурированные данные.
Город: Новосибирск.
Районы Новосибирска: Центральный, Железнодорожный, Заельцовский, Октябрьский, Дзержинский, Калининский, Кировский, Ленинский, Первомайский, Советский (Академгородок).
Категории запросов: Ремонт, Перевозка, Уборка, Электрик, Сантехник, Сборка мебели, Компьютер, Животные, Авто, Забрать/доставить, Помощь с ребёнком, Другое.

Сырой текст: "${rawText}"

Верни ТОЛЬКО валидный JSON без markdown форматирования со следующими полями:
{
  "title": "краткий понятный заголовок (до 50 символов)",
  "category": "одна из перечисленных выше категорий",
  "district": "один из 10 районов Новосибирска (по умолчанию Октябрьский)",
  "price": число_бюджета_в_рублях_или_ноль,
  "date": "Сегодня" или "Завтра" или конкретная дата,
  "time": "время или период (например 'Сегодня после 18:00' или 'Срочно')",
  "urgency": "high" или "normal",
  "approxAddress": "ориентир или улица без личных номеров квартир",
  "description": "грамотный отредактированный текст задачи"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    try {
      const parsed = JSON.parse(responseText);
      return res.json({ parsed, source: "gemini" });
    } catch {
      const parsed = fallbackParse(rawText);
      return res.json({ parsed, source: "fallback" });
    }
  } catch (error) {
    console.error("AI parse error:", error);
    const parsed = fallbackParse(req.body?.rawText || "");
    return res.json({ parsed, source: "fallback" });
  }
});

// AI Smart Digest «Что полезного сегодня?»
app.post("/api/ai/smart-digest", async (req, res) => {
  try {
    const { district = "Октябрьский", preferences = [], interests = [], postsSample = [] } = req.body;
    const userInterests = preferences.length > 0 ? preferences : interests;
    const ai = getGeminiClient();

    const buildFallback = () => {
      const topPicks = postsSample.slice(0, 4).map((p: any) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        highlight: `${p.category} • ${p.price ? `${p.price} ₽` : "Бесплатно"}`
      }));

      return {
        digest: {
          greeting: `Привет, сосед! Обзор района ${district}`,
          summary: `В вашем районе (${district}) прямо сейчас кипит жизнь: открыты скидки в кафе, соседи ищут мастеров, а в пешей доступности проходят интересные события.`,
          topPicks: topPicks.length > 0 ? topPicks : [
            { id: "sample-1", title: "Комбо-кофе −25%", type: "deal", highlight: "Кофейня на Восходе" },
            { id: "sample-2", title: "Нужен мастер на сегодня", type: "request", highlight: "Электрик • 2 000 ₽" },
            { id: "sample-3", title: "Открытый мастер-класс в 19:00", type: "event", highlight: "Сквер у театра" }
          ],
          urgentAlert: "Внимание: на ул. Большевистской дорожные работы, выбирайте пути объезда."
        },
        summary: `В районе ${district} прямо сейчас кипит жизнь!`,
        highlights: [
          "🛍 В 600 м скидка на комбо-кофе −25%",
          "🆘 В 1,1 км открыта срочная задача — 2 000 ₽",
          "🎉 В 1,4 км мастер-класс сегодня в 19:00"
        ],
        source: "fallback"
      };
    };

    if (!ai) {
      return res.json(buildFallback());
    }

    const prompt = `Ты — умный консьерж городского сервиса «РЯДОМ НСК» (Новосибирск).
Пользователь находится в районе: ${district}.
Его интересы: ${userInterests.join(", ") || "Все городские темы"}.
Образцы доступных объектов рядом: ${JSON.stringify(postsSample.slice(0, 5))}.

Сгенерируй персонализированный краткий дайджест "Сегодня рядом с вами".
Верни ТОЛЬКО валидный JSON:
{
  "greeting": "Дружелюбное короткое приветствие для жителя района",
  "summary": "1-2 вдохновляющих дружелюбных предложения о том, что полезного происходит в районе сегодня",
  "topPicks": [
    {
      "id": "id существующего объекта из списка или demo",
      "title": "краткий заголовок с эмодзи",
      "type": "deal или request или event",
      "highlight": "краткая суть (например 'Скидка 25% в кофейне' или 'Рядом нужен электрик')"
    }
  ],
  "urgentAlert": "краткое полезное предупреждение или оповещение по району"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        digest: parsed,
        summary: parsed.summary,
        highlights: parsed.topPicks?.map((p: any) => `${p.title}: ${p.highlight}`) || [],
        source: "gemini"
      });
    } catch {
      return res.json(buildFallback());
    }
  } catch (error) {
    console.error("AI digest error:", error);
    const { district = "Октябрьский" } = req.body || {};
    return res.json({
      digest: {
        greeting: `Сводка по району ${district}`,
        summary: "В вашем районе кипит жизнь! Проверьте свежие скидки у соседей и актуальные события в пешей доступности.",
        topPicks: [
          { id: "fallback-1", title: "🛍 Скидка на ланч −20%", type: "deal", highlight: "Кафе на Красном проспекте" },
          { id: "fallback-2", title: "🆘 Срочная задача рядом", type: "request", highlight: "Ремонт сантехники • 2 500 ₽" }
        ],
        urgentAlert: "Спокойная обстановка в районе."
      },
      source: "fallback"
    });
  }
});

// ==========================================
// REST API ENDPOINTS FOR REAL USERS
// ==========================================

// --- Posts ---
app.get("/api/posts", (req, res) => {
  const posts = db.getAllPosts();
  res.json(posts);
});

app.get("/api/posts/:id", (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

app.post("/api/posts", (req, res) => {
  const newPost = db.createPost(req.body);
  res.status(201).json(newPost);
});

app.delete("/api/posts/:id", (req, res) => {
  const success = db.deletePost(req.params.id);
  res.json({ success });
});

app.post("/api/posts/:id/boost", (req, res) => {
  const post = db.boostPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

app.post("/api/posts/:id/respond", (req, res) => {
  const resp = db.addResponse(req.params.id, req.body);
  if (!resp) return res.status(404).json({ error: "Post not found" });
  res.status(201).json(resp);
});

app.post("/api/posts/:id/accept-response", (req, res) => {
  const { responseId, status = "accepted" } = req.body;
  const ok = db.updateResponseStatus(req.params.id, responseId, status);
  res.json({ success: ok });
});

// --- Chat Messages ---
app.get("/api/chat", (req, res) => {
  const { postId, user1, user2 } = req.query as { postId?: string; user1?: string; user2?: string };
  if (!postId) return res.status(400).json({ error: "postId is required" });
  const messages = db.getChatMessages(postId, user1, user2);
  res.json(messages);
});

app.post("/api/chat", (req, res) => {
  const { postId, senderId, senderName, senderAvatar, recipientId, recipientName, text } = req.body;
  if (!postId || !senderId || !recipientId || !text) {
    return res.status(400).json({ error: "Missing required chat fields" });
  }
  const msg = db.sendChatMessage({
    postId,
    senderId,
    senderName: senderName || "Пользователь",
    senderAvatar: senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    recipientId,
    recipientName,
    text,
  });
  res.status(201).json(msg);
});

// --- Reviews ---
app.get("/api/reviews", (req, res) => {
  const { targetUserId } = req.query as { targetUserId?: string };
  res.json(db.getReviews(targetUserId));
});

app.post("/api/reviews", (req, res) => {
  const { targetUserId, authorId, authorName, authorAvatar, rating, comment, requestId } = req.body;
  if (!targetUserId || !rating || !comment) {
    return res.status(400).json({ error: "targetUserId, rating, and comment are required" });
  }
  const rev = db.addReview({
    targetUserId,
    authorId: authorId || "user-current-1",
    authorName: authorName || "Сосед",
    authorAvatar: authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    rating: Number(rating),
    comment,
    requestId,
  });
  res.status(201).json(rev);
});

// --- Notifications ---
app.get("/api/notifications", (req, res) => {
  const { userId } = req.query as { userId?: string };
  res.json(db.getNotifications(userId));
});

app.post("/api/notifications/:id/read", (req, res) => {
  const ok = db.markNotificationRead(req.params.id);
  res.json({ success: ok });
});

app.post("/api/notifications/read-all", (req, res) => {
  const { userId } = req.body;
  const ok = db.markAllNotificationsRead(userId);
  res.json({ success: ok });
});

// --- User Profile & Auth ---
app.post("/api/auth/login", (req, res) => {
  const { phone, name, role, district, telegram, avatar } = req.body;
  if (!phone) return res.status(400).json({ error: "phone is required" });
  const user = db.registerOrLoginUser({ phone, name, role, district, telegram, avatar });
  res.json(user);
});

app.get("/api/auth/user/:id", (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.put("/api/auth/profile", (req, res) => {
  const { id, ...updates } = req.body;
  if (!id) return res.status(400).json({ error: "id is required" });
  const user = db.updateUserProfile(id, updates);
  res.json(user);
});

// --- Reports & Moderation ---
app.get("/api/admin/reports", (req, res) => {
  res.json(db.getReports());
});

app.post("/api/admin/reports", (req, res) => {
  const rep = db.addReport(req.body);
  res.status(201).json(rep);
});

app.post("/api/admin/reports/:id/resolve", (req, res) => {
  const { status } = req.body;
  const ok = db.resolveReport(req.params.id, status || "resolved");
  res.json({ success: ok });
});

app.get("/api/admin/stats", (req, res) => {
  res.json(db.getStats());
});

// Data management (ФЗ-152)
app.delete("/api/user/data", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const ok = db.softDeleteUser(userId);
  res.json({ success: ok });
});

app.post("/api/user/data/export", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const data = db.exportUserData(userId);
  res.json({ data });
});

// Audit log
app.get("/api/admin/audit", (_req, res) => {
  const logs = db.getAuditLogs();
  res.json(logs);
});

// Vite middleware for dev / static for prod
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
    console.log(`РЯДОМ НСК Server running on http://localhost:${PORT}`);
  });
}

startServer();
