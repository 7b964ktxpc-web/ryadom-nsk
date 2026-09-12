import React from "react";
import { useConsent } from "../contexts/ConsentContext";
import { X, Check, Cookie } from "lucide-react";

export function CookieConsent() {
  const { consent, updateConsent } = useConsent();

  if (consent?.cookies) return null;

  const handleAccept = () => {
    updateConsent({ cookies: true, personalData: true, geoLocation: true, analytics: true });
  };

  const handleAcceptOnlyCookies = () => {
    updateConsent({ cookies: true });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Cookie className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold text-sm">🍪 Используются файлы cookie</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-lg">
              Мы используем cookies и обрабатываем ваши персональные данные (включая геолокацию) для работы сервиса
              «РЯДОМ НСК», показа персонализированного контента и аналитики. Подробности в{" "}
              <a href="#" className="text-amber-400 underline">Политике конфиденциальности</a>.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={handleAcceptOnlyCookies}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Только cookies
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}
