import React, { useState } from "react";
import {
  Compass,
  MapPin,
  Sparkles,
  Search,
  Bell,
  Bookmark,
  Shield,
  Briefcase,
  Wrench,
  User,
  ChevronDown,
  Navigation,
} from "lucide-react";
import { DistrictName } from "../types";
import { NOVOSIBIRSK_DISTRICTS, SUPPORTED_CITIES } from "../utils/geo";
import {
  getCurrentUser,
  getNotifications,
  getSavedPostIds,
  getUserPreferences,
  setUserDistrict,
  switchRole,
} from "../services/storage";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenDigest: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSaved: () => void;
  onOpenAdmin: () => void;
  onOpenPreferences: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenDigest,
  onOpenNotifications,
  onOpenProfile,
  onOpenSaved,
  onOpenAdmin,
  onOpenPreferences,
}) => {
  const prefs = getUserPreferences();
  const user = getCurrentUser();
  const notifs = getNotifications();
  const unreadNotifs = notifs.filter((n) => !n.isRead).length;
  const savedCount = getSavedPostIds().length;

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleDistrictChange = (dist: DistrictName) => {
    setUserDistrict(dist);
    setDistrictDropdownOpen(false);
  };

  const handleRoleChange = (role: "user" | "executor" | "business" | "admin") => {
    switchRole(role);
    setRoleDropdownOpen(false);
  };

  return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Top line: Brand, Geo context, and Quick actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-rose-500/20">
              НСК
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                  РЯДОМ
                </span>
                <span className="bg-rose-50 text-rose-600 text-[11px] font-bold px-1.5 py-0.5 rounded-md border border-rose-100">
                  НСК
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Всё полезное рядом с тобой
              </p>
            </div>
          </div>

          {/* Geo Selectors: City & District */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* District dropdown */}
            <div className="relative">
              <button
                id="district-selector-btn"
                onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl transition-colors"
                title="Выбрать район Новосибирска"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-[140px]">
                  {prefs.currentDistrict}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {districtDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Районы Новосибирска
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {NOVOSIBIRSK_DISTRICTS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleDistrictChange(d.name)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-rose-50/70 transition-colors ${
                          prefs.currentDistrict === d.name
                            ? "text-rose-600 font-bold bg-rose-50/50"
                            : "text-slate-700"
                        }`}
                      >
                        <div>
                          <div>{d.name} район</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {d.description}
                          </div>
                        </div>
                        {prefs.currentDistrict === d.name && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Smart Digest Button: ✨ ЧТО ПОЛЕЗНОГО СЕГОДНЯ? */}
            <button
              id="smart-digest-header-btn"
              onClick={onOpenDigest}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200/90 hover:from-amber-200 hover:to-amber-300 border border-amber-300/60 px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden md:inline">Что полезного сегодня?</span>
              <span className="md:hidden">Дайджест</span>
            </button>
          </div>

          {/* User & Role actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Role indicator / switch dropdown */}
            <div className="relative">
              <button
                id="role-switch-btn"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-xl transition-colors"
                title="Переключить режим роли (Пользователь / Исполнитель / Бизнес / Админ)"
              >
                {user.role === "admin" && <Shield className="w-3.5 h-3.5 text-indigo-600" />}
                {user.role === "business" && <Briefcase className="w-3.5 h-3.5 text-blue-600" />}
                {user.role === "executor" && <Wrench className="w-3.5 h-3.5 text-amber-600" />}
                {user.role === "user" && <User className="w-3.5 h-3.5 text-slate-600" />}
                <span className="hidden lg:inline capitalize">
                  {user.role === "admin"
                    ? "Админ"
                    : user.role === "business"
                    ? "Бизнес"
                    : user.role === "executor"
                    ? "Исполнитель"
                    : "Житель"}
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    Режим аккаунта
                  </div>
                  <button
                    onClick={() => handleRoleChange("user")}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 ${
                      user.role === "user" ? "text-rose-600 font-bold" : "text-slate-700"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Житель / Заказчик
                  </button>
                  <button
                    onClick={() => handleRoleChange("executor")}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 ${
                      user.role === "executor" ? "text-amber-600 font-bold" : "text-slate-700"
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" /> Исполнитель (мастер)
                  </button>
                  <button
                    onClick={() => handleRoleChange("business")}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 ${
                      user.role === "business" ? "text-blue-600 font-bold" : "text-slate-700"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Локальный бизнес
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => handleRoleChange("admin")}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-indigo-50 ${
                      user.role === "admin" ? "text-indigo-600 font-bold" : "text-slate-700"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" /> Админ-панель
                  </button>
                </div>
              )}
            </div>

            {/* Saved Bookmarks */}
            <button
              id="header-saved-btn"
              onClick={onOpenSaved}
              className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Сохраненные публикации"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <button
              id="header-notifs-btn"
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Уведомления"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              id="header-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Мой профиль"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                ⭐ {user.rating}
              </span>
            </button>
          </div>
        </div>

        {/* Second line: Search bar & Radius quick toggles */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="main-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Что вы ищете? Например: кофе, электрик, диван, ярмарка..."
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-rose-400 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 w-4 h-4 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Radius Selector */}
          <button
            id="quick-radius-btn"
            onClick={onOpenPreferences}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200/60"
            title="Настроить радиус поиска и интересы"
          >
            <Compass className="w-3.5 h-3.5 text-rose-500" />
            <span>Радиус: {prefs.radiusKm} км</span>
          </button>
        </div>
      </div>
    </header>
  );
};
