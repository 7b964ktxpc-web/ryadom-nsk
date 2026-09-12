import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || "";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// ─── Types ───

export interface DbUser {
  id: string;
  phone: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: "user" | "executor" | "business" | "admin";
  rating: number;
  completed_orders_count: number;
  responses_count: number;
  is_pro: boolean;
  is_verified: boolean;
  district_name: string;
  city_id: string;
  telegram: string | null;
  created_at: string;
  updated_at: string;
  consent_version: string | null;
  consent_timestamp: string | null;
  consent_geo: boolean;
  consent_analytics: boolean;
  consent_marketing: boolean;
  deleted_at: string | null;
}

export interface DbPost {
  id: string;
  author_id: string;
  type: "request" | "offer" | "deal" | "event" | "alert" | "neighbor";
  category: string;
  title: string;
  description: string;
  district_name: string;
  approx_address: string;
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  target_date: string | null;
  target_time: string | null;
  urgency: "high" | "normal";
  status: "active" | "completed" | "moderation" | "hidden";
  is_boosted: boolean;
  views_count: number;
  responses_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbResponse {
  id: string;
  post_id: string;
  user_id: string;
  message: string;
  offer_price: number | null;
  phone: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

export interface DbReview {
  id: string;
  target_user_id: string;
  author_id: string;
  post_id: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DbReport {
  id: string;
  post_id: string | null;
  reporter_id: string;
  reason: string;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
}

export interface DbChatMessage {
  id: string;
  post_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  recipient_id: string;
  recipient_name: string | null;
  text: string;
  created_at: string;
  is_read: boolean;
}
