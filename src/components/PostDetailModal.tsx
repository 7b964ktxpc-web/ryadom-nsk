import React, { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  Navigation,
  Share2,
  Bookmark,
  Flag,
  CheckCircle,
  Star,
  Zap,
  Phone,
  MessageSquare,
  AlertTriangle,
  Building,
  UserCheck,
} from "lucide-react";
import { Post, PostResponse } from "../types";
import {
  calculateDistanceMeters,
  formatDistance,
  get2GisUrl,
  getYandexMapsUrl,
} from "../utils/geo";
import {
  boostPost,
  deletePost,
  getCurrentUser,
  getSavedPostIds,
  reportPost,
  toggleSavePost,
  updateResponseStatus,
  addReview,
} from "../services/storage";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  userCoordinates: [number, number];
  onClose: () => void;
  onOpenRespond: (post: Post) => void;
  onPostUpdated?: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  userCoordinates,
  onClose,
  onOpenRespond,
  onPostUpdated,
}) => {
  const currentUser = getCurrentUser();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Спам или неактуально");
  const [reportSent, setReportSent] = useState(false);
  const [boostSuccess, setBoostSuccess] = useState(false);

  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewedRespIds, setReviewedRespIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !post) return null;

  const isAuthor = currentUser.id === post.authorId;
  const isSaved = getSavedPostIds().includes(post.id);

  const meters = calculateDistanceMeters(userCoordinates, post.coordinates);
  const formattedDist = formatDistance(meters);

  const handleBookmark = () => {
    toggleSavePost(post.id);
    if (onPostUpdated) onPostUpdated();
  };

  const handleBoost = () => {
    boostPost(post.id);
    setBoostSuccess(true);
    setTimeout(() => setBoostSuccess(false), 3000);
    if (onPostUpdated) onPostUpdated();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    deletePost(post.id);
    onClose();
    if (onPostUpdated) onPostUpdated();
  };

  const handleAcceptResponse = (respId: string) => {
    updateResponseStatus(post.id, respId, "accepted");
    if (onPostUpdated) onPostUpdated();
  };

  const handleReviewSubmit = (targetUserId: string, respId: string) => {
    if (!reviewComment.trim()) return;
    addReview(targetUserId, reviewRating, reviewComment.trim());
    setReviewedRespIds((prev) => [...prev, respId]);
    setReviewComment("");
    if (onPostUpdated) onPostUpdated();
  };

  const handleSendReport = () => {
    reportPost(post.id, reportReason);
    setReportSent(true);
    setTimeout(() => {
      setReportSent(false);
      setReportModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
              {post.type === "request"
                ? "Запрос помощи"
                : post.type === "deal"
                ? "Скидка бизнеса"
                : post.type === "event"
                ? "Событие"
                : post.type === "alert"
                ? "Городское оповещение"
                : "Объявление соседей"}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {post.category}
            </span>
            {post.isBoosted && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                <Zap className="w-3 h-3 fill-amber-500" /> В ТОПЕ
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl transition-colors ${
                isSaved ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:bg-slate-100"
              }`}
              title="Сохранить в избранное"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`} />
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Пожаловаться"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Main Title & Distance */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 mb-1.5">
              <span className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {formattedDist} от вас
              </span>
              <span>•</span>
              <span className="text-slate-500 font-medium">
                район {post.district}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {post.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              📍 {post.approxAddress}
            </p>
          </div>

          {/* Pricing & Timing Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {post.type === "request" ? "Бюджет" : "Стоимость"}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {post.price !== undefined
                    ? post.price === 0
                      ? "Бесплатно"
                      : `${post.price.toLocaleString("ru-RU")} ₽`
                    : "По договоренности"}
                </span>
                {post.originalPrice && post.originalPrice > (post.price || 0) && (
                  <span className="text-sm text-slate-400 line-through">
                    {post.originalPrice.toLocaleString("ru-RU")} ₽
                  </span>
                )}
                {post.discountPercent && (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    −{post.discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {post.time && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Срок / Время
                </span>
                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {post.date ? `${post.date}, ` : ""}
                  {post.time}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Описание
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {post.description}
            </p>
          </div>

          {/* Map routes (2GIS & Yandex Maps) */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Маршрут на картах Новосибирска
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={get2GisUrl(post.coordinates, `${post.title} Новосибирск`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Открыть в 2ГИС</span>
              </a>
              <a
                href={getYandexMapsUrl(post.coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Яндекс Карты</span>
              </a>
            </div>
          </div>

          {/* Author Card */}
          <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                alt={post.authorName}
                className="w-12 h-12 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{post.businessName || post.authorName}</span>
                  {post.isVerified && (
                    <UserCheck className="w-4 h-4 text-emerald-600" title="Подтвержден" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {post.authorRating || 4.9}
                  </span>
                  <span>•</span>
                  <span>{post.authorCompletedCount || 12} завершенных заказов</span>
                </div>
              </div>
            </div>
          </div>

          {/* Author Controls: Received Responses & Boost (#16) */}
          {isAuthor && (
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-amber-900">
                    Управление вашей публикацией
                  </h4>
                  <p className="text-xs text-amber-700">
                    Получено откликов: {post.responses?.length || 0}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBoost}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Поднять в ТОП</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      confirmDelete
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-red-100 hover:bg-red-200 text-red-700"
                    }`}
                  >
                    {confirmDelete ? "Подтвердить удаление" : "Удалить"}
                  </button>
                </div>
              </div>

              {boostSuccess && (
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Публикация успешно поднята в ТОП на 24 часа!
                </div>
              )}

              {/* Received Responses List */}
              {post.responses && post.responses.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold text-slate-700">
                    Отклики от мастеров и соседей:
                  </h5>
                  {post.responses.map((resp: PostResponse) => (
                    <div
                      key={resp.id}
                      className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={resp.userAvatar}
                            alt={resp.userName}
                            className="w-7 h-7 rounded-lg object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-slate-900">
                              {resp.userName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              ⭐ {resp.userRating} • {resp.userCompletedCount} заказов
                            </div>
                          </div>
                        </div>

                        {resp.offerPrice && (
                          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {resp.offerPrice.toLocaleString("ru-RU")} ₽
                          </span>
                        )}
                      </div>

                      <p className="text-slate-700 italic">«{resp.message}»</p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {resp.phone || "Номер в профиле"}
                        </span>

                        {resp.status === "accepted" ? (
                          <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Выбран исполнителем
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcceptResponse(resp.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                          >
                            Выбрать мастера
                          </button>
                        )}
                      </div>

                      {/* Review form if accepted */}
                      {resp.status === "accepted" && (
                        <div className="mt-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                          {reviewedRespIds.includes(resp.id) ? (
                            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              Отзыв успешно добавлен в профиль мастера!
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-emerald-950">
                                  Оценить работу мастера:
                                </span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewRating(star)}
                                      className="p-0.5 focus:outline-hidden"
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          star <= reviewRating
                                            ? "fill-amber-400 text-amber-500"
                                            : "text-slate-300"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                  <span className="text-xs font-bold text-slate-700 ml-1">
                                    {reviewRating} из 5
                                  </span>
                                </div>
                              </div>
                              <textarea
                                rows={2}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Напишите пару слов: как всё прошло, довольны ли результатом?"
                                className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleReviewSubmit(resp.userId, resp.id)}
                                  disabled={!reviewComment.trim()}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all"
                                >
                                  Оставить отзыв
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Пока нет откликов. Они появятся здесь, как только мастера в радиусе увидят задачу.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Footer for non-authors */}
        {!isAuthor && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500">
              {post.type === "request"
                ? "Вы можете предложить помощь или услугу"
                : "Покажите публикацию на кассе или свяжитесь"}
            </div>

            {post.type === "request" ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenRespond(post);
                }}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all"
              >
                Откликнуться на задачу
              </button>
            ) : (
              <a
                href={get2GisUrl(post.coordinates, `${post.title} Новосибирск`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all"
              >
                Построить маршрут
              </a>
            )}
          </div>
        )}

        {/* Report Modal overlay */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl">
              <h3 className="font-bold text-sm text-slate-900">
                Пожаловаться на публикацию
              </h3>
              {reportSent ? (
                <div className="py-4 text-center text-emerald-600 font-bold text-xs">
                  ✓ Спасибо! Модераторы «РЯДОМ НСК» проверят публикацию.
                </div>
              ) : (
                <>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    <option value="Спам или реклама">Спам или реклама</option>
                    <option value="Недостоверная информация">Недостоверная информация</option>
                    <option value="Уже неактуально">Уже неактуально</option>
                    <option value="Нарушение правил или мошенничество">
                      Нарушение правил или мошенничество
                    </option>
                  </select>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setReportModalOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-500"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSendReport}
                      className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl"
                    >
                      Отправить
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
