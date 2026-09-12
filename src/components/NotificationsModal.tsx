import React from "react";
import { X, Bell, Check, Clock, Flame, Tag, AlertTriangle, MessageSquare, CheckCheck } from "lucide-react";
import { Post, UserNotification } from "../types";
import {
  getNotifications,
  getStoredPosts,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/storage";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (post: Post) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectPost,
}) => {
  if (!isOpen) return null;

  const notifs = getNotifications();
  const allPosts = getStoredPosts();

  const handleNotificationClick = (n: UserNotification) => {
    markNotificationAsRead(n.id);
    if (n.postId) {
      const post = allPosts.find((p) => p.id === n.postId);
      if (post) {
        onClose();
        onSelectPost(post);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "urgent_request":
        return <Flame className="w-4 h-4 text-rose-500" />;
      case "deal":
        return <Tag className="w-4 h-4 text-emerald-500" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Уведомления
              </h2>
              <p className="text-[11px] text-slate-500">
                Срочные запросы и события рядом
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              title="Прочитать все"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Прочитать все</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {notifs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              У вас пока нет уведомлений.
            </div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-1 ${
                  !n.isRead
                    ? "bg-rose-50/40 border-rose-200 shadow-2xs"
                    : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getIcon(n.type)}
                    <span className="font-extrabold text-slate-900">{n.title}</span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">{n.message}</p>
                <div className="text-[10px] text-slate-400 pt-0.5">
                  {n.district ? `Район: ${n.district}` : "Новосибирск"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
