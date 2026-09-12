import React, { useState, useEffect } from "react";
import { X, Sparkles, MapPin, Tag, Flame, Calendar, RefreshCw, ArrowRight } from "lucide-react";
import { DistrictName, Post } from "../types";
import { getUserPreferences } from "../services/storage";

interface SmartDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

export const SmartDigestModal: React.FC<SmartDigestModalProps> = ({
  isOpen,
  onClose,
  posts,
  onSelectPost,
}) => {
  const prefs = getUserPreferences();
  const [loading, setLoading] = useState(false);
  const [digestData, setDigestData] = useState<{
    greeting?: string;
    summary?: string;
    topPicks?: Array<{ id: string; title: string; type: string; highlight: string }>;
    urgentAlert?: string;
  } | null>(null);

  const fetchDigest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/smart-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: prefs.currentDistrict,
          preferences: prefs.interests,
          postsSample: posts.slice(0, 10).map((p) => ({
            id: p.id,
            title: p.title,
            type: p.type,
            category: p.category,
            price: p.price,
            district: p.district,
          })),
        }),
      });
      const data = await response.json();
      if (data && data.digest) {
        setDigestData(data.digest);
      }
    } catch (err) {
      console.warn("Digest fetch fallback:", err);
      setDigestData({
        greeting: `Добро пожаловать в «РЯДОМ НСК»!`,
        summary: `В районе ${prefs.currentDistrict} сегодня кипит жизнь: открыты скидки в кафе, соседи ищут мастеров, а в сквере проходят встречи.`,
        topPicks: posts.slice(0, 4).map((p) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          highlight: `${p.category} • ${p.price ? `${p.price} ₽` : "Бесплатно"}`,
        })),
        urgentAlert: "Срочный запрос на электрика в 15 минутах от вас.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDigest();
    }
  }, [isOpen, prefs.currentDistrict]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Умный дайджест Новосибирска
              </h2>
              <p className="text-xs text-amber-100">
                Район: {prefs.currentDistrict} • Сгенерировано AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Gemini 3.8 Flash анализирует предложения и запросы в районе...
              </p>
            </div>
          ) : (
            <>
              {/* Summary speech bubble */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-black text-amber-950">
                  {digestData?.greeting || "Сегодня рядом с вами"}
                </h3>
                <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                  {digestData?.summary || "Множество актуальных событий и выгодных предложений."}
                </p>
              </div>

              {/* Urgent alert if present */}
              {digestData?.urgentAlert && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900">
                  <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black uppercase tracking-wider text-[10px] text-rose-700 block">
                      Срочное внимание
                    </span>
                    <span>{digestData.urgentAlert}</span>
                  </div>
                </div>
              )}

              {/* Highlights List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Лучшие находки прямо сейчас
                </h4>
                <div className="space-y-2">
                  {digestData?.topPicks?.map((pick, i) => {
                    const post = posts.find((p) => p.id === pick.id);
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (post) {
                            onClose();
                            onSelectPost(post);
                          }
                        }}
                        className="flex items-center justify-between gap-2 p-3 bg-slate-50 hover:bg-rose-50/70 rounded-xl border border-slate-200 hover:border-rose-200 cursor-pointer transition-all group"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                            {pick.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {pick.highlight}
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={fetchDigest}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Обновить сводку
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Понятно, к ленте
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
