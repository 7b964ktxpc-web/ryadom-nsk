import React, { useState } from "react";
import {
  X,
  Sparkles,
  Flame,
  PlusCircle,
  Tag,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Coins,
  Check,
  Zap,
} from "lucide-react";
import { DistrictName, PostType } from "../types";
import { NOVOSIBIRSK_DISTRICTS, getApproxCoordinatesForDistrict } from "../utils/geo";
import { createPost, getCurrentUser, getUserPreferences } from "../services/storage";

interface CreatePostModalProps {
  isOpen: boolean;
  initialType?: "urgent_request" | "general";
  onClose: () => void;
  onPostCreated?: () => void;
}

const REQUEST_CATEGORIES = [
  "Ремонт",
  "Перевозка",
  "Уборка",
  "Электрик",
  "Сантехник",
  "Сборка мебели",
  "Компьютер",
  "Животные",
  "Авто",
  "Забрать/доставить",
  "Помощь с ребёнком",
  "Другое",
];

const OFFER_CATEGORIES = [
  "Ремонт",
  "Перевозка",
  "Уборка",
  "Компьютер",
  "Авто",
  "Животные",
  "Сантехник",
  "Сборка мебели",
  "Помощь с ребёнком",
  "Другое",
];

const DEAL_CATEGORIES = [
  "Еда",
  "Кафе",
  "Магазины",
  "Красота",
  "Авто",
  "Спорт",
  "Дети",
  "Услуги",
  "Развлечения",
];

const EVENT_CATEGORIES = [
  "Городские",
  "Бесплатные",
  "Мастер-классы",
  "Выставки",
  "Спорт",
  "Детские",
  "Концерты",
  "Ярмарки",
];

const NEIGHBOR_CATEGORIES = [
  "Отдам",
  "Продам",
  "Куплю",
  "Потеряно",
  "Найдено",
  "Помощь",
  "Животные",
  "Разное",
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  initialType = "general",
  onClose,
  onPostCreated,
}) => {
  const prefs = getUserPreferences();
  const user = getCurrentUser();

  // Mode: "need" (Мне нужно) vs "offer" (Я предлагаю)
  const [activeTab, setActiveTab] = useState<"need" | "offer">(
    initialType === "urgent_request" ? "need" : "need"
  );

  // Sub-kind under "Я предлагаю": service, deal, event, neighbor
  const [offerSubKind, setOfferSubKind] = useState<"service" | "deal" | "event" | "neighbor">(
    user.role === "business" ? "deal" : "service"
  );

  // AI Raw text input state
  const [rawText, setRawText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Электрик");
  const [district, setDistrict] = useState<DistrictName>(prefs.currentDistrict);
  const [approxAddress, setApproxAddress] = useState("");
  const [price, setPrice] = useState<string>("");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [date, setDate] = useState("Сегодня");
  const [time, setTime] = useState("");
  const [isUrgent, setIsUrgent] = useState(initialType === "urgent_request");
  const [description, setDescription] = useState("");
  const [businessName, setBusinessName] = useState(user.businessDetails?.name || "");

  if (!isOpen) return null;

  // AI Raw Text Extraction Handler (#21)
  const handleAiParse = async () => {
    if (!rawText.trim()) return;
    setIsAiLoading(true);
    setAiSuccessMessage(null);

    try {
      const res = await fetch("/api/ai/parse-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (data && data.parsed) {
        const p = data.parsed;
        if (p.title) setTitle(p.title);
        if (p.category) setCategory(p.category);
        if (p.district) setDistrict(p.district);
        if (p.price) setPrice(String(p.price));
        if (p.date) setDate(p.date);
        if (p.time) setTime(p.time);
        if (p.urgency) setIsUrgent(p.urgency === "high");
        if (p.approxAddress) setApproxAddress(p.approxAddress);
        if (p.description) setDescription(p.description);

        setAiSuccessMessage("✨ AI успешно заполнил форму! Проверьте данные и опубликуйте.");
      }
    } catch (err) {
      console.warn("AI parse client fallback:", err);
      // Client basic fallback
      setTitle(rawText.slice(0, 50));
      setDescription(rawText);
      setAiSuccessMessage("Данные перенесены в форму.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let postType: PostType = "request";
    if (activeTab === "need") {
      postType = "request";
    } else {
      if (offerSubKind === "deal") postType = "deal";
      else if (offerSubKind === "event") postType = "event";
      else if (offerSubKind === "neighbor") postType = "neighbor";
      else postType = "offer";
    }

    const coords = getApproxCoordinatesForDistrict(district);

    createPost({
      type: postType,
      title: title.trim(),
      category,
      district,
      approxAddress: approxAddress.trim() || `район ${district}`,
      coordinates: coords,
      price: price ? Number(price) : undefined,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      date,
      time: time.trim() || (isUrgent ? "Срочно" : "В ближайшее время"),
      urgency: isUrgent ? "high" : "normal",
      description: description.trim() || title.trim(),
      businessName: postType === "deal" ? businessName : undefined,
    });

    onClose();
    if (onPostCreated) onPostCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Создать публикацию в НСК
              </h2>
              <p className="text-xs text-slate-500">
                Будет показано людям в районе {district}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Tabs: Мне нужно (Request) vs Я предлагаю (Offer) */}
        <div className="p-4 sm:p-5 pb-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab("need");
                setCategory("Электрик");
              }}
              className={`py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "need"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Мне нужно (Запрос)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("offer");
                setCategory("Ремонт");
              }}
              className={`py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "offer"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Я предлагаю</span>
            </button>
          </div>

          {/* Subkinds under "Я предлагаю" */}
          {activeTab === "offer" && (
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setOfferSubKind("service");
                  setCategory("Ремонт");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  offerSubKind === "service"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🛠 Услуга мастера
              </button>
              <button
                type="button"
                onClick={() => {
                  setOfferSubKind("deal");
                  setCategory("Кафе");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  offerSubKind === "deal"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🛍 Скидка бизнеса
              </button>
              <button
                type="button"
                onClick={() => {
                  setOfferSubKind("event");
                  setCategory("Городские");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  offerSubKind === "event"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🎉 Событие
              </button>
              <button
                type="button"
                onClick={() => {
                  setOfferSubKind("neighbor");
                  setCategory("Отдам");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  offerSubKind === "neighbor"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🎁 Отдам / Продам
              </button>
            </div>
          )}
        </div>

        {/* AI Auto-fill Box (#21) */}
        <div className="p-4 sm:p-5 pt-3">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AI-помощник: вставьте текст задачи
              </span>
              <span className="text-[11px] text-amber-700/80">
                Gemini 3.8 Flash
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Например: Сегодня после 18:00 поднять диван на 5 этаж на Восходе, бюджет 2500"
                className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAiParse}
                disabled={isAiLoading || !rawText.trim()}
                className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {isAiLoading ? (
                  <span className="animate-spin text-sm">⏳</span>
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Заполнить</span>
              </button>
            </div>
            {aiSuccessMessage && (
              <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {aiSuccessMessage}
              </p>
            )}
          </div>
        </div>

        {/* Main Form Fields */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-5 pb-5 space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Заголовок публикации *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Коротко и емко: что нужно или что предлагаете"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden transition-colors"
            />
          </div>

          {/* Category & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
              >
                {activeTab === "need"
                  ? REQUEST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  : offerSubKind === "deal"
                  ? DEAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  : offerSubKind === "event"
                  ? EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  : offerSubKind === "neighbor"
                  ? NEIGHBOR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  : OFFER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Район Новосибирска
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as DistrictName)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
              >
                {NOVOSIBIRSK_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} район
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Approx Address / Landmark (No private apartment numbers - #12, #32) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ориентир или улица (без номера квартиры)
            </label>
            <input
              type="text"
              value={approxAddress}
              onChange={(e) => setApproxAddress(e.target.value)}
              placeholder="Например: ул. Восход / метро Октябрьская / сквер ГПНТБ"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Price & Discount */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeTab === "need" ? "Бюджет (₽)" : "Цена (₽)"}
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            {offerSubKind === "deal" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Старая цена (₽)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="2900"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Скидка %
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Время / Срок
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Сегодня до 20:00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Urgency Checkbox (#3) */}
          <div className="flex items-center gap-2 p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
            <input
              type="checkbox"
              id="urgency-check"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
            />
            <label htmlFor="urgency-check" className="text-xs font-semibold text-rose-900 cursor-pointer">
              ⚡ Срочный запрос (показать в верхнем блоке и уведомить людей в радиусе 1–5 км)
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Подробное описание
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите детали задачи, особенности, удобное время..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all"
            >
              Опубликовать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
