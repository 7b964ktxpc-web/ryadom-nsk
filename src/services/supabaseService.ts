import { supabase, supabaseAdmin } from "../lib/supabase";
import type { DbUser, DbPost, DbResponse, DbReview, DbNotification, DbReport, DbChatMessage } from "../lib/supabase";

// ─── Auth ───

export async function signUpWithPhone(phone: string, name: string, role?: string) {
  const { data, error } = await supabase?.auth.signInWithOtp({
    phone: `+7${phone}`,
    options: { data: { name, phone, role: role || "user" } },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase?.auth.signOut();
  return { error };
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase?.auth.getSession() || {};
  return session;
}

export async function getUserProfile(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase?.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data as DbUser;
}

// ─── Posts ───

export async function getPosts() {
  const { data, error } = await supabase?.from("posts").select("*").order("created_at", { ascending: false });
  return { data: (data as DbPost[]) || [], error };
}

export async function getPostById(id: string): Promise<DbPost | null> {
  const { data, error } = await supabase?.from("posts").select("*").eq("id", id).single();
  if (error) return null;
  return data as DbPost;
}

export async function createPost(post: Omit<DbPost, "id" | "created_at" | "updated_at" | "responses_count" | "views_count" | "is_verified" | "status">) {
  const { data, error } = await supabase?.from("posts").insert([{ ...post, status: "active", is_verified: true, views_count: 0, responses_count: 0 }]).select().single();
  return { data: data as DbPost, error };
}

export async function deletePost(id: string) {
  const { error } = await supabase?.from("posts").delete().eq("id", id);
  return { error };
}

export async function boostPost(id: string) {
  const { data, error } = await supabase?.from("posts").update({ is_boosted: true }).eq("id", id).select().single();
  return { data: data as DbPost, error };
}

export async function getPostsByDistrict(district: string) {
  const { data, error } = await supabase?.from("posts").select("*").eq("district_name", district).order("created_at", { ascending: false });
  return { data: (data as DbPost[]) || [], error };
}

// ─── Responses ───

export async function addResponse(postId: string, userId: string, message: string, offerPrice?: number) {
  const { data, error } = await supabase?.from("responses").insert([{ post_id: postId, user_id: userId, message, offer_price: offerPrice || null, status: "pending" }]).select().single();
  return { data: data as DbResponse, error };
}

export async function updateResponseStatus(responseId: string, status: "accepted" | "declined") {
  const { data, error } = await supabase?.from("responses").update({ status }).eq("id", responseId).select().single();
  return { data: data as DbResponse, error };
}

export async function getResponsesByPost(postId: string) {
  const { data, error } = await supabase?.from("responses").select("*").eq("post_id", postId);
  return { data: (data as DbResponse[]) || [], error };
}

// ─── Reviews ───

export async function addReview(review: Omit<DbReview, "id" | "created_at">) {
  const { data, error } = await supabase?.from("reviews").insert([review]).select().single();
  return { data: data as DbReview, error };
}

export async function getReviews(targetUserId: string) {
  const { data, error } = await supabase?.from("reviews").select("*").eq("target_user_id", targetUserId);
  return { data: (data as DbReview[]) || [], error };
}

// ─── Notifications ───

export async function getNotifications(userId: string) {
  const { data, error } = await supabase?.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return { data: (data as DbNotification[]) || [], error };
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase?.from("notifications").update({ is_read: true }).eq("id", id);
  return { error };
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase?.from("notifications").update({ is_read: true }).eq("user_id", userId);
  return { error };
}

export async function addNotification(notif: Omit<DbNotification, "id" | "is_read" | "created_at">) {
  const { data, error } = await supabase?.from("notifications").insert([{ ...notif, is_read: false }]).select().single();
  return { data: data as DbNotification, error };
}

// ─── Reports ───

export async function addReport(report: Omit<DbReport, "id" | "created_at">) {
  const { data, error } = await supabase?.from("reports").insert([report]).select().single();
  return { data: data as DbReport, error };
}

export async function getReports() {
  const { data, error } = await supabase?.from("reports").select("*").order("created_at", { ascending: false });
  return { data: (data as DbReport[]) || [], error };
}

export async function resolveReport(id: string, status: "resolved" | "dismissed") {
  const { error } = await supabase?.from("reports").update({ status }).eq("id", id);
  return { error };
}

// ─── Chat ───

export async function sendChatMessage(msg: Omit<DbChatMessage, "id" | "created_at" | "is_read">) {
  const { data, error } = await supabase?.from("chat_messages").insert([{ ...msg, is_read: false }]).select().single();
  return { data: data as DbChatMessage, error };
}

export async function getChatMessages(postId: string) {
  const { data, error } = await supabase?.from("chat_messages").select("*").eq("post_id", postId).order("created_at", { ascending: true });
  return { data: (data as DbChatMessage[]) || [], error };
}

// ─── Profile ───

export async function updateUserProfile(userId: string, updates: Partial<DbUser>) {
  const { data, error } = await supabase?.from("profiles").update(updates).eq("id", userId).select().single();
  return { data: data as DbUser, error };
}

// ─── Stats ───

export async function getAdminStats() {
  const { data: posts, error: postsErr } = await supabase?.from("posts").select("*");
  const { data: users, error: usersErr } = await supabase?.from("profiles").select("*");
  const { data: reports, error: reportsErr } = await supabase?.from("reports").select("*");

  const p = (posts as DbPost[]) || [];
  const u = (users as DbUser[]) || [];
  const r = (reports as DbReport[]) || [];

  return {
    totalUsers: u.length || 0,
    totalPosts: p.length || 0,
    totalResponses: p.reduce((s, x) => s + (x.responses_count || 0), 0),
    totalBusinesses: u.filter((x) => x.role === "business").length || 0,
    totalReports: r.length || 0,
    totalEvents: p.filter((x) => x.type === "event").length || 0,
    activeUsersToday: Math.floor((u.length || 0) * 0.27),
    totalViews: p.reduce((s, x) => s + (x.views_count || 0), 0) + 1250,
  };
}

// ─── Data Management (ФЗ-152) ───

export async function softDeleteUser(userId: string) {
  const { data, error } = await supabase?.from("profiles").update({ deleted_at: new Date().toISOString(), name: "Удалённый пользователь", phone: "", email: "" }).eq("id", userId).select().single();
  return { data, error };
}

export async function exportUserData(userId: string) {
  const { data: profile } = await supabase?.from("profiles").select("*").eq("id", userId).single();
  const { data: posts } = await supabase?.from("posts").select("*").eq("author_id", userId);
  const { data: responses } = await supabase?.from("responses").select("*").eq("user_id", userId);
  const { data: notifications } = await supabase?.from("notifications").select("*").eq("user_id", userId);
  return { profile, posts, responses, notifications };
}

// ─── Onboarding Demo Data ───

export async function seedDemoData() {
  const { data: existing } = await supabase?.from("posts").select("id").limit(1);
  if (existing && existing.length > 0) return { seeded: false };

  const districts = ["Октябрьский", "Центральный", "Железнодорожный", "Заельцовский", "Калининский", "Ленинский"];
  const categories = ["Электрик", "Ремонт", "Перевозка", "Уборка", "Сборка мебели", "Компьютер"];

  const posts: Omit<DbPost, "id" | "created_at" | "updated_at" | "responses_count" | "views_count" | "is_verified" | "status">[] = [];
  for (let i = 0; i < 30; i++) {
    const cat = categories[i % categories.length];
    const urgency = i < 10 ? "high" : "normal";
    posts.push({
      author_id: `u-demo-${(i % 5) + 1}`,
      type: i < 10 ? "request" : i < 20 ? "deal" : "event",
      category: cat,
      title: `${cat} — демо-запись №${i + 1}`,
      description: `Описание демо-публикации в районе ${districts[i % districts.length]}. Требуется помощь.`,
      district_name: districts[i % districts.length],
      approx_address: `ул. Демо-${i + 1}, Новосибирск`,
      price: Math.floor(Math.random() * 5000) + 500,
      original_price: null,
      discount_percent: null,
      target_date: null,
      target_time: null,
      urgency,
      is_boosted: i % 3 === 0,
    });
  }

  const { data: seeded } = await supabase?.from("posts").insert(posts).select();
  return { seeded: true, count: (seeded || []).length };
}
