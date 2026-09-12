import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Flame,
  Tag,
  Calendar,
  Gift,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Bookmark,
  Share2,
  ExternalLink,
  Navigation,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Post } from "../types";
import {
  calculateDistanceMeters,
  formatDistance,
  get2GisUrl,
  getYandexMapsUrl,
} from "../utils/geo";
import {
  getCurrentUser,
  getSavedPostIds,
  toggleSavePost,
} from "../services/storage";

interface PostCardProps {
  post: Post;
  userCoordinates: [number, number];
  onOpenDetail: (post: Post) => void;
  onRespond: (post: Post) => void;
  onBoost?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  userCoordinates,
  onOpenDetail,
  onRespond,
  onBoost,
}) => {
  const savedIds = getSavedPostIds();
  const isSaved = savedIds.includes(post.id);
  const currentUser = getCurrentUser();
  const isAuthor = currentUser.id === post.authorId;

  const [copied, setCopied] = useState(false);

  // Dynamic distance calculation
  const meters = calculateDistanceMeters(userCoordinates, post.coordinates);
  const formattedDist = formatDistance(meters);

  // Formatted creation time
  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "только что";
    if (mins < 60) return `${mins} мин назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч назад`;
    return `${Math.floor(hours / 24)} дн назад`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `РЯДОМ НСК: ${post.title} в районе ${post.district}!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavePost(post.id);
  };

  // Badge styling per post type
  const getTypeBadge = () => {
    if (post.type === "request") {
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md ${
          post.urgency === "high"
            ? "bg-rose-100 text-rose-700 border border-rose-200"
            : "bg-amber-100 text-amber-800"
        }`}>
          <Flame className="w-3 h-3" />
          {post.urgency === "high" ? "СРОЧНО" : "ЗАПРОС"}
        </span>
      );
    }
    if (post.type === "deal") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Tag className="w-3 h-3" />
          {post.discountPercent ? `−${post.discountPercent}% СКИДКА` : "ВЫГОДНО"}
        </span>
      );
    }
    if (post.type === "event") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
          <Calendar className="w-3 h-3" />
          СОБЫТИЕ
        </span>
      );
    }
    if (post.type === "alert") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          ВАЖНО
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
        <HeartHandshake className="w-3 h-3 text-rose-500" />
        СОСЕДИ
      </span>
    );
  };

  return (
    <div
      onClick={() => onOpenDetail(post)}
      className={`relative bg-white rounded-2xl p-4 border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between ${
        post.isBoosted
          ? "border-amber-300 ring-1 ring-amber-200 bg-gradient-to-b from-amber-50/40 via-white to-white"
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      <div>
        {/* Top Header: Badge, District, Distance */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getTypeBadge()}
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {post.category}
            </span>
            {post.isBoosted && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded-md">
                <Zap className="w-2.5 h-2.5 fill-amber-500" /> ТОП
              </span>
            )}
            {post.isVerified && (
              <span className="inline-flex items-center text-emerald-600" title="Проверено модерацией">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Distance & Time */}
          <div className="flex items-center gap-2 text-right shrink-0">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-rose-500" />
              {formattedDist}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-base text-slate-900 leading-snug tracking-tight mb-1.5 hover:text-rose-600 transition-colors">
          {post.title}
        </h3>

        {/* District & Landmark address (Privacy safe - #12, #32) */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <span className="font-medium text-slate-700">{post.district} район</span>
          <span>•</span>
          <span className="truncate max-w-[220px] text-slate-500">{post.approxAddress}</span>
        </div>

        {/* Description preview */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {post.description}
        </p>
      </div>

      {/* Footer info & CTA buttons */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Price / Date / Time */}
        <div className="flex items-center gap-2 flex-wrap">
          {post.price !== undefined && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {post.price === 0 ? "Бесплатно" : `${post.price.toLocaleString("ru-RU")} ₽`}
              </span>
              {post.originalPrice && post.originalPrice > post.price && (
                <span className="text-xs text-slate-400 line-through">
                  {post.originalPrice.toLocaleString("ru-RU")} ₽
                </span>
              )}
            </div>
          )}

          {post.time && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{post.time}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            {getTimeAgo(post.createdAt)}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Quick Route 2GIS Link */}
          <a
            href={get2GisUrl(post.coordinates, `${post.title} Новосибирск`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            title="Открыть маршрут в 2ГИС"
          >
            <Navigation className="w-4 h-4" />
          </a>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative"
            title="Поделиться"
          >
            <Share2 className="w-4 h-4" />
            {copied && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                Ссылка скопирована!
              </span>
            )}
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition-colors ${
              isSaved
                ? "text-amber-500 bg-amber-50"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title={isSaved ? "Удалить из сохраненного" : "Сохранить"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`} />
          </button>

          {/* Primary Action Button */}
          {post.type === "request" && !isAuthor ? (
            <button
              id={`respond-btn-${post.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onRespond(post);
              }}
              className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            >
              Откликнуться
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(post);
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
            >
              {post.type === "deal" ? "Посмотреть" : "Подробнее"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
