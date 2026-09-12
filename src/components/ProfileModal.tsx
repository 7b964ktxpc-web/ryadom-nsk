import React, { useState } from "react";
import {
  X,
  User,
  Star,
  Shield,
  Briefcase,
  Wrench,
  Bookmark,
  CheckCircle,
  Zap,
  MapPin,
  Phone,
  Send,
  Trash2,
  Settings,
  Flame,
} from "lucide-react";
import { DistrictName, Post, UserProfile } from "../types";
import { NOVOSIBIRSK_DISTRICTS } from "../utils/geo";
import {
  boostPost,
  deletePost,
  getCurrentUser,
  getSavedPostIds,
  getStoredPosts,
  getStoredReviews,
  switchRole,
  updateCurrentUser,
} from "../services/storage";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  onSelectPost: (post: Post) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onSelectPost,
}) => {
  const [user, setUser] = useState<UserProfile>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<"posts" | "responses" | "saved" | "reviews" | "pro">("posts");
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone || "");
  const [editTelegram, setEditTelegram] = useState(user.telegram || "");
  const [editDistrict, setEditDistrict] = useState<DistrictName>(user.district || "Октябрьский");
  const [editBusinessName, setEditBusinessName] = useState(user.businessDetails?.name || "Кофейня «Красный Факел»");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const allPosts = getStoredPosts();
  const myPosts = allPosts.filter((p) => p.authorId === user.id);
  const savedIds = getSavedPostIds();
  const savedPosts = allPosts.filter((p) => savedIds.includes(p.id));
  const reviews = getStoredReviews();

  // Find posts where user has submitted a response
  const myResponses: Array<{ post: Post; response: any }> = [];
  allPosts.forEach((p) => {
    p.responses?.forEach((r) => {
      if (r.userId === user.id) {
        myResponses.push({ post: p, response: r });
      }
    });
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateCurrentUser({
      name: editName.trim() || user.name,
      phone: editPhone.trim(),
      telegram: editTelegram.trim(),
      district: editDistrict,
      businessDetails:
        user.role === "business"
          ? {
              name: editBusinessName,
              description: "Локальный бизнес в Новосибирске",
              category: "Кафе",
              address: "ул. Ленина, 12",
              phone: editPhone,
              schedule: "Ежедневно 08:00 – 22:00",
            }
          : undefined,
    });
    setUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const showActionNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleTogglePro = () => {
    const updated = updateCurrentUser({ isPro: !user.isPro });
    setUser(updated);
    showActionNotice(
      !user.isPro
        ? "✓ Подписка PRO успешно активирована! Золотой бейдж присвоен вашему профилю."
        : "Подписка PRO приостановлена."
    );
  };

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
    showActionNotice("Публикация удалена из ленты.");
  };

  const handleBoost = (postId: string) => {
    boostPost(postId);
    showActionNotice("⚡ Публикация поднята в ТОП на 24 часа!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Profile Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-50 to-rose-50/30">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {user.name}
                </h2>
                {user.isPro && (
                  <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-600" /> PRO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {user.rating}
                </span>
                <span>•</span>
                <span>{user.completedOrdersCount} выполненных заказов</span>
                <span>•</span>
                <span className="text-rose-600 font-medium">{user.district} район</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Role Switcher tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Роль в приложении:
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => {
                const u = switchRole("user");
                setUser(u);
              }}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                user.role === "user" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              <User className="w-3 h-3" /> Житель
            </button>
            <button
              onClick={() => {
                const u = switchRole("executor");
                setUser(u);
              }}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                user.role === "executor" ? "bg-amber-500 text-white shadow-2xs" : "text-slate-500"
              }`}
            >
              <Wrench className="w-3 h-3" /> Мастер
            </button>
            <button
              onClick={() => {
                const u = switchRole("business");
                setUser(u);
              }}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                user.role === "business" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-500"
              }`}
            >
              <Briefcase className="w-3 h-3" /> Бизнес
            </button>
            <button
              onClick={() => {
                const u = switchRole("admin");
                setUser(u);
                onClose();
                onOpenAdmin();
              }}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                user.role === "admin" ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-500"
              }`}
            >
              <Shield className="w-3 h-3" /> Админ
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-100 overflow-x-auto shrink-0 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-2.5 px-2 border-b-2 transition-all shrink-0 ${
              activeTab === "posts"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Мои публикации ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`pb-2.5 px-2 border-b-2 transition-all shrink-0 ${
              activeTab === "responses"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Мои отклики ({myResponses.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-2.5 px-2 border-b-2 transition-all shrink-0 ${
              activeTab === "saved"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Сохраненное ({savedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2.5 px-2 border-b-2 transition-all shrink-0 ${
              activeTab === "reviews"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Отзывы ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("pro")}
            className={`pb-2.5 px-2 border-b-2 transition-all shrink-0 ${
              activeTab === "pro"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            ⚡ PRO и монетизация
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Tab 1: My Posts */}
          {activeTab === "posts" && (
            <div className="space-y-3">
              {myPosts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Вы пока не создали публикаций в «РЯДОМ НСК».
                </div>
              ) : (
                myPosts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-600 uppercase text-[10px]">
                          {p.category}
                        </span>
                        {p.isBoosted && (
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-black">
                            ТОП
                          </span>
                        )}
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{p.district} район</span>
                      </div>
                      <div
                        onClick={() => {
                          onClose();
                          onSelectPost(p);
                        }}
                        className="font-black text-sm text-slate-900 hover:text-rose-600 cursor-pointer"
                      >
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Откликов: {p.responses?.length || 0} • Просмотров: {p.viewsCount || 1}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleBoost(p.id)}
                        className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl"
                        title="Поднять в ТОП"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(p.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: My Responses */}
          {activeTab === "responses" && (
            <div className="space-y-3">
              {myResponses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Вы пока не откликались на чужие заявки.
                </div>
              ) : (
                myResponses.map(({ post, response }, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{post.title}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          response.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {response.status === "accepted" ? "Принят заказчиком" : "Ожидает"}
                      </span>
                    </div>
                    <p className="text-slate-600 italic">«{response.message}»</p>
                    {response.offerPrice && (
                      <div className="text-slate-900 font-bold">
                        Предложенная цена: {response.offerPrice.toLocaleString("ru-RU")} ₽
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Saved / Bookmarks */}
          {activeTab === "saved" && (
            <div className="space-y-3">
              {savedPosts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Нет сохраненных публикаций. Нажимайте закладку на карточках!
                </div>
              ) : (
                savedPosts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectPost(p);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-rose-50/60 rounded-2xl border border-slate-200 cursor-pointer text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-600 uppercase text-[10px]">
                        {p.category}
                      </span>
                      <span className="text-slate-500">{p.district} район</span>
                    </div>
                    <div className="font-black text-sm text-slate-900">{p.title}</div>
                    {p.price !== undefined && (
                      <div className="font-bold text-slate-900">
                        {p.price === 0 ? "Бесплатно" : `${p.price.toLocaleString("ru-RU")} ₽`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-amber-950">
                    Средний рейтинг: ⭐ {user.rating} из 5
                  </div>
                  <div className="text-xs text-amber-800">
                    На основе {reviews.length} подтвержденных отзывов заказчиков
                  </div>
                </div>
              </div>

              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.authorAvatar}
                        alt={rev.authorName}
                        className="w-6 h-6 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-bold text-slate-800">{rev.authorName}</span>
                    </div>
                    <span className="text-amber-600 font-bold">⭐ {rev.rating}.0</span>
                  </div>
                  <p className="text-slate-600">«{rev.comment}»</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: PRO and Monetization */}
          {activeTab === "pro" && (
            <div className="space-y-4 text-xs">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                    Монетизация платформы
                  </span>
                  <span className="text-[10px] font-bold bg-black/20 text-amber-100 px-2 py-0.5 rounded-full">
                    Премиум статус
                  </span>
                </div>
                <h3 className="text-lg font-black">Подписка «РЯДОМ PRO»</h3>
                <p className="text-amber-100 text-xs leading-relaxed">
                  Дает золотой бейдж доверия, безлимитные отклики на заявки, расширенную аналитику просмотров и 3 бесплатных поднятия в ТОП в месяц.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="font-black text-base block">490 ₽ / месяц</span>
                    <span className="text-[10px] text-amber-200">Активация в 1 клик</span>
                  </div>
                  <button
                    onClick={handleTogglePro}
                    className="px-4 py-2 bg-white text-amber-900 font-black rounded-xl shadow-xs active:scale-95 transition-all"
                  >
                    {user.isPro ? "Отключить PRO" : "Подключить PRO"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-slate-900">
                      ⚡ Разовое поднятие в ТОП
                    </h4>
                    <span className="text-[10px] text-slate-400">Продвижение</span>
                  </div>
                  <p className="text-slate-500 mb-2">
                    Поднимает карточку на 1-е место в радиусе на 24 часа. Доступно из карточки вашей публикации.
                  </p>
                  <span className="font-bold text-rose-600">99 ₽ / раз</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-slate-900">
                      🏢 Бизнес-пакет района
                    </h4>
                    <span className="text-[10px] text-slate-400">Подключение</span>
                  </div>
                  <p className="text-slate-500 mb-2">
                    Баннер в верху района, карточка скидки и push-уведомления соседям.
                  </p>
                  <span className="font-bold text-rose-600">1 490 ₽ / мес (заявка)</span>
                </div>
              </div>
            </div>
          )}

          {/* User Details Settings Edit Form */}
          <form onSubmit={handleSaveProfile} className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Настройки контактных данных
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Имя</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telegram (username)
                </label>
                <input
                  type="text"
                  value={editTelegram}
                  onChange={(e) => setEditTelegram(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Основной район проживания
                </label>
                <select
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value as DistrictName)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                >
                  {NOVOSIBIRSK_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} район
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {user.role === "business" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Название бизнеса / заведения
                </label>
                <input
                  type="text"
                  value={editBusinessName}
                  onChange={(e) => setEditBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Данные сохранены!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Сохранить изменения
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
