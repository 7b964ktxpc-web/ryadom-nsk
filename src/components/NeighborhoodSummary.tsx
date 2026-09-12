import React from "react";
import {
  MapPin,
  Flame,
  Tag,
  Calendar,
  Gift,
  AlertTriangle,
  HeartHandshake,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { Post } from "../types";
import { getUserPreferences } from "../services/storage";

interface NeighborhoodSummaryProps {
  posts: Post[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  onOpenCreateUrgent: () => void;
  onOpenCreateGeneral: () => void;
  onOpenDigest: () => void;
}

export const NeighborhoodSummary: React.FC<NeighborhoodSummaryProps> = ({
  posts,
  activeFilter,
  onSelectFilter,
  onOpenCreateUrgent,
  onOpenCreateGeneral,
  onOpenDigest,
}) => {
  const prefs = getUserPreferences();

  // Counts of nearby active items within the selected radius / district
  const dealsCount = posts.filter((p) => p.type === "deal").length;
  const urgentCount = posts.filter((p) => p.type === "request" && p.urgency === "high").length;
  const eventsCount = posts.filter((p) => p.type === "event").length;
  const neighborCount = posts.filter((p) => p.type === "neighbor").length;
  const alertsCount = posts.filter((p) => p.type === "alert").length;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-4">
      {/* Location heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-rose-500" />
              {prefs.currentDistrict} район
            </span>
            <span className="text-xs text-slate-400 font-medium">
              в радиусе {prefs.radiusKm} км
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            РЯДОМ С ВАМИ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Сейчас в Новосибирске прямо возле вас:
          </p>
        </div>

        {/* Quick actions: Create standard post */}
        <div className="flex items-center gap-2">
          <button
            id="open-create-general-btn"
            onClick={onOpenCreateGeneral}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>Предложить услугу/скидку</span>
          </button>
        </div>
      </div>

      {/* Central Feature: 🆘 НУЖНО СЕЙЧАС (Requirement #3) */}
      <div className="mt-3.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 rounded-2xl p-3.5 sm:p-4 text-white shadow-md shadow-rose-500/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md backdrop-blur-xs">
              <Flame className="w-3 h-3 text-amber-200" />
              Главная функция
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
              Срочная задача или нужна помощь мастера?
            </h3>
            <p className="text-xs text-rose-100 max-w-xl">
              Напишите задачу простыми словами — AI моментально оформит заявку и уведомит проверенных соседей и мастеров в радиусе 1–5 км.
            </p>
          </div>

          <button
            id="hero-urgent-button"
            onClick={onOpenCreateUrgent}
            className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-rose-600 hover:bg-rose-50 font-black text-sm px-5 py-3 rounded-xl shadow-lg shadow-black/10 active:scale-95 transition-all"
          >
            <span className="text-base">🆘</span>
            <span>НУЖНО СЕЙЧАС</span>
          </button>
        </div>

        {/* Quick prompt examples for inspiration */}
        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center gap-2 overflow-x-auto text-[11px] text-white/90 scrollbar-none">
          <span className="shrink-0 font-medium text-white/70">Примеры:</span>
          <button
            onClick={onOpenCreateUrgent}
            className="shrink-0 bg-white/10 hover:bg-white/25 px-2.5 py-1 rounded-lg transition-colors"
          >
            «Нужен электрик сегодня»
          </button>
          <button
            onClick={onOpenCreateUrgent}
            className="shrink-0 bg-white/10 hover:bg-white/25 px-2.5 py-1 rounded-lg transition-colors"
          >
            «Поднять диван на 5 этаж»
          </button>
          <button
            onClick={onOpenCreateUrgent}
            className="shrink-0 bg-white/10 hover:bg-white/25 px-2.5 py-1 rounded-lg transition-colors"
          >
            «Кто может забрать документы?»
          </button>
          <button
            onClick={onOpenCreateUrgent}
            className="shrink-0 bg-white/10 hover:bg-white/25 px-2.5 py-1 rounded-lg transition-colors"
          >
            «Уборка квартиры завтра»
          </button>
        </div>
      </div>

      {/* Live Categories Counter Pills (Clicking filters the feed) */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {/* Deals */}
        <button
          onClick={() => onSelectFilter("deal")}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
            activeFilter === "deal"
              ? "bg-rose-50 border-rose-300 ring-2 ring-rose-200"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              {dealsCount} выгодных
            </div>
            <div className="text-[11px] text-slate-500">предложений</div>
          </div>
        </button>

        {/* Urgent Requests */}
        <button
          onClick={() => onSelectFilter("request")}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
            activeFilter === "request"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-200"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              {urgentCount} срочных
            </div>
            <div className="text-[11px] text-slate-500">запросов</div>
          </div>
        </button>

        {/* Events */}
        <button
          onClick={() => onSelectFilter("event")}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
            activeFilter === "event"
              ? "bg-purple-50 border-purple-300 ring-2 ring-purple-200"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              {eventsCount} событий
            </div>
            <div className="text-[11px] text-slate-500">в районе</div>
          </div>
        </button>

        {/* Neighbor announcements / help */}
        <button
          onClick={() => onSelectFilter("neighbor")}
          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
            activeFilter === "neighbor"
              ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              {neighborCount} объявлений
            </div>
            <div className="text-[11px] text-slate-500">от соседей</div>
          </div>
        </button>

        {/* Important alerts */}
        <button
          onClick={() => onSelectFilter("alert")}
          className={`col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
            activeFilter === "alert"
              ? "bg-red-50 border-red-300 ring-2 ring-red-200"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200/70"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              {alertsCount} важных
            </div>
            <div className="text-[11px] text-slate-500">сообщений</div>
          </div>
        </button>
      </div>
    </div>
  );
};
