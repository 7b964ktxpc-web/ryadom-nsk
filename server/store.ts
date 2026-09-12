import fs from "fs";
import path from "path";

export interface PostResponse {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRating: number;
  userCompletedCount: number;
  message: string;
  offerPrice?: number;
  phone?: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined";
}

export interface Post {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  district: string;
  coordinates: [number, number];
  approxAddress: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  date?: string;
  time?: string;
  urgency: "high" | "normal";
  status: "active" | "completed" | "moderation" | "hidden";
  isBoosted: boolean;
  boostExpiresAt?: string;
  isPro: boolean;
  isVerified: boolean;
  viewsCount: number;
  responsesCount: number;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRating: number;
  authorCompletedCount: number;
  authorRole: "user" | "executor" | "business";
  businessName?: string;
  businessLogo?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessSchedule?: string;
  externalUrl?: string;
  images?: string[];
  responses?: PostResponse[];
}

export interface Review {
  id: string;
  targetUserId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  requestId?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: "urgent_request" | "deal" | "event" | "response" | "rating" | "alert";
  title: string;
  message: string;
  postId?: string;
  district?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  postId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName?: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "user" | "executor" | "business" | "admin";
  rating: number;
  completedOrdersCount: number;
  responsesCount: number;
  isPro: boolean;
  isProPlus: boolean;
  district: string;
  createdAt: string;
  deletedAt?: string;
  bio?: string;
  telegram?: string;
  businessDetails?: {
    name: string;
    description: string;
    category: string;
    address: string;
    phone: string;
    schedule: string;
  };
}

export interface ReportItem {
  id: string;
  postId: string;
  postTitle: string;
  reason: string;
  authorId: string;
  createdAt: string;
  status: "open" | "resolved" | "dismissed";
}

interface DatabaseSchema {
  posts: Post[];
  reviews: Review[];
  notifications: UserNotification[];
  users: UserProfile[];
  messages: ChatMessage[];
  reports: ReportItem[];
}

const DB_FILE = path.join(process.cwd(), "data", "ryadom_db.json");

let memoryDb: DatabaseSchema = {
  posts: [],
  reviews: [],
  notifications: [],
  users: [],
  messages: [],
  reports: [],
};

function loadDb(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      memoryDb = JSON.parse(raw);
    } else {
      saveDb();
    }
  } catch (err) {
    console.error("Error reading database file:", err);
  }
}

function saveDb(): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Initial load
loadDb();

// Seed demo data if empty
if (memoryDb.users.length === 0) {
  seedDemoData();
}

function seedDemoData() {
  const demoUsers: UserProfile[] = [
    { id: "u-demo-1", name: "Алексей Мастеров", email: "alex@demo.ru", phone: "+79131234567", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", role: "executor", rating: 4.9, completedOrdersCount: 47, responsesCount: 12, isPro: false, isProPlus: false, district: "Октябрьский", createdAt: "2025-01-15T10:00:00Z" },
    { id: "u-demo-2", name: "Мария Клининг", email: "maria@demo.ru", phone: "+79139876543", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", role: "business", rating: 5.0, completedOrdersCount: 120, responsesCount: 35, isPro: true, isProPlus: false, district: "Центральный", createdAt: "2025-02-01T10:00:00Z", businessDetails: { name: "Клининг Мария", description: "Профессиональная уборка квартир и офисов", category: "Уборка", address: "Красный проспект, 100", phone: "+79139876543", schedule: "Пн-Сб 9:00-20:00" } },
    { id: "u-demo-3", name: "Дмитрий Электрик", email: "dmitry@demo.ru", phone: "+79135551122", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", role: "executor", rating: 4.85, completedOrdersCount: 32, responsesCount: 8, isPro: false, isProPlus: false, district: "Ленинский", createdAt: "2025-03-10T10:00:00Z" },
    { id: "u-demo-4", name: "Елена Сидорова", email: "elena@demo.ru", phone: "+79133334455", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", role: "user", rating: 4.7, completedOrdersCount: 3, responsesCount: 1, isPro: false, isProPlus: false, district: "Заельцовский", createdAt: "2025-04-05T10:00:00Z" },
    { id: "u-demo-5", name: "Сергей Грузчик", email: "sergey@demo.ru", phone: "+79137778899", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", role: "executor", rating: 4.95, completedOrdersCount: 89, responsesCount: 22, isPro: false, isProPlus: false, district: "Калининский", createdAt: "2025-01-20T10:00:00Z" },
    { id: "u-demo-6", name: "Ольга Бизнес", email: "olga@demo.ru", phone: "+79131112233", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", role: "business", rating: 4.6, completedOrdersCount: 15, responsesCount: 5, isPro: true, isProPlus: true, district: "Центральный", createdAt: "2025-02-15T10:00:00Z", businessDetails: { name: "Кафе 'Уют'", description: "Уютное кафе домашней еды", category: "Кафе", address: "Большевистская, 42", phone: "+79131112233", schedule: "Ежедневно 8:00-23:00" } },
  ];

  const demoPosts: Post[] = [
    { id: "p-demo-1", type: "request", title: "Нужен электрик — замена розетки на кухне", description: "Искрит розетка на кухне, нужна замена на двойную. Фурнитура куплена. Инструментов нет. Нужно сегодня вечером после 18:00.", category: "Электрик", district: "Октябрьский", coordinates: [82.9204, 55.0084], approxAddress: "ул. Титова, 34", price: 2000, urgency: "high", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 45, responsesCount: 3, createdAt: "2025-09-10T14:30:00Z", authorId: "u-demo-4", authorName: "Елена Сидорова", authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", authorRating: 4.7, authorCompletedCount: 3, authorRole: "user" },
    { id: "p-demo-2", type: "deal", title: "Комбо: кофе + круассан — скидка 25%", description: "Специально для соседей РЯДОМ: compra кофе и круассана со скидкой 25%. Работает каждый день до 12:00.", category: "Кафе", district: "Центральный", coordinates: [82.9271, 55.0415], approxAddress: "Красный проспект, 125", price: 299, originalPrice: 399, discountPercent: 25, urgency: "normal", status: "active", isBoosted: true, isPro: true, isVerified: true, viewsCount: 132, responsesCount: 0, createdAt: "2025-09-10T09:00:00Z", authorId: "u-demo-6", authorName: "Ольга Бизнес", authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", authorRating: 4.6, authorCompletedCount: 15, authorRole: "business", businessName: "Кафе 'Уют'" },
    { id: "p-demo-3", type: "request", title: "Срочно нужен сантехник — течёт труба", description: "Под раковиной на кухне течёт труба. Вода капает на пол. Нужно починить или заменить сифон. Срочно!", category: "Сантехник", district: "Ленинский", coordinates: [82.9058, 54.9914], approxAddress: "ул. Богдана Хмельницкого, 18", price: 1800, urgency: "high", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 67, responsesCount: 2, createdAt: "2025-09-10T11:15:00Z", authorId: "u-demo-1", authorName: "Алексей Мастеров", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", authorRating: 4.9, authorCompletedCount: 47, authorRole: "executor" },
    { id: "p-demo-4", type: "event", title: "Вечер джаза в парке у театра", description: "Бесплатный концерт джазовой музыки в парке им. Маяковского. Приходите с семьёй! Будут лавки, кафе на вынос.", category: "Событие", district: "Центральный", coordinates: [82.9235, 55.0341], approxAddress: "Парк Маяковского", price: 0, urgency: "normal", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 210, responsesCount: 0, createdAt: "2025-09-09T18:00:00Z", authorId: "u-demo-6", authorName: "Ольга Бизнес", authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", authorRating: 4.6, authorCompletedCount: 15, authorRole: "business", businessName: "Кафе 'Уют'" },
    { id: "p-demo-5", type: "request", title: "Нужна уборка 2-комнатной квартиры", description: "После ремонта нужна генеральная уборка 2-комнатной квартиры. Пыль, следы краски. Примерно 60 кв.м.", category: "Уборка", district: "Калининский", coordinates: [82.9410, 55.0220], approxAddress: "ул. Героя Гагарина, 22", price: 3500, urgency: "normal", status: "active", isBoosted: true, isPro: false, isVerified: true, viewsCount: 89, responsesCount: 4, createdAt: "2025-09-10T08:45:00Z", authorId: "u-demo-4", authorName: "Елена Сидорова", authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", authorRating: 4.7, authorCompletedCount: 3, authorRole: "user" },
    { id: "p-demo-6", type: "deal", title: "Стрижка мужская — скидка 30%", description: "Мужская стрижка в салоне 'Позитив' на.station area. Только по промокоду РЯДОМ. Действует до конца месяца.", category: "Красота", district: "Железнодорожный", coordinates: [82.9320, 55.0300], approxAddress: "Вокзальная магистраль, 10", price: 700, originalPrice: 1000, discountPercent: 30, urgency: "normal", status: "active", isBoosted: false, isPro: true, isVerified: true, viewsCount: 56, responsesCount: 0, createdAt: "2025-09-09T12:00:00Z", authorId: "u-demo-2", authorName: "Мария Клининг", authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", authorRating: 5.0, authorCompletedCount: 120, authorRole: "business", businessName: "Клининг Мария" },
    { id: "p-demo-7", type: "neighbor", title: "Отдам детскую кроватку в хорошем состоянии", description: "Детская кроватка IKEA SNIGLAR, использовалась 2 года, состояние отличное. Нужно забрать сами в Октябрьском районе.", category: "Отдам даром", district: "Октябрьский", coordinates: [82.9180, 55.0120], approxAddress: "ул. Дуси Ковальчук, 55", price: 0, urgency: "normal", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 178, responsesCount: 6, createdAt: "2025-09-08T15:30:00Z", authorId: "u-demo-1", authorName: "Алексей Мастеров", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", authorRating: 4.9, authorCompletedCount: 47, authorRole: "executor" },
    { id: "p-demo-8", type: "request", title: "Нужен грузчик — перевозка мебели", description: "Нужно перевезти диван и шкаф из Октябрьского в Заельцовский район. Расстояние ~5 км. Нужен грузчик с машиной.", category: "Перевозка", district: "Октябрьский", coordinates: [82.9190, 55.0100], approxAddress: "ул. Ленина, 10", price: 2500, urgency: "high", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 34, responsesCount: 1, createdAt: "2025-09-10T16:00:00Z", authorId: "u-demo-4", authorName: "Елена Сидорова", authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", authorRating: 4.7, authorCompletedCount: 3, authorRole: "user" },
    { id: "p-demo-9", type: "alert", title: "Перекрытие ул. Большевистской — ремонт дороги", description: "С 10 по 15 сентября перекрыт участок ул. Большевистской от Красного до Дуси Ковальчук. Детали: объезд через ул. Ватутина.", category: "Дороги", district: "Центральный", coordinates: [82.9250, 55.0350], approxAddress: "ул. Большевистская", urgency: "high", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 312, responsesCount: 0, createdAt: "2025-09-09T07:00:00Z", authorId: "u-demo-5", authorName: "Сергей Грузчик", authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", authorRating: 4.95, authorCompletedCount: 89, authorRole: "executor" },
    { id: "p-demo-10", type: "request", title: "Помощь с компьютером — не включается", description: "Не включается десктопный компьютер. Нажимаю кнопку — ничего. Нужен мастер, который приедет и посмотрит. Windows 10.", category: "Компьютер", district: "Дзержинский", coordinates: [82.8900, 55.0050], approxAddress: "ул. Авиастроителей, 14", price: 1500, urgency: "normal", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 23, responsesCount: 2, createdAt: "2025-09-10T13:00:00Z", authorId: "u-demo-5", authorName: "Сергей Грузчик", authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", authorRating: 4.95, authorCompletedCount: 89, authorRole: "executor" },
    { id: "p-demo-11", type: "request", title: "Выгул собаки — 2 часа", description: "Нужен кто-нибудь чтобы выгулял мою лабрадорку Муху завтра с 10 до 12. Она дружелюбная, поводок дам.", category: "Животные", district: "Советский", coordinates: [82.8800, 54.9900], approxAddress: "Академгородок, мкр. 11", price: 500, urgency: "normal", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 41, responsesCount: 3, createdAt: "2025-09-10T10:00:00Z", authorId: "u-demo-1", authorName: "Алексей Мастеров", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", authorRating: 4.9, authorCompletedCount: 47, authorRole: "executor" },
    { id: "p-demo-12", type: "deal", title: "Доставка еды бесплатно — район Октябрьский", description: "При заказе от 800 рублей бесплатная доставка по Октябрьскому району. Суши, пицца, бургеры. Время доставки 30-40 мин.", category: "Доставка еды", district: "Октябрьский", coordinates: [82.9200, 55.0090], approxAddress: "ул. Титова, 20", price: 0, urgency: "normal", status: "active", isBoosted: true, isPro: true, isVerified: true, viewsCount: 198, responsesCount: 0, createdAt: "2025-09-10T07:30:00Z", authorId: "u-demo-6", authorName: "Ольга Бизнес", authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", authorRating: 4.6, authorCompletedCount: 15, authorRole: "business", businessName: "Кафе 'Уют'" },
    { id: "p-demo-13", type: "request", title: "Нужен мастер по сборке мебели IKEA", description: "Купил шкаф PAX и комод MALM в IKEA. Нужен мастер, который соберёт. Инструкции есть. Плата по договорённости.", category: "Сборка мебели", district: "Центральный", coordinates: [82.9280, 55.0400], approxAddress: "пр. Мира, 15", price: 2000, urgency: "normal", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 55, responsesCount: 2, createdAt: "2025-09-09T20:00:00Z", authorId: "u-demo-4", authorName: "Елена Сидорова", authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", authorRating: 4.7, authorCompletedCount: 3, authorRole: "user" },
    { id: "p-demo-14", type: "neighbor", title: "Ищу соседей для совместной закупки угля", description: "Хочу заказать уголь 5 тонн на зиму для бани. Если есть соседи кто тоже хочет — закупимся вместе дешевле. Доставка в Октябрьский.", category: "Совместные закупки", district: "Октябрьский", coordinates: [82.9170, 55.0130], approxAddress: "ул. Авиационная, 8", price: 0, urgency: "normal", status: "active", isBoosted: false, isPro: false, isVerified: true, viewsCount: 67, responsesCount: 5, createdAt: "2025-09-08T12:00:00Z", authorId: "u-demo-5", authorName: "Сергей Грузчик", authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", authorRating: 4.95, authorCompletedCount: 89, authorRole: "executor" },
    { id: "p-demo-15", type: "request", title: "Установить кондиционер Samsung", description: "Купил настенный кондиционер Samsung AR12. Нужен мастер для установки. Стена — кирпич. Балкон 3 этаж.", category: "Ремонт", district: "Ленинский", coordinates: [82.9060, 54.9920], approxAddress: "ул. Державина, 28", price: 4000, urgency: "normal", status: "active", isBoosted: true, isPro: false, isVerified: true, viewsCount: 43, responsesCount: 1, createdAt: "2025-09-10T15:00:00Z", authorId: "u-demo-1", authorName: "Алексей Мастеров", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", authorRating: 4.9, authorCompletedCount: 47, authorRole: "executor" },
  ];

  memoryDb.users = demoUsers;
  memoryDb.posts = demoPosts;
  saveDb();
  console.log(`Seeded ${demoUsers.length} users and ${demoPosts.length} posts`);
}

// --- Posts API ---
export function getAllPosts(): Post[] {
  return memoryDb.posts || [];
}

export function getPostById(id: string): Post | undefined {
  return memoryDb.posts.find((p) => p.id === id);
}

export function createPost(post: Partial<Post>): Post {
  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: post.type || "request",
    title: post.title || "Новая публикация",
    description: post.description || "",
    category: post.category || "Другое",
    subCategory: post.subCategory,
    district: post.district || "Октябрьский",
    coordinates: post.coordinates || [55.0188, 82.9734],
    approxAddress: post.approxAddress || `Новосибирск, район ${post.district || "Октябрьский"}`,
    price: post.price,
    originalPrice: post.originalPrice,
    discountPercent: post.discountPercent,
    date: post.date || "Сегодня",
    time: post.time || "В ближайшее время",
    urgency: post.urgency || "normal",
    status: "active",
    isBoosted: Boolean(post.isBoosted),
    isPro: Boolean(post.isPro),
    isVerified: Boolean(post.isVerified),
    viewsCount: 1,
    responsesCount: 0,
    createdAt: new Date().toISOString(),
    authorId: post.authorId || "user-current-1",
    authorName: post.authorName || "Житель Новосибирска",
    authorAvatar: post.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    authorRating: post.authorRating || 5.0,
    authorCompletedCount: post.authorCompletedCount || 0,
    authorRole: post.authorRole || "user",
    businessName: post.businessName,
    businessLogo: post.businessLogo,
    businessAddress: post.businessAddress,
    businessPhone: post.businessPhone,
    businessSchedule: post.businessSchedule,
    images: post.images || [],
    responses: [],
  };

  memoryDb.posts.unshift(newPost);
  saveDb();
  addAuditLog("CREATE_POST", newPost.authorId, newPost.id);
  return newPost;
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const idx = memoryDb.posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  memoryDb.posts[idx] = { ...memoryDb.posts[idx], ...updates };
  saveDb();
  return memoryDb.posts[idx];
}

export function deletePost(id: string): boolean {
  const initialLen = memoryDb.posts.length;
  memoryDb.posts = memoryDb.posts.filter((p) => p.id !== id);
  if (memoryDb.posts.length !== initialLen) {
    saveDb();
    return true;
  }
  return false;
}

export function boostPost(id: string): Post | null {
  const post = getPostById(id);
  if (!post) return null;
  post.isBoosted = true;
  post.boostExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  saveDb();
  return post;
}

export function addResponse(
  postId: string,
  resp: {
    userId: string;
    userName: string;
    userAvatar: string;
    userRating: number;
    userCompletedCount: number;
    message: string;
    offerPrice?: number;
    phone?: string;
  }
): PostResponse | null {
  const post = getPostById(postId);
  if (!post) return null;

  if (!post.responses) post.responses = [];

  const newResp: PostResponse = {
    id: `resp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    postId,
    userId: resp.userId,
    userName: resp.userName,
    userAvatar: resp.userAvatar,
    userRating: resp.userRating,
    userCompletedCount: resp.userCompletedCount,
    message: resp.message,
    offerPrice: resp.offerPrice,
    phone: resp.phone,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  // Replace existing response by this user or append
  const existingIdx = post.responses.findIndex((r) => r.userId === resp.userId);
  if (existingIdx !== -1) {
    post.responses[existingIdx] = newResp;
  } else {
    post.responses.push(newResp);
  }

  post.responsesCount = post.responses.length;

  // Add notification to post author
  addNotification({
    userId: post.authorId,
    type: "response",
    title: `💬 Новый отклик на заявку: ${post.title}`,
    message: `${resp.userName}: «${resp.message.slice(0, 70)}»`,
    postId: post.id,
    district: post.district,
  });

  saveDb();
  return newResp;
}

export function updateResponseStatus(postId: string, responseId: string, status: "pending" | "accepted" | "declined"): boolean {
  const post = getPostById(postId);
  if (!post || !post.responses) return false;

  const resp = post.responses.find((r) => r.id === responseId);
  if (!resp) return false;

  resp.status = status;
  if (status === "accepted") {
    // Notify the responder
    addNotification({
      userId: resp.userId,
      type: "response",
      title: "🎉 Ваше предложение принято заказчиком!",
      message: `Заказчик выбрал вас для выполнения: «${post.title}». Напишите или свяжитесь для согласования.`,
      postId: post.id,
      district: post.district,
    });
  }

  saveDb();
  return true;
}

// --- Messages / Chat API ---
export function getChatMessages(postId: string, userId1?: string, userId2?: string): ChatMessage[] {
  let msgs = memoryDb.messages.filter((m) => m.postId === postId);
  if (userId1 && userId2) {
    msgs = msgs.filter(
      (m) =>
        (m.senderId === userId1 && m.recipientId === userId2) ||
        (m.senderId === userId2 && m.recipientId === userId1)
    );
  }
  return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function sendChatMessage(msg: {
  postId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName?: string;
  text: string;
}): ChatMessage {
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    postId: msg.postId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatar,
    recipientId: msg.recipientId,
    recipientName: msg.recipientName,
    text: msg.text.trim(),
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  if (!memoryDb.messages) memoryDb.messages = [];
  memoryDb.messages.push(newMsg);

  // Notify recipient
  addNotification({
    userId: msg.recipientId,
    type: "response",
    title: `📩 Сообщение от ${msg.senderName}`,
    message: msg.text.length > 60 ? msg.text.slice(0, 60) + "..." : msg.text,
    postId: msg.postId,
  });

  saveDb();
  return newMsg;
}

// --- Reviews API ---
export function getReviews(targetUserId?: string): Review[] {
  if (!memoryDb.reviews) memoryDb.reviews = [];
  if (targetUserId) {
    return memoryDb.reviews.filter((r) => r.targetUserId === targetUserId);
  }
  return memoryDb.reviews;
}

export function addReview(review: {
  targetUserId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  requestId?: string;
}): Review {
  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    targetUserId: review.targetUserId,
    authorId: review.authorId,
    authorName: review.authorName,
    authorAvatar: review.authorAvatar,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date().toISOString(),
    requestId: review.requestId,
  };

  if (!memoryDb.reviews) memoryDb.reviews = [];
  memoryDb.reviews.unshift(newReview);

  // Update target user's rating
  const targetUser = memoryDb.users.find((u) => u.id === review.targetUserId);
  if (targetUser) {
    const userReviews = memoryDb.reviews.filter((r) => r.targetUserId === review.targetUserId);
    const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    targetUser.rating = Number(avg.toFixed(1));
    targetUser.completedOrdersCount = (targetUser.completedOrdersCount || 0) + 1;
  }

  // Notify target user
  addNotification({
    userId: review.targetUserId,
    type: "rating",
    title: `⭐ Новый отзыв: ${review.rating} из 5`,
    message: `${review.authorName}: «${review.comment.slice(0, 60)}»`,
  });

  saveDb();
  return newReview;
}

// --- Notifications API ---
export function getNotifications(userId?: string): UserNotification[] {
  if (!memoryDb.notifications) memoryDb.notifications = [];
  if (userId) {
    return memoryDb.notifications.filter((n) => n.userId === userId);
  }
  return memoryDb.notifications;
}

export function addNotification(notif: {
  userId: string;
  type: "urgent_request" | "deal" | "event" | "response" | "rating" | "alert";
  title: string;
  message: string;
  postId?: string;
  district?: string;
}): UserNotification {
  const newNotif: UserNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: notif.userId,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    postId: notif.postId,
    district: notif.district,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (!memoryDb.notifications) memoryDb.notifications = [];
  memoryDb.notifications.unshift(newNotif);
  saveDb();
  return newNotif;
}

export function markNotificationRead(id: string): boolean {
  const notif = memoryDb.notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    saveDb();
    return true;
  }
  return false;
}

export function markAllNotificationsRead(userId: string): boolean {
  let changed = false;
  memoryDb.notifications.forEach((n) => {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true;
      changed = true;
    }
  });
  if (changed) saveDb();
  return changed;
}

// --- Users & Auth API ---
export function getUserById(id: string): UserProfile | undefined {
  return memoryDb.users.find((u) => u.id === id);
}

export function getUserByPhone(phone: string): UserProfile | undefined {
  const cleanPhone = phone.replace(/\D/g, "");
  return memoryDb.users.find((u) => u.phone.replace(/\D/g, "") === cleanPhone);
}

export function registerOrLoginUser(params: {
  phone: string;
  name: string;
  role?: "user" | "executor" | "business";
  district?: string;
  telegram?: string;
  avatar?: string;
}): UserProfile {
  let user = getUserByPhone(params.phone);
  if (user) {
    // Update fields if provided
    if (params.name) user.name = params.name;
    if (params.role) user.role = params.role;
    if (params.district) user.district = params.district;
    if (params.telegram) user.telegram = params.telegram;
    if (params.avatar) user.avatar = params.avatar;
    saveDb();
    return user;
  }

  // Create new user
  user = {
    id: `u-nsk-${Date.now()}`,
    name: params.name || "Житель Новосибирска",
    email: `${params.phone.replace(/\D/g, "")}@ryadom.nsk`,
    phone: params.phone,
    avatar: params.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    role: params.role || "user",
    rating: 5.0,
    completedOrdersCount: 0,
    responsesCount: 0,
    isPro: false,
    isProPlus: false,
    district: params.district || "Октябрьский",
    createdAt: new Date().toISOString(),
    telegram: params.telegram,
  };

  if (!memoryDb.users) memoryDb.users = [];
  memoryDb.users.push(user);
  saveDb();
  return user;
}

export function updateUserProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
  const idx = memoryDb.users.findIndex((u) => u.id === id);
  if (idx === -1) {
    // If not found, add to list
    const newUser: UserProfile = {
      id,
      name: updates.name || "Пользователь",
      email: updates.email || "",
      phone: updates.phone || "",
      avatar: updates.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      role: updates.role || "user",
      rating: updates.rating || 5.0,
      completedOrdersCount: updates.completedOrdersCount || 0,
      responsesCount: updates.responsesCount || 0,
      isPro: Boolean(updates.isPro),
      isProPlus: Boolean(updates.isProPlus),
      district: updates.district || "Октябрьский",
      createdAt: new Date().toISOString(),
      ...updates,
    };
    memoryDb.users.push(newUser);
    saveDb();
    return newUser;
  }
  memoryDb.users[idx] = { ...memoryDb.users[idx], ...updates };
  saveDb();
  return memoryDb.users[idx];
}

// --- Reports API ---
export function addReport(report: { postId: string; postTitle: string; reason: string; authorId: string }): ReportItem {
  const newReport: ReportItem = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    postId: report.postId,
    postTitle: report.postTitle,
    reason: report.reason,
    authorId: report.authorId,
    createdAt: new Date().toISOString(),
    status: "open",
  };
  if (!memoryDb.reports) memoryDb.reports = [];
  memoryDb.reports.unshift(newReport);
  saveDb();
  return newReport;
}

export function getReports(): ReportItem[] {
  return memoryDb.reports || [];
}

export function resolveReport(reportId: string, status: "resolved" | "dismissed"): boolean {
  const rep = memoryDb.reports.find((r) => r.id === reportId);
  if (rep) {
    rep.status = status;
    saveDb();
    return true;
  }
  return false;
}

export function getStats() {
  const posts = memoryDb.posts || [];
  return {
    totalUsers: (memoryDb.users || []).length || 1420,
    activeUsersToday: 384,
    totalPosts: posts.length,
    totalRequests: posts.filter((p) => p.type === "request").length,
    totalResponses: posts.reduce((sum, p) => sum + (p.responsesCount || 0), 0),
    totalBusinesses: posts.filter((p) => p.authorRole === "business" || p.type === "deal").length,
    totalEvents: posts.filter((p) => p.type === "event").length,
    totalReports: (memoryDb.reports || []).length,
    totalViews: posts.reduce((sum, p) => sum + (p.viewsCount || 0), 0) + 1250,
    categoryBreakdown: [
      { name: "Срочные задачи", count: posts.filter((p) => p.type === "request").length },
      { name: "Скидки и спецпредложения", count: posts.filter((p) => p.type === "deal").length },
      { name: "События в районе", count: posts.filter((p) => p.type === "event").length },
      { name: "Соседская помощь", count: posts.filter((p) => p.type === "neighbor").length },
    ],
  };
}

// ФЗ-152 compliance functions
export function softDeleteUser(userId: string): boolean {
  const user = memoryDb.users.find((u) => u.id === userId);
  if (user) {
    user.name = "Удалённый пользователь";
    user.phone = "";
    user.email = "";
    user.deletedAt = new Date().toISOString();
    saveDb();
    return true;
  }
  return false;
}

export function exportUserData(userId: string): object {
  const user = memoryDb.users.find((u) => u.id === userId);
  if (!user) return {};
  return {
    profile: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, district: user.district, createdAt: user.createdAt },
    posts: memoryDb.posts.filter((p) => p.authorId === userId),
    responses: memoryDb.posts.flatMap((p) => (p.responses || []).filter((r) => r.userId === userId)),
    notifications: (memoryDb.notifications || []).filter((n) => n.userId === userId),
    reviews: (memoryDb.reviews || []).filter((r) => r.targetUserId === userId || r.authorId === userId),
  };
}

const auditLog: Array<{ id: string; timestamp: string; action: string; user: string; target: string }> = [];

export function addAuditLog(action: string, user: string, target: string) {
  auditLog.push({ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), action, user, target });
}

export function getAuditLogs() {
  return auditLog.slice(-100);
}
