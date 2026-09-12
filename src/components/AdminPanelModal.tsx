import React, { useState } from "react";
import {
  X,
  Shield,
  BarChart3,
  CheckCircle,
  EyeOff,
  Trash2,
  AlertTriangle,
  Users,
  RefreshCw,
  Zap,
  Check,
  Ban,
  UserCheck,
} from "lucide-react";
import { Post, ReportItem } from "../types";
import {
  clearDemoData,
  getAdminStats,
  getBlockedUserIds,
  getStoredPosts,
  getStoredReports,
  moderatePost,
  resetDemoData,
  resolveReport,
  toggleBlockUser,
} from "../services/storage";

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<"stats" | "moderation" | "reports" | "users" | "data">("stats");
  const [filterType, setFilterType] = useState<string>("all");
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const stats = getAdminStats();
  const posts = getStoredPosts();
  const reports = getStoredReports();
  const blockedUserIds = getBlockedUserIds();

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const handleModerate = (postId: string, action: "approve" | "hide" | "delete" | "verify") => {
    moderatePost(postId, action);
    showNotice(`Действие «${action}» успешно применено к публикации.`);
    if (onDataChanged) onDataChanged();
  };

  const handleResolveReport = (reportId: string, status: "resolved" | "dismissed") => {
    resolveReport(reportId, status);
    showNotice("Жалоба обработана модератором.");
    if (onDataChanged) onDataChanged();
  };

  const handleResetData = () => {
    resetDemoData();
    showNotice("✓ База данных успешно сброшена к эталонным 55+ объектам Новосибирска.");
    if (onDataChanged) onDataChanged();
  };

  const handleClearData = () => {
    clearDemoData();
    showNotice("Лента публикаций очищена.");
    if (onDataChanged) onDataChanged();
  };

  const handleToggleBlock = (userId: string) => {
    toggleBlockUser(userId);
    showNotice("Статус блокировки пользователя изменен.");
    if (onDataChanged) onDataChanged();
  };

  const filteredPosts = filterType === "all" ? posts : posts.filter((p) => p.type === filterType);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Админ-панель «РЯДОМ НСК»
                </h2>
                <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded">
                  SuperAdmin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Модерация контента, аналитика города и управление системой
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Bar */}
        {adminNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adminNotice}</span>
          </div>
        )}

        {/* Admin Nav Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-bold overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-2.5 px-2.5 border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "stats"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Статистика города</span>
          </button>

          <button
            onClick={() => setActiveTab("moderation")}
            className={`pb-2.5 px-2.5 border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "moderation"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Модерация постов ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-2.5 px-2.5 border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "reports"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Жалобы ({reports.filter((r) => r.status === "open").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2.5 px-2.5 border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "users"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Пользователи</span>
          </button>

          <button
            onClick={() => setActiveTab("data")}
            className={`pb-2.5 px-2.5 border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "data"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Управление данными</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* 1. Stats */}
          {activeTab === "stats" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Всего пользователей</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    {stats.totalUsers.toLocaleString("ru-RU")}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    +{stats.activeUsersToday} сегодня
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Всего публикаций</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    {stats.totalPosts}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {stats.totalRequests} запросов
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Откликов на задачи</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    {stats.totalResponses}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    Высокая конверсия
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">Бизнес и скидки</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    {stats.totalBusinesses}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                    Партнеры НСК
                  </span>
                </div>
              </div>

              {/* Categories breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-black text-slate-900 mb-3">
                  Распределение по категориям в Новосибирске
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stats.categoryBreakdown.map((c) => (
                    <div
                      key={c.name}
                      className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-700">{c.name}</span>
                      <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {c.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Moderation queue */}
          {activeTab === "moderation" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {["all", "request", "deal", "event", "neighbor", "alert"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                      filterType === t
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t === "all" ? "Все типы" : t}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      post.status === "hidden"
                        ? "bg-red-50/50 border-red-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black uppercase text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {post.type}
                        </span>
                        <span className="text-slate-500 font-semibold">{post.category}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">{post.district}</span>
                        {post.isVerified && (
                          <span className="text-emerald-700 bg-emerald-100 text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Проверено
                          </span>
                        )}
                        {post.status === "hidden" && (
                          <span className="text-red-700 bg-red-100 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                            Скрыт
                          </span>
                        )}
                      </div>

                      <div className="font-black text-slate-900 text-sm">{post.title}</div>
                      <p className="text-slate-500 line-clamp-1">{post.description}</p>
                      <div className="text-[11px] text-slate-400">
                        Автор: {post.authorName} • Бюджет: {post.price || "—"} ₽
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleModerate(post.id, "verify")}
                        className={`p-2 rounded-xl border transition-colors ${
                          post.isVerified
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                        title="Подтвердить статус 'Проверено'"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>

                      {post.status === "hidden" ? (
                        <button
                          onClick={() => handleModerate(post.id, "approve")}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                        >
                          Одобрить
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerate(post.id, "hide")}
                          className="p-2 bg-slate-100 hover:bg-amber-100 text-amber-700 rounded-xl"
                          title="Скрыть публикацию"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleModerate(post.id, "delete")}
                        className="p-2 bg-slate-100 hover:bg-red-100 text-red-700 rounded-xl"
                        title="Удалить навсегда"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Reports Queue */}
          {activeTab === "reports" && (
            <div className="space-y-3 text-xs">
              {reports.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  Нет активных жалоб от пользователей.
                </div>
              ) : (
                reports.map((r: ReportItem) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-[10px] px-2 py-0.5 rounded ${
                            r.status === "open"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {r.status === "open" ? "Открыта" : "Рассмотрена"}
                        </span>
                        <span className="font-bold text-slate-800">{r.reason}</span>
                      </div>
                      <div className="text-slate-900 font-bold mt-1">Пост: «{r.postTitle}»</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleString("ru-RU")}
                      </div>
                    </div>

                    {r.status === "open" && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleResolveReport(r.id, "resolved")}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
                        >
                          Решено
                        </button>
                        <button
                          onClick={() => handleResolveReport(r.id, "dismissed")}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold"
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. Users list */}
          {activeTab === "users" && (
            <div className="space-y-2 text-xs">
              {[
                { id: "u-nsk-101", name: "Сергей Мастеров", role: "executor", rating: 4.9 },
                { id: "u-nsk-102", name: "Кофейня «Красный Факел»", role: "business", rating: 4.8 },
                { id: "u-nsk-103", name: "Елена Смирнова", role: "user", rating: 5.0 },
                { id: "u-nsk-104", name: "Михаил Ремонтников", role: "executor", rating: 4.7 },
              ].map((u) => {
                const isBlocked = blockedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Роль: {u.role} • ⭐ {u.rating}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleBlock(u.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 ${
                        isBlocked
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{isBlocked ? "Разблокировать" : "Заблокировать"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Data management */}
          {activeTab === "data" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 text-sm">
                  Эталонные данные Новосибирска (55+ записей)
                </h4>
                <p className="text-slate-600">
                  Включает реальные районы (Октябрьский, Центральный, Ленинский и др.), скидки кофеен, городские отключения, ремонты и события скверов.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleResetData}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                  >
                    Сбросить к исходным записям
                  </button>
                  <button
                    onClick={handleClearData}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors"
                  >
                    Очистить все посты
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
