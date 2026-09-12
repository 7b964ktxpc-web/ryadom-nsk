import React, { useState } from "react";
import { X, CheckCircle, Send, MapPin, User, Star, ShieldCheck } from "lucide-react";
import { Post } from "../types";
import { addPostResponse, getCurrentUser } from "../services/storage";

interface ResponseModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResponseModal: React.FC<ResponseModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentUser = getCurrentUser();
  const isOwnPost = currentUser.id === post?.authorId;
  const existingResponse = post?.responses?.find((r) => r.userId === currentUser.id);

  const [message, setMessage] = useState(existingResponse?.message || "");
  const [offerPrice, setOfferPrice] = useState<string>(
    existingResponse?.offerPrice ? String(existingResponse.offerPrice) : post?.price ? String(post.price) : ""
  );
  const [phone, setPhone] = useState(existingResponse?.phone || currentUser.phone || "+7 (913) 000-00-00");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isOwnPost) return;

    addPostResponse(
      post.id,
      message.trim(),
      offerPrice ? Number(offerPrice) : undefined,
      phone.trim()
    );

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Откликнуться на заявку
              </h2>
              <p className="text-xs text-slate-500">
                Автор получит уведомление моментально
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isOwnPost ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              👤
            </div>
            <h3 className="text-base font-black text-slate-900">
              Это ваша собственная заявка
            </h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Вы являетесь автором этой публикации. Чтобы просмотреть отклики мастеров и выбрать исполнителя, откройте подробности заявки.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Понятно
              </button>
            </div>
          </div>
        ) : submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Отклик отправлен!</h3>
            <p className="text-xs text-slate-600">
              Заказчик свяжется с вами или подтвердит выполнение в приложении.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            {existingResponse && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                <span className="text-base leading-none">ℹ️</span>
                <div>
                  <span className="font-bold block">Вы уже откликнулись на эту заявку</span>
                  <span>Ваше предложение на рассмотрении. Вы можете скорректировать цену или сообщение.</span>
                </div>
              </div>
            )}
            {/* Task summary box */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Заказ
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                {post.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  {post.district} район
                </span>
                {post.price && (
                  <span className="font-bold text-slate-900">
                    Бюджет: {post.price.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>
            </div>

            {/* Executor Profile info preview */}
            <div className="flex items-center gap-2.5 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 text-xs">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <span className="text-amber-600 flex items-center gap-0.5 text-[11px]">
                    <Star className="w-3 h-3 fill-amber-400" /> {currentUser.rating}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Выполнено заказов: {currentUser.completedOrdersCount}
                </div>
              </div>
            </div>

            {/* Offer message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ваше сообщение заказчику *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Например: Здравствуйте! Живу рядом, готов подъехать через 20 минут со своим инструментом."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            {/* Price offer */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ваша цена (₽)
                </label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="2000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Телефон для связи *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{existingResponse ? "Обновить отклик" : "Отправить отклик"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
