import {
  AdminStats,
  DistrictName,
  Post,
  PostResponse,
  PostStatus,
  ReportItem,
  Review,
  UserNotification,
  UserPreferences,
  UserProfile,
} from "../types";
import {
  ALL_INITIAL_POSTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEWS,
  INITIAL_USER,
} from "./seedData";
import { NOVOSIBIRSK_DISTRICTS } from "../utils/geo";

const STORAGE_KEYS = {
  POSTS: "ryadom_nsk_posts_v1",
  USER: "ryadom_nsk_user_v1",
  SAVED: "ryadom_nsk_saved_v1",
  NOTIFS: "ryadom_nsk_notifs_v1",
  PREFS: "ryadom_nsk_prefs_v1",
  REVIEWS: "ryadom_nsk_reviews_v1",
  REPORTS: "ryadom_nsk_reports_v1",
  BLOCKED_USERS: "ryadom_nsk_blocked_users_v1",
};

// Simple event listener hub for reactive state updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

// User preferences default
const DEFAULT_PREFERENCES: UserPreferences = {
  interests: ["Скидки", "Еда", "Ремонт", "Мероприятия", "Объявления"],
  radiusKm: 3.0,
  notificationCategories: ["urgent_request", "deal", "alert", "response"],
  currentCityId: "nsk",
  currentDistrict: "Октябрьский",
  userCoordinates: [55.0188, 82.9734],
  hasCompletedOnboarding: false,
  useGps: false,
};

// --- Posts ---
export function getStoredPosts(): Post[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(ALL_INITIAL_POSTS));
      return ALL_INITIAL_POSTS;
    }
    return JSON.parse(raw);
  } catch {
    return ALL_INITIAL_POSTS;
  }
}

export function saveStoredPosts(posts: Post[]): void {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  notifyListeners();
}

export function createPost(postData: Partial<Post>): Post {
  const posts = getStoredPosts();
  const user = getCurrentUser();

  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: postData.type || "request",
    title: postData.title || "Без названия",
    description: postData.description || "",
    category: postData.category || "Другое",
    district: postData.district || user.district || "Октябрьский",
    coordinates: postData.coordinates || [55.0188, 82.9734],
    approxAddress: postData.approxAddress || `район ${postData.district || "Октябрьский"}`,
    price: postData.price,
    originalPrice: postData.originalPrice,
    discountPercent: postData.discountPercent,
    date: postData.date || "Сегодня",
    time: postData.time || "В ближайшее время",
    urgency: postData.urgency || "normal",
    status: "active",
    isBoosted: Boolean(postData.isBoosted),
    isPro: user.isPro || Boolean(postData.isPro),
    isVerified: true,
    viewsCount: 1,
    responsesCount: 0,
    createdAt: new Date().toISOString(),
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    authorRating: user.rating,
    authorCompletedCount: user.completedOrdersCount,
    authorRole: user.role === "admin" ? "user" : user.role,
    businessName: postData.businessName || (user.role === "business" ? user.businessDetails?.name : undefined),
    businessAddress: postData.businessAddress || (user.role === "business" ? user.businessDetails?.address : undefined),
    businessPhone: postData.businessPhone || (user.role === "business" ? user.businessDetails?.phone : undefined),
    businessSchedule: postData.businessSchedule || (user.role === "business" ? user.businessDetails?.schedule : undefined),
    externalUrl: postData.externalUrl,
    images: postData.images,
    responses: [],
  };

  const updated = [newPost, ...posts];
  saveStoredPosts(updated);

  // If urgent request, trigger a mock notification for neighbors
  if (newPost.type === "request" && newPost.urgency === "high") {
    addNotification({
      userId: user.id,
      type: "urgent_request",
      title: "🚀 Запрос опубликован",
      message: `Ваш срочный запрос «${newPost.title.slice(0, 40)}...» отправлен ближайшим исполнителям в радиусе 1–5 км.`,
      postId: newPost.id,
      district: newPost.district,
    });
  }

  return newPost;
}

export function updatePost(postId: string, updates: Partial<Post>): Post | null {
  const posts = getStoredPosts();
  let updatedPost: Post | null = null;
  const next = posts.map((p) => {
    if (p.id === postId) {
      updatedPost = { ...p, ...updates };
      return updatedPost;
    }
    return p;
  });
  if (updatedPost) {
    saveStoredPosts(next);
  }
  return updatedPost;
}

export function deletePost(postId: string): void {
  const posts = getStoredPosts();
  const next = posts.filter((p) => p.id !== postId);
  saveStoredPosts(next);
}

export function boostPost(postId: string): void {
  const posts = getStoredPosts();
  const next = posts.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        isBoosted: true,
        boostExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      };
    }
    return p;
  });
  saveStoredPosts(next);
  addNotification({
    userId: getCurrentUser().id,
    type: "deal",
    title: "⚡ Публикация поднята в ТОП",
    message: "Ваша запись получила максимальный приоритет в радиусе на 24 часа!",
    postId,
  });
}

export function addPostResponse(
  postId: string,
  message: string,
  offerPrice?: number,
  phone?: string
): PostResponse {
  const posts = getStoredPosts();
  const user = getCurrentUser();

  const response: PostResponse = {
    id: `resp-${Date.now()}`,
    postId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    userRating: user.rating,
    userCompletedCount: user.completedOrdersCount,
    message,
    offerPrice,
    phone: phone || user.phone,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const next = posts.map((p) => {
    if (p.id === postId) {
      const existing = p.responses || [];
      return {
        ...p,
        responsesCount: p.responsesCount + 1,
        responses: [response, ...existing],
      };
    }
    return p;
  });

  saveStoredPosts(next);

  // Notify current user
  addNotification({
    userId: user.id,
    type: "response",
    title: "✅ Отклик отправлен",
    message: `Вы откликнулись на задачу. Автор увидит ваш профиль (⭐ ${user.rating}).`,
    postId,
  });

  return response;
}

export function updateResponseStatus(
  postId: string,
  responseId: string,
  status: "accepted" | "declined"
): void {
  const posts = getStoredPosts();
  const next = posts.map((p) => {
    if (p.id === postId && p.responses) {
      const updatedResponses = p.responses.map((r) =>
        r.id === responseId ? { ...r, status } : r
      );
      return {
        ...p,
        status: status === "accepted" ? ("completed" as PostStatus) : p.status,
        responses: updatedResponses,
      };
    }
    return p;
  });
  saveStoredPosts(next);

  if (status === "accepted") {
    addNotification({
      userId: getCurrentUser().id,
      type: "response",
      title: "🎉 Исполнитель выбран!",
      message: "Запрос переведен в статус выполненных. Контакты согласованы.",
      postId,
    });
  }
}

// --- Saved / Bookmarks ---
export function getSavedPostIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSavePost(postId: string): boolean {
  const ids = getSavedPostIds();
  const exists = ids.includes(postId);
  let next: string[];
  if (exists) {
    next = ids.filter((id) => id !== postId);
  } else {
    next = [postId, ...ids];
  }
  localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next));
  notifyListeners();
  return !exists;
}

// --- User Profile ---
export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USER;
  }
}

export function updateCurrentUser(updates: Partial<UserProfile>): UserProfile {
  const user = getCurrentUser();
  const next = { ...user, ...updates };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(next));
  notifyListeners();
  return next;
}

export function switchRole(role: "user" | "executor" | "business" | "admin"): UserProfile {
  return updateCurrentUser({ role });
}

// --- User Preferences & Geolocation ---
export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(DEFAULT_PREFERENCES));
      return DEFAULT_PREFERENCES;
    }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences();
  const next = { ...current, ...prefs };
  localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(next));
  notifyListeners();
  return next;
}

export function setUserDistrict(district: DistrictName): void {
  const dist = NOVOSIBIRSK_DISTRICTS.find((d) => d.name === district);
  const coords: [number, number] = dist ? [dist.center[0], dist.center[1]] : [55.0188, 82.9734];
  saveUserPreferences({
    currentDistrict: district,
    userCoordinates: coords,
  });
  updateCurrentUser({ district });
}

// --- Notifications ---
export function getStoredNotifications(): UserNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export const getNotifications = getStoredNotifications;

export function addNotification(
  notif: Omit<UserNotification, "id" | "isRead" | "createdAt">
): UserNotification {
  const notifs = getStoredNotifications();
  const newNotif: UserNotification = {
    ...notif,
    id: `notif-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  const next = [newNotif, ...notifs];
  localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(next));
  notifyListeners();
  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const notifs = getStoredNotifications();
  const next = notifs.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(next));
  notifyListeners();
}

export function markAllNotificationsAsRead(): void {
  const notifs = getStoredNotifications();
  const next = notifs.map((n) => ({ ...n, isRead: true }));
  localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(next));
  notifyListeners();
}

// --- Reviews ---
export function getStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function addReview(targetUserId: string, rating: number, comment: string): Review {
  const reviews = getStoredReviews();
  const user = getCurrentUser();
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    targetUserId,
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };
  const next = [newReview, ...reviews];
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(next));

  // If currentUser is the target, update their stats
  if (targetUserId === user.id) {
    const nextCount = (user.completedOrdersCount || 0) + 1;
    const currentRating = user.rating || 5.0;
    const newRating = Number(((currentRating * (nextCount - 1) + rating) / nextCount).toFixed(1));
    updateCurrentUser({
      completedOrdersCount: nextCount,
      rating: newRating,
    });
  }

  // Send in-app notification about review
  addNotification({
    userId: targetUserId,
    type: "rating",
    title: `⭐ Новый отзыв: ${rating} из 5`,
    message: `${user.name}: «${comment.length > 50 ? comment.slice(0, 50) + "..." : comment}»`,
  });

  notifyListeners();
  return newReview;
}

// --- Reports & Moderation ---
export function getStoredReports(): ReportItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      const initialReports: ReportItem[] = [
        {
          id: "rep-1",
          postId: "req-1",
          postTitle: "Нужен электрик заменить розетки",
          reason: "Дубликат заявки",
          authorId: "u-nsk-999",
          createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          status: "open",
        },
      ];
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialReports));
      return initialReports;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function reportPost(postId: string, reason: string): void {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);
  const reports = getStoredReports();
  const newReport: ReportItem = {
    id: `rep-${Date.now()}`,
    postId,
    postTitle: post ? post.title : "Удаленная публикация",
    reason,
    authorId: getCurrentUser().id,
    createdAt: new Date().toISOString(),
    status: "open",
  };
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([newReport, ...reports]));
  notifyListeners();
}

export function resolveReport(reportId: string, status: "resolved" | "dismissed"): void {
  const reports = getStoredReports();
  const next = reports.map((r) => (r.id === reportId ? { ...r, status } : r));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(next));
  notifyListeners();
}

export function moderatePost(
  postId: string,
  action: "approve" | "hide" | "delete" | "verify"
): void {
  if (action === "delete") {
    deletePost(postId);
    return;
  }
  const posts = getStoredPosts();
  const next = posts.map((p) => {
    if (p.id === postId) {
      if (action === "approve") return { ...p, status: "active" as PostStatus };
      if (action === "hide") return { ...p, status: "hidden" as PostStatus };
      if (action === "verify") return { ...p, isVerified: !p.isVerified };
    }
    return p;
  });
  saveStoredPosts(next);
}

// Blocked users
export function getBlockedUserIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBlockUser(userId: string): boolean {
  const list = getBlockedUserIds();
  const exists = list.includes(userId);
  let next: string[];
  if (exists) {
    next = list.filter((id) => id !== userId);
  } else {
    next = [...list, userId];
  }
  localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(next));
  notifyListeners();
  return !exists;
}

// Admin stats calculation
export function getAdminStats(): AdminStats {
  const posts = getStoredPosts();
  const reports = getStoredReports();

  const totalRequests = posts.filter((p) => p.type === "request").length;
  const totalBusinesses = posts.filter((p) => p.type === "deal" || p.authorRole === "business").length;
  const totalEvents = posts.filter((p) => p.type === "event").length;
  const totalViews = posts.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalResponses = posts.reduce((acc, p) => acc + (p.responsesCount || 0), 0);

  const categoriesMap: Record<string, number> = {};
  posts.forEach((p) => {
    categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
  });

  const categoryBreakdown = Object.entries(categoriesMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalUsers: 1420,
    activeUsersToday: 384,
    totalPosts: posts.length,
    totalRequests,
    totalResponses,
    totalBusinesses,
    totalEvents,
    totalReports: reports.filter((r) => r.status === "open").length,
    totalViews,
    categoryBreakdown,
  };
}

// Reset or Clear demo data
export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(ALL_INITIAL_POSTS));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
  localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify([]));
  notifyListeners();
}

export function clearDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify([]));
  notifyListeners();
}
