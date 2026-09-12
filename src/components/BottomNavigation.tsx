import React from "react";
import { Home, Compass, Plus, Bell, User } from "lucide-react";
import { getCurrentUser, getNotifications } from "../services/storage";

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreate: () => void;
  onOpenPreferences: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenCreate,
  onOpenPreferences,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const notifs = getNotifications();
  const unreadCount = notifs.filter((n) => !n.isRead).length;
  const user = getCurrentUser();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 sm:hidden py-1 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Feed / Home */}
        <button
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            currentTab === "home" ? "text-rose-600 font-bold" : "text-slate-500"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Лента</span>
        </button>

        {/* Radius / Preferences */}
        <button
          onClick={onOpenPreferences}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Рядом</span>
        </button>

        {/* Center Create Button */}
        <button
          onClick={onOpenCreate}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-90 transition-transform"
          title="Создать запрос или предложение"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="text-[10px]">Оповещения</span>
        </button>

        {/* Profile */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-5 h-5 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="text-[10px]">Профиль</span>
        </button>
      </div>
    </div>
  );
};
