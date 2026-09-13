import React from "react";
import { useConsent } from "../contexts/ConsentContext";
import { Check, Cookie } from "lucide-react";

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
    <div className="fixed bottom-0 left-0 right-0 z-[100] glass border-t border-white/5 p-4 sm:p-6 safe-bottom">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Cookie size={16} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-0.5">Используются файлы cookie</h3>
            <p className="text-text-secondary text-xs mt-0.5 max-w-lg leading-relaxed">
              Мы используем cookies и обрабатываем ваши персональные данные для работы сервиса «РЯДОМ НСК»,
              показа персонализированного контента и аналитики. Подробности в{" "}
              <a href="#" className="text-primary hover:underline">Политике конфиденциальности</a>.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button onClick={handleAcceptOnlyCookies} className="px-4 py-2 glass text-text-secondary font-semibold text-xs rounded-xl hover:bg-white/10 transition-all">
            Только cookies
          </button>
          <button onClick={handleAccept} className="px-4 py-2 bg-primary/10 text-primary font-semibold text-xs rounded-xl hover:bg-primary/20 border border-primary/20 transition-all flex items-center gap-1.5">
            <Check size={14} />
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}
