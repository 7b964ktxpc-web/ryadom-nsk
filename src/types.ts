export type DistrictName =
  | "Октябрьский"
  | "Центральный"
  | "Железнодорожный"
  | "Заельцовский"
  | "Дзержинский"
  | "Калининский"
  | "Кировский"
  | "Ленинский"
  | "Первомайский"
  | "Советский";

export interface DistrictInfo {
  id: string;
  name: DistrictName;
  center: [number, number]; // [lat, lng]
  description: string;
}

export interface CityInfo {
  id: string;
  name: string;
  isDefault: boolean;
  center: [number, number];
  districts: DistrictInfo[];
}

export type PostType = "request" | "offer" | "deal" | "event" | "alert" | "neighbor";

export type RequestCategory =
  | "Ремонт"
  | "Перевозка"
  | "Уборка"
  | "Электрик"
  | "Сантехник"
  | "Сборка мебели"
  | "Компьютер"
  | "Животные"
  | "Авто"
  | "Забрать/доставить"
  | "Помощь с ребёнком"
  | "Другое";

export type DealCategory =
  | "Еда"
  | "Кафе"
  | "Магазины"
  | "Красота"
  | "Авто"
  | "Спорт"
  | "Дети"
  | "Услуги"
  | "Развлечения";

export type EventCategory =
  | "Концерты"
  | "Выставки"
  | "Детские"
  | "Спорт"
  | "Бесплатные"
  | "Ярмарки"
  | "Мастер-классы"
  | "Городские";

export type AnnouncementCategory =
  | "Отдам"
  | "Продам"
  | "Куплю"
  | "Потеряно"
  | "Найдено"
  | "Помощь"
  | "Животные"
  | "Разное";

export type AlertType =
  | "Авария"
  | "Отключение воды"
  | "Отключение света"
  | "Перекрытие дорог"
  | "Опасный участок"
  | "Городское предупреждение";

export type PostStatus = "active" | "completed" | "moderation" | "hidden";

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
  type: PostType;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  district: DistrictName;
  coordinates: [number, number]; // [lat, lng]
  approxAddress: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  date?: string;
  time?: string;
  urgency: "high" | "normal";
  status: PostStatus;
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
  source?: string;
  images?: string[];
  responses?: PostResponse[];
}

export interface Review {
  id: string;
  targetUserId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number; // 1-5
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

export interface UserPreferences {
  interests: string[];
  radiusKm: number; // 0.5, 1, 3, 5, 10
  notificationCategories: string[];
  currentCityId: string;
  currentDistrict: DistrictName;
  userCoordinates: [number, number];
  hasCompletedOnboarding: boolean;
  useGps: boolean;
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
  district: DistrictName;
  createdAt: string;
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

export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalPosts: number;
  totalRequests: number;
  totalResponses: number;
  totalBusinesses: number;
  totalEvents: number;
  totalReports: number;
  totalViews: number;
  categoryBreakdown: { name: string; count: number }[];
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
